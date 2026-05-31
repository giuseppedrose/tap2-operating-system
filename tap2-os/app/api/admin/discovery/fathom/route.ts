import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/config/env';
import { createSyncRun, completeSyncRun, upsertRawRecord, upsertDataProfile, getSupabaseAdmin } from '@/lib/integrations/supabase-admin';
import { FATHOM_MEETING_MAPPINGS, FATHOM_HUBSPOT_MATCHING_STRATEGY } from '@/lib/integrations/mapping/fathom-mapper';

function checkAuth(req: NextRequest) { const s = req.cookies.get('tap2_admin_session'); return Boolean(s?.value && s.value.length >= 32); }

// Fathom (meeting recorder) does not publish a public REST API for reading meeting data.
// Their key types are: (1) webhook signing secret — for verifying incoming webhooks,
// (2) no documented read API key exists. Use the MCP Claude integration for meeting access.
// We try one endpoint quickly; if it 4xx or times out, we surface the correct explanation.
async function probeFathomAPI(apiKey: string): Promise<{ url: string; data: Record<string, unknown> } | null> {
  try {
    const res = await fetch('https://api.fathom.video/v1/calls?limit=5', {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json() as Record<string, unknown>;
      return { url: 'https://api.fathom.video/v1/calls', data };
    }
    // 4xx = endpoint exists but rejected key or no API exists
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error_code: 'auth_required', source: 'fathom', message: 'Admin session required.' }, { status: 401 });

  const apiKey = ENV.FATHOM_API_KEY;
  const webhookKey = ENV.FATHOM_WEBHOOK_SECRET;

  if (!apiKey && !webhookKey) {
    return NextResponse.json({ error_code: 'missing_env_var', status: 'no_credentials', source: 'fathom', message: 'Fathom key not found. Check Fathom or FATHOM_API_KEY in Vercel env vars.', records_fetched: 0 });
  }

  // Note: Fathomwebhook looks like a webhook signing secret, not a read API key.
  // Fathom's REST API may require a different key type.
  if (!apiKey && webhookKey) {
    return NextResponse.json({
      error_code: 'insufficient_api_scope',
      status: 'error',
      source: 'fathom',
      message: 'Only Fathomwebhook found — this appears to be a webhook signing secret, not a REST API read key. Fathom may require a separate API key for reading meeting data.',
      advice: [
        'Fathomwebhook is for verifying incoming webhooks FROM Fathom, not for reading data',
        'Check if Fathom provides a separate "API key" or "Personal access token" in their dashboard',
        'The Fathom MCP integration in Claude uses a different auth mechanism',
        'If no read API exists, Fathom data can only be received via webhooks',
      ],
      records_fetched: 0,
    });
  }

  let runId: string | null = null;
  try {
    runId = await createSyncRun('fathom', 'discovery');

    // Probe Fathom API to find the correct endpoint
    const probeResult = await probeFathomAPI(apiKey!);

    if (!probeResult) {
      // API unreachable — provide diagnostic info
      await completeSyncRun(runId, 'error', { fetched: 0, written: 0 }, {}, 'Fathom API endpoint not found');
      return NextResponse.json({
        error_code: 'upstream_api_error',
        status: 'error',
        source: 'fathom',
        message: 'Fathom does not expose a public REST API for reading meeting data. Only webhook delivery is supported. Use the Fathom MCP integration in Claude for meeting access.',
        advice: [
          'The Fathom key in your Vercel env vars is a webhook signing secret, not a read API key',
          'Fathom meeting data is readable via the Fathom MCP Claude integration (already connected)',
          'To push meetings into Supabase, set up a Fathom webhook → /api/webhooks/fathom',
        ],
        records_fetched: 0,
      });
    }

    // We found a working endpoint
    const meetings = (probeResult.data.calls ?? probeResult.data.recordings ?? probeResult.data.items ?? []) as Record<string, unknown>[];
    let written = 0;

    for (const m of meetings) {
      // Strip any transcript content for privacy
      const safe: Record<string, unknown> = { ...m };
      delete safe.transcript; delete safe.full_transcript; delete safe.transcript_text;
      try { await upsertRawRecord('raw_fathom_meetings', String(m.id ?? m.call_id ?? m.recording_id), safe, runId); written++; } catch {}
    }

    // Try to get summaries
    const summaryCount = 0;
    const allEmails: string[] = [];
    meetings.forEach(m => {
      const attendees = (m.attendees ?? m.participants ?? []) as Record<string, string>[];
      attendees.forEach(a => { if (a.email) allEmails.push(a.email); });
    });
    const uniqueDomains = [...new Set(allEmails.map(e => e.split('@')[1]).filter(Boolean))];

    const meta = {
      api_endpoint_found: probeResult.url,
      meeting_count: meetings.length,
      summaries_fetched: summaryCount,
      unique_participant_domains: uniqueDomains.slice(0, 30),
      fields_available: meetings.length > 0 ? Object.keys(meetings[0]).filter(k => !['transcript','full_transcript','transcript_text'].includes(k)) : [],
      hubspot_matching_strategy: FATHOM_HUBSPOT_MATCHING_STRATEGY,
    };

    await upsertDataProfile('fathom', 'meetings', runId, { record_count: meetings.length, field_count: meta.fields_available.length, fields: meta.fields_available.map(f => ({ name: f, type: 'unknown', population_rate: 100 })), quality_score: meetings.length > 0 ? 70 : 20, mapping_recommendations: FATHOM_MEETING_MAPPINGS });
    await completeSyncRun(runId, 'completed', { fetched: meetings.length, written }, meta);

    return NextResponse.json({ status: 'ok', source: 'fathom', sync_run_id: runId,
      message: `${meetings.length} meetings discovered from ${probeResult.url}`,
      records_fetched: meetings.length, profile: meta });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (runId) await completeSyncRun(runId, 'error', { fetched: 0, written: 0 }, {}, msg).catch(() => null);
    return NextResponse.json({ error_code: 'upstream_api_error', status: 'error', source: 'fathom', message: msg, records_fetched: 0 }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const configured = Boolean(ENV.FATHOM_API_KEY ?? ENV.FATHOM_WEBHOOK_SECRET);
  const keyType = ENV.FATHOM_API_KEY ? 'api_key' : ENV.FATHOM_WEBHOOK_SECRET ? 'webhook_secret_only' : 'missing';
  let lastRun = null;
  try { const { data } = await getSupabaseAdmin().from('source_sync_runs').select('*').eq('source', 'fathom').order('created_at', { ascending: false }).limit(1).single(); lastRun = data; } catch {}
  return NextResponse.json({ configured, key_type: keyType, last_run: lastRun });
}
