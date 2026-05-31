import { NextRequest, NextResponse } from 'next/server';
import { createSyncRun, completeSyncRun, upsertRawRecord, getSupabaseAdmin } from '@/lib/integrations/supabase-admin';
import { INSTANTLY_CAMPAIGN_MAPPINGS, INSTANTLY_NAMING_CONVENTION } from '@/lib/integrations/mapping/instantly-mapper';

function checkAuth(req: NextRequest): boolean {
  const session = req.cookies.get('tap2_admin_session');
  return Boolean(session?.value && session.value.length >= 32);
}

async function instantlyGet(path: string, apiKey: string) {
  const res = await fetch(`https://api.instantly.ai/api/v1${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Instantly API error: ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const apiKey = process.env.INSTANTLY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ status: 'no_credentials', source: 'instantly', message: 'INSTANTLY_API_KEY not configured.', records_fetched: 0 });
  }

  let syncRunId: string | null = null;
  try {
    syncRunId = await createSyncRun('instantly', 'discovery');
    const campaignsRes = await instantlyGet('/campaign/list?limit=50&skip=0', apiKey);
    const campaigns = (campaignsRes.campaigns ?? campaignsRes.data ?? []) as Record<string, unknown>[];

    let written = 0;
    for (const c of campaigns) {
      try { await upsertRawRecord('raw_instantly_campaigns', String(c.id), c, syncRunId); written++; } catch {}
    }

    // Try analytics for each campaign (limit to first 10 to avoid rate limits)
    const analyticsResults: Record<string, unknown>[] = [];
    for (const c of campaigns.slice(0, 10)) {
      try {
        const analytics = await instantlyGet(`/campaign/analytics?campaign_id=${c.id}`, apiKey);
        analyticsResults.push({ campaign_id: c.id, campaign_name: c.name, ...analytics });
        await upsertRawRecord('raw_instantly_campaign_analytics', `${c.id}-analytics`, { campaign_id: c.id, ...analytics }, syncRunId, { campaign_id: String(c.id) });
        written++;
      } catch {}
    }

    // Detect naming conventions
    const names = campaigns.map(c => String(c.name));
    const followsConvention = names.filter(n => /^[A-Z]{2,3}-/i.test(n)).length;

    const meta = {
      campaign_count: campaigns.length,
      analytics_fetched: analyticsResults.length,
      campaign_names: names.slice(0, 20),
      naming_convention_compliance: `${followsConvention}/${campaigns.length} campaigns follow recommended naming`,
      recommended_naming: INSTANTLY_NAMING_CONVENTION,
      detected_markets: [...new Set(names.map(n => n.split('-')[0]).filter(Boolean))],
      campaign_statuses: [...new Set(campaigns.map(c => c.status).filter(Boolean))],
      fields_available: campaigns.length ? Object.keys(campaigns[0]).filter(k => k !== 'id') : [],
    };

    await completeSyncRun(syncRunId, 'completed', { fetched: campaigns.length, written }, meta);
    return NextResponse.json({ status: 'ok', source: 'instantly', sync_run_id: syncRunId, message: `${campaigns.length} campaigns discovered.`, records_fetched: campaigns.length, profile: meta, mappings: INSTANTLY_CAMPAIGN_MAPPINGS });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (syncRunId) await completeSyncRun(syncRunId, 'error', { fetched: 0, written: 0 }, {}, msg).catch(() => null);
    return NextResponse.json({ status: 'error', source: 'instantly', message: msg, records_fetched: 0 }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const configured = Boolean(process.env.INSTANTLY_API_KEY);
  let lastRun = null;
  try {
    const { data } = await getSupabaseAdmin().from('source_sync_runs').select('*').eq('source', 'instantly').order('created_at', { ascending: false }).limit(1).single();
    lastRun = data;
  } catch {}
  return NextResponse.json({ configured, last_run: lastRun });
}
