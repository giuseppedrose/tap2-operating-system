import { NextRequest, NextResponse } from 'next/server';
import { createSyncRun, completeSyncRun, upsertRawRecord, getSupabaseAdmin } from '@/lib/integrations/supabase-admin';
import { FATHOM_MEETING_MAPPINGS, FATHOM_HUBSPOT_MATCHING_STRATEGY } from '@/lib/integrations/mapping/fathom-mapper';

function checkAuth(req: NextRequest): boolean {
  const session = req.cookies.get('tap2_admin_session');
  return Boolean(session?.value && session.value.length >= 32);
}

async function fathomGet(path: string, apiKey: string) {
  const res = await fetch(`https://api.fathom.video/v1${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Fathom API error: ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const apiKey = process.env.FATHOM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ status: 'no_credentials', source: 'fathom', message: 'FATHOM_API_KEY not configured.', records_fetched: 0 });
  }

  let syncRunId: string | null = null;
  try {
    syncRunId = await createSyncRun('fathom', 'discovery');
    // Fetch meetings list — metadata only, no full transcripts
    const meetingsRes = await fathomGet('/calls?limit=20', apiKey);
    const meetings = (meetingsRes.calls ?? meetingsRes.data ?? meetingsRes.items ?? []) as Record<string, unknown>[];

    let written = 0;
    for (const m of meetings) {
      // Store metadata only — omit full transcript content for privacy
      const safePayload = { ...m, transcript: undefined, full_transcript: undefined };
      try { await upsertRawRecord('raw_fathom_meetings', String(m.id ?? m.call_id), safePayload, syncRunId); written++; } catch {}
    }

    const participantEmails = meetings.flatMap(m => {
      const attendees = (m.attendees ?? m.participants ?? []) as Record<string, string>[];
      return attendees.map(a => a.email).filter(Boolean);
    });
    const uniqueDomains = [...new Set(participantEmails.map(e => e.split('@')[1]).filter(Boolean))];

    const meta = {
      meeting_count: meetings.length,
      fields_available: meetings.length ? Object.keys(meetings[0]).filter(k => !['transcript', 'full_transcript'].includes(k)) : [],
      unique_participant_domains: uniqueDomains.slice(0, 20),
      hubspot_matching_strategy: FATHOM_HUBSPOT_MATCHING_STRATEGY,
      has_summary_field: meetings.some(m => 'summary' in m),
      has_action_items: meetings.some(m => 'action_items' in m),
      has_attendees: meetings.some(m => 'attendees' in m || 'participants' in m),
      sample_titles: meetings.slice(0, 5).map(m => m.title ?? m.name ?? '—'),
    };

    await completeSyncRun(syncRunId, 'completed', { fetched: meetings.length, written }, meta);
    return NextResponse.json({ status: 'ok', source: 'fathom', sync_run_id: syncRunId, message: `${meetings.length} meetings discovered (metadata only — no transcript content stored).`, records_fetched: meetings.length, profile: meta, mappings: FATHOM_MEETING_MAPPINGS });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (syncRunId) await completeSyncRun(syncRunId, 'error', { fetched: 0, written: 0 }, {}, msg).catch(() => null);
    return NextResponse.json({ status: 'error', source: 'fathom', message: msg, records_fetched: 0 }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const configured = Boolean(process.env.FATHOM_API_KEY);
  let lastRun = null;
  try {
    const { data } = await getSupabaseAdmin().from('source_sync_runs').select('*').eq('source', 'fathom').order('created_at', { ascending: false }).limit(1).single();
    lastRun = data;
  } catch {}
  return NextResponse.json({ configured, last_run: lastRun });
}
