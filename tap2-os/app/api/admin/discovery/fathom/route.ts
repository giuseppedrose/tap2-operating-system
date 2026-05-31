import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/config/env';
import { createSyncRun, completeSyncRun, upsertRawRecord, upsertDataProfile, getSupabaseAdmin } from '@/lib/integrations/supabase-admin';
import { FATHOM_MEETING_MAPPINGS, FATHOM_HUBSPOT_MATCHING_STRATEGY } from '@/lib/integrations/mapping/fathom-mapper';

function checkAuth(req: NextRequest) { const s = req.cookies.get('tap2_admin_session'); return Boolean(s?.value && s.value.length >= 32); }

async function fGet(path: string): Promise<Record<string, unknown>> {
  const key = ENV.FATHOM_API_KEY; if (!key) throw new Error('Fathom not configured');
  const res = await fetch(`https://api.fathom.video/v1${path}`, { headers: { Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`Fathom ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const key = ENV.FATHOM_API_KEY;
  if (!key) return NextResponse.json({ status: 'no_credentials', source: 'fathom', message: 'Fathom key not found. Check Fathom or FATHOM_API_KEY in Vercel env vars.', records_fetched: 0 });

  let runId: string | null = null;
  try {
    runId = await createSyncRun('fathom', 'discovery');
    const meetingsRes = await fGet('/calls?limit=50');
    const meetings = ((meetingsRes.calls ?? meetingsRes.data ?? meetingsRes.items ?? []) as Record<string, unknown>[]);

    let written = 0;
    const summaryData: Record<string, unknown>[] = [];

    for (const m of meetings) {
      // Strip transcript content — store metadata only
      const safe = { ...m, transcript: undefined, full_transcript: undefined, transcript_text: undefined };
      try { await upsertRawRecord('raw_fathom_meetings', String(m.id ?? m.call_id), safe, runId); written++; } catch {}

      // Try to get summary (no full transcript)
      if (m.id) {
        try {
          const summary = await fGet(`/calls/${m.id}/summary`);
          const safeSummary = { meeting_id: m.id, ...summary, transcript: undefined };
          summaryData.push(safeSummary);
          await upsertRawRecord('raw_fathom_summaries', `${m.id}-summary`, safeSummary, runId, { meeting_id: String(m.id) });
          written++;
        } catch {}
      }
    }

    // Analysis
    const allEmails: string[] = [];
    meetings.forEach(m => {
      const attendees = (m.attendees ?? m.participants ?? []) as Record<string, string>[];
      attendees.forEach(a => { if (a.email) allEmails.push(a.email); });
    });
    const uniqueDomains = [...new Set(allEmails.map(e => e.split('@')[1]).filter(Boolean))];

    // Detect meeting types from titles
    const titles = meetings.map(m => String(m.title ?? m.name ?? '').toLowerCase());
    const demoCount = titles.filter(t => t.includes('demo') || t.includes('presentation')).length;
    const salesCallCount = titles.filter(t => t.includes('call') || t.includes('intro') || t.includes('discovery')).length;
    const followUpCount = titles.filter(t => t.includes('follow') || t.includes('check-in')).length;

    const availableFields = meetings.length > 0 ? Object.keys(meetings[0]).filter(k => !['transcript','full_transcript','transcript_text'].includes(k)) : [];
    const summaryFields = summaryData.length > 0 ? Object.keys(summaryData[0]).filter(k => k !== 'meeting_id') : [];

    const meta = {
      meeting_count: meetings.length,
      summaries_fetched: summaryData.length,
      fields_available: availableFields,
      summary_fields_available: summaryFields,
      unique_participant_domains: uniqueDomains.slice(0, 30),
      has_attendees: meetings.some(m => 'attendees' in m || 'participants' in m),
      has_summaries: summaryData.length > 0,
      has_action_items: summaryData.some(s => 'action_items' in s),
      meeting_type_breakdown: { demos: demoCount, sales_calls: salesCallCount, follow_ups: followUpCount, other: meetings.length - demoCount - salesCallCount - followUpCount },
      sample_titles: meetings.slice(0, 10).map(m => m.title ?? m.name ?? '—'),
      hubspot_matching_strategy: FATHOM_HUBSPOT_MATCHING_STRATEGY,
      data_quality_notes: [
        uniqueDomains.length > 0 ? `${uniqueDomains.length} unique participant domains — can match ${Math.min(uniqueDomains.length, 20)} to HubSpot companies` : 'No participant email domains detected',
        summaryData.length > 0 ? `${summaryData.length} meeting summaries fetched — AI analysis possible with Anthropic` : 'Summary data not available for these meetings',
        demoCount > 0 ? `${demoCount} demo meetings detected — can link to HubSpot deals` : 'No demo meetings in sample',
      ].filter(Boolean),
    };

    await upsertDataProfile('fathom', 'meetings', runId, { record_count: meetings.length, field_count: availableFields.length, fields: availableFields.map(f => ({ name: f, type: 'unknown', population_rate: 100 })), quality_score: Math.min(100, Math.round((meetings.length > 0 ? 50 : 0) + (uniqueDomains.length > 0 ? 30 : 0) + (summaryData.length > 0 ? 20 : 0))), mapping_recommendations: FATHOM_MEETING_MAPPINGS });

    await completeSyncRun(runId, 'completed', { fetched: meetings.length + summaryData.length, written }, meta);
    return NextResponse.json({ status: 'ok', source: 'fathom', sync_run_id: runId,
      message: `${meetings.length} meetings · ${summaryData.length} summaries · ${uniqueDomains.length} participant domains detected (metadata only — no transcripts stored)`,
      records_fetched: meetings.length, profile: meta, mappings: FATHOM_MEETING_MAPPINGS });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (runId) await completeSyncRun(runId, 'error', { fetched: 0, written: 0 }, {}, msg).catch(() => null);
    return NextResponse.json({ status: 'error', source: 'fathom', message: msg, records_fetched: 0 }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const configured = Boolean(ENV.FATHOM_API_KEY);
  let lastRun = null;
  try { const { data } = await getSupabaseAdmin().from('source_sync_runs').select('*').eq('source', 'fathom').order('created_at', { ascending: false }).limit(1).single(); lastRun = data; } catch {}
  return NextResponse.json({ configured, last_run: lastRun });
}
