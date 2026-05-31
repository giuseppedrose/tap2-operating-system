import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/config/env';
import { createSyncRun, completeSyncRun, upsertRawRecord, upsertDataProfile, getSupabaseAdmin } from '@/lib/integrations/supabase-admin';
import { INSTANTLY_CAMPAIGN_MAPPINGS, INSTANTLY_NAMING_CONVENTION } from '@/lib/integrations/mapping/instantly-mapper';

function checkAuth(req: NextRequest) { const s = req.cookies.get('tap2_admin_session'); return Boolean(s?.value && s.value.length >= 32); }

async function iGet(path: string, params?: Record<string, string>): Promise<Record<string, unknown>> {
  const key = ENV.INSTANTLY_API_KEY; if (!key) throw new Error('Instantly not configured');
  // v1 uses api_key as query param (NOT Bearer header)
  const url1 = new URL(`https://api.instantly.ai/api/v1${path}`);
  url1.searchParams.set('api_key', key);
  if (params) Object.entries(params).forEach(([k, v]) => url1.searchParams.set(k, v));
  const res = await fetch(url1.toString());
  if (res.ok) return res.json() as Promise<Record<string, unknown>>;
  // v2 uses Bearer token
  const url2 = new URL(`https://api.instantly.ai/api/v2${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url2.searchParams.set(k, v));
  const res2 = await fetch(url2.toString(), { headers: { Authorization: `Bearer ${key}` } });
  if (!res2.ok) throw new Error(`Instantly ${res.status} (v1) / ${res2.status} (v2)`);
  return res2.json() as Promise<Record<string, unknown>>;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const key = ENV.INSTANTLY_API_KEY;
  if (!key) return NextResponse.json({ status: 'no_credentials', source: 'instantly', message: 'Instantly key not found. Check instantl or INSTANTLY_API_KEY in Vercel env vars.', records_fetched: 0 });

  let runId: string | null = null;
  try {
    runId = await createSyncRun('instantly', 'discovery');
    let campaigns: Record<string, unknown>[] = [];
    let apiVersion = 'v1';

    // Try v1 campaign list (api_key as query param)
    try {
      const res = await iGet('/campaign/list', { limit: '100', skip: '0' });
      campaigns = (res.campaigns ?? res.data ?? res.items ?? []) as Record<string, unknown>[];
    } catch {
      apiVersion = 'v2';
      const key2 = ENV.INSTANTLY_API_KEY;
      const res = await fetch('https://api.instantly.ai/api/v2/campaigns?limit=100', { headers: { Authorization: `Bearer ${key2}` } });
      if (res.ok) {
        const data = await res.json() as Record<string, unknown>;
        campaigns = (data.items ?? data.data ?? data.campaigns ?? []) as Record<string, unknown>[];
      }
    }

    let written = 0;
    const analyticsResults: Record<string, unknown>[] = [];

    for (const c of campaigns) {
      try { await upsertRawRecord('raw_instantly_campaigns', String(c.id), c, runId); written++; } catch {}
    }

    // Fetch analytics for all campaigns
    for (const c of campaigns.slice(0, 20)) {
      try {
        const analytics = await iGet('/campaign/analytics', { campaign_id: String(c.id) });
        const enriched = { campaign_id: c.id, campaign_name: c.name, ...analytics };
        analyticsResults.push(enriched);
        await upsertRawRecord('raw_instantly_campaign_analytics', `${c.id}-analytics`, enriched, runId, { campaign_id: String(c.id) });
        written++;
      } catch {}
    }

    // Try to get leads for first 5 campaigns
    const leadsData: Record<string, unknown>[] = [];
    for (const c of campaigns.slice(0, 5)) {
      try {
        const leads = await iGet('/lead/list', { campaign_id: String(c.id), limit: '50' });
        const items = ((leads.leads ?? leads.data ?? leads.items ?? []) as Record<string, unknown>[]);
        for (const l of items) {
          try { await upsertRawRecord('raw_instantly_leads', `${c.id}-${l.email}`, l, runId, { campaign_id: String(c.id) }); written++; leadsData.push(l); } catch {}
        }
      } catch {}
    }

    const names = campaigns.map(c => String(c.name ?? ''));
    const followsConvention = names.filter(n => /^[A-Z]{2,3}-/i.test(n)).length;

    // Aggregate campaign metrics from analytics
    const totalSent = analyticsResults.reduce((s, a) => s + Number(a.total_leads ?? a.contacted ?? 0), 0);
    const totalReplies = analyticsResults.reduce((s, a) => s + Number(a.reply_count ?? a.replied ?? 0), 0);
    const totalOpens = analyticsResults.reduce((s, a) => s + Number(a.open_count ?? a.opened ?? 0), 0);
    const totalInterested = analyticsResults.reduce((s, a) => s + Number(a.interested_count ?? a.positive_reply ?? 0), 0);

    // Detect available fields in analytics response
    const analyticsFields = analyticsResults.length > 0 ? Object.keys(analyticsResults[0]).filter(k => !['campaign_id','campaign_name'].includes(k)) : [];

    const meta = {
      campaign_count: campaigns.length,
      analytics_fetched: analyticsResults.length,
      leads_sampled: leadsData.length,
      api_version_detected: apiVersion,
      campaign_names: names.slice(0, 20),
      naming_convention_compliance: `${followsConvention}/${campaigns.length} campaigns follow recommended naming`,
      recommended_naming: INSTANTLY_NAMING_CONVENTION,
      detected_markets: [...new Set(names.map(n => n.split('-')[0]).filter(Boolean))],
      campaign_statuses: [...new Set(campaigns.map(c => c.status).filter(Boolean))],
      aggregated_metrics: { total_sent: totalSent, total_opens: totalOpens, total_replies: totalReplies, total_positive_replies: totalInterested },
      analytics_fields_available: analyticsFields,
      lead_fields_available: leadsData.length > 0 ? Object.keys(leadsData[0]).slice(0, 20) : [],
      data_quality_notes: [
        followsConvention < campaigns.length ? `${campaigns.length - followsConvention} campaigns don't follow MARKET-SEGMENT-PERIOD naming — attribution will be limited` : '✓ Campaign naming follows convention',
        totalSent > 0 ? `${totalSent.toLocaleString()} emails sent across ${analyticsResults.length} campaigns` : 'No email volume data returned from analytics',
        leadsData.length > 0 ? `Lead email domains: ${[...new Set(leadsData.map(l => String(l.email ?? '').split('@')[1]).filter(Boolean))].slice(0,5).join(', ')}` : 'Lead data not available in this API scope',
      ].filter(Boolean),
    };

    await upsertDataProfile('instantly', 'campaigns', runId, { record_count: campaigns.length, field_count: Object.keys(campaigns[0] ?? {}).length, fields: [], quality_score: Math.min(100, Math.round(followsConvention / Math.max(1, campaigns.length) * 60 + (totalSent > 0 ? 40 : 0))), mapping_recommendations: INSTANTLY_CAMPAIGN_MAPPINGS });

    await completeSyncRun(runId, 'completed', { fetched: campaigns.length + analyticsResults.length + leadsData.length, written }, meta);
    return NextResponse.json({ status: 'ok', source: 'instantly', sync_run_id: runId,
      message: `${campaigns.length} campaigns · ${analyticsResults.length} analytics fetched · ${leadsData.length} leads sampled · ${totalSent.toLocaleString()} total emails sent`,
      records_fetched: campaigns.length, profile: meta, mappings: INSTANTLY_CAMPAIGN_MAPPINGS });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    const code = msg.includes('401') || msg.includes('403') ? 'invalid_api_key' : 'upstream_api_error';
    if (runId) await completeSyncRun(runId, 'error', { fetched: 0, written: 0 }, {}, msg).catch(() => null);
    return NextResponse.json({ error_code: code, status: 'error', source: 'instantly', message: msg, records_fetched: 0 }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const configured = Boolean(ENV.INSTANTLY_API_KEY);
  let lastRun = null;
  try { const { data } = await getSupabaseAdmin().from('source_sync_runs').select('*').eq('source', 'instantly').order('created_at', { ascending: false }).limit(1).single(); lastRun = data; } catch {}
  return NextResponse.json({ configured, last_run: lastRun });
}
