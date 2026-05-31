import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/config/env';
import { createSyncRun, completeSyncRun, upsertRawRecord, upsertDataProfile, getSupabaseAdmin } from '@/lib/integrations/supabase-admin';
import { FATHOM_MEETING_MAPPINGS, FATHOM_HUBSPOT_MATCHING_STRATEGY } from '@/lib/integrations/mapping/fathom-mapper';

function checkAuth(req: NextRequest) { const s = req.cookies.get('tap2_admin_session'); return Boolean(s?.value && s.value.length >= 32); }

// Fathom.video API probe — try multiple endpoints and auth formats.
// Their docs are sparse; we try the most likely combinations with short timeouts.
type ProbeResult = { url: string; data: Record<string, unknown>; authMethod: string } | null;

async function tryFetch(url: string, headers: Record<string, string>): Promise<Response | null> {
  try {
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(4000) });
    return r;
  } catch { return null; }
}

async function probeFathomAPI(apiKey: string): Promise<ProbeResult> {
  const endpoints = [
    'https://api.fathom.video/v1/calls',
    'https://api.fathom.video/v1/recordings',
    'https://api.fathom.video/v1/meetings',
  ];
  const authVariants = [
    { key: 'Authorization', value: `Bearer ${apiKey}`, label: 'Bearer' },
    { key: 'X-API-Key', value: apiKey, label: 'X-API-Key' },
    { key: 'Authorization', value: `Token ${apiKey}`, label: 'Token' },
  ];

  for (const endpoint of endpoints) {
    for (const auth of authVariants) {
      const r = await tryFetch(`${endpoint}?limit=10`, { [auth.key]: auth.value });
      if (!r) continue;
      if (r.ok) {
        const data = await r.json() as Record<string, unknown>;
        return { url: endpoint, data, authMethod: auth.label };
      }
      // 401/403 on a known endpoint means auth format is wrong for that endpoint — keep trying
      // 404 means endpoint doesn't exist — try next
      // 5xx means server error — try next
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error_code: 'auth_required', source: 'fathom', message: 'Admin session required.' }, { status: 401 });

  const apiKey = ENV.FATHOM_API_KEY;
  const webhookKey = ENV.FATHOM_WEBHOOK_SECRET;

  if (!apiKey && !webhookKey) {
    return NextResponse.json({ error_code: 'missing_env_var', status: 'no_credentials', source: 'fathom', message: 'Fathom key not found. Check Fathom or FATHOM_API_KEY in Vercel env vars.', records_fetched: 0 });
  }

  if (!apiKey && webhookKey) {
    return NextResponse.json({
      error_code: 'insufficient_api_scope',
      status: 'error',
      source: 'fathom',
      message: 'Only Fathomwebhook found. This is a webhook signing secret, not a read API key. Add a Fathom API key (Fathom var in Vercel) to enable REST discovery.',
      advice: [
        'Go to Fathom dashboard → Settings → Integrations or API',
        'Generate a personal access token or API key',
        'Add it to Vercel as the "Fathom" environment variable',
      ],
      records_fetched: 0,
    });
  }

  let runId: string | null = null;
  try {
    runId = await createSyncRun('fathom', 'discovery');

    const probeResult = await probeFathomAPI(apiKey!);

    if (!probeResult) {
      await completeSyncRun(runId, 'error', { fetched: 0, written: 0 }, {}, 'No Fathom API endpoint responded successfully');
      return NextResponse.json({
        error_code: 'upstream_api_error',
        status: 'error',
        source: 'fathom',
        message: 'Tried Bearer, X-API-Key, and Token auth on /v1/calls, /v1/recordings, /v1/meetings — none returned 200. The key may be a webhook secret, or Fathom requires a different auth mechanism.',
        endpoints_tried: ['/v1/calls', '/v1/recordings', '/v1/meetings'],
        auth_tried: ['Bearer', 'X-API-Key', 'Token'],
        advice: [
          'Confirm the key in Vercel "Fathom" var is a REST API key, not a webhook secret',
          'Check Fathom dashboard for the correct API key format',
          'Fathom MCP integration works separately via Claude — this route is for bulk data ingestion',
        ],
        records_fetched: 0,
      });
    }

    const meetings = (
      probeResult.data.calls ??
      probeResult.data.recordings ??
      probeResult.data.meetings ??
      probeResult.data.items ??
      probeResult.data.data ??
      []
    ) as Record<string, unknown>[];
    let written = 0;

    for (const m of meetings) {
      const safe: Record<string, unknown> = { ...m };
      delete safe.transcript; delete safe.full_transcript; delete safe.transcript_text;
      try { await upsertRawRecord('raw_fathom_meetings', String(m.id ?? m.call_id ?? m.recording_id), safe, runId); written++; } catch {}
    }

    const allEmails: string[] = [];
    meetings.forEach(m => {
      const attendees = (m.attendees ?? m.participants ?? []) as Record<string, string>[];
      attendees.forEach((a: Record<string, string>) => { if (a.email) allEmails.push(a.email); });
    });
    const uniqueDomains = [...new Set(allEmails.map((e: string) => e.split('@')[1]).filter(Boolean))];

    const meta = {
      api_endpoint: probeResult.url,
      auth_method: probeResult.authMethod,
      meeting_count: meetings.length,
      unique_participant_domains: uniqueDomains.slice(0, 30),
      fields_available: meetings.length > 0 ? Object.keys(meetings[0]).filter(k => !['transcript','full_transcript','transcript_text'].includes(k)) : [],
      hubspot_matching_strategy: FATHOM_HUBSPOT_MATCHING_STRATEGY,
    };

    await upsertDataProfile('fathom', 'meetings', runId, { record_count: meetings.length, field_count: meta.fields_available.length, fields: meta.fields_available.map(f => ({ name: f, type: 'unknown', population_rate: 100 })), quality_score: meetings.length > 0 ? 70 : 20, mapping_recommendations: FATHOM_MEETING_MAPPINGS });
    await completeSyncRun(runId, 'completed', { fetched: meetings.length, written }, meta);

    return NextResponse.json({ status: 'ok', source: 'fathom', sync_run_id: runId,
      message: `${meetings.length} meetings discovered via ${probeResult.url} (${probeResult.authMethod} auth)`,
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
