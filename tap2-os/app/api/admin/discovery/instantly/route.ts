import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/config/env';
import { createSyncRun, completeSyncRun, upsertRawRecord, upsertDataProfile, getSupabaseAdmin } from '@/lib/integrations/supabase-admin';
import { INSTANTLY_CAMPAIGN_MAPPINGS, INSTANTLY_NAMING_CONVENTION } from '@/lib/integrations/mapping/instantly-mapper';

function checkAuth(req: NextRequest) { const s = req.cookies.get('tap2_admin_session'); return Boolean(s?.value && s.value.length >= 32); }

// Instantly has two API versions with different auth and endpoints.
// v1: api_key as query param — /api/v1/campaign/list
// v2: Bearer token — /api/v2/campaigns
// Some keys work with Bearer on v1 too. We try all combinations.

type InstantlyVersion = 'v1_apiparam' | 'v1_bearer' | 'v2_bearer' | 'unknown';

async function detectVersion(key: string): Promise<InstantlyVersion> {
  // Try v1 with api_key param (official v1 format)
  const r1 = await fetch(`https://api.instantly.ai/api/v1/campaign/list?api_key=${encodeURIComponent(key)}&limit=1&skip=0`).catch(() => null);
  if (r1?.ok) return 'v1_apiparam';

  // Try v2 with Bearer (official v2 format)
  const r2 = await fetch('https://api.instantly.ai/api/v2/campaigns?limit=1', {
    headers: { Authorization: `Bearer ${key}` },
  }).catch(() => null);
  if (r2?.ok) return 'v2_bearer';

  // Try v1 with Bearer (some integrations accept this)
  const r3 = await fetch('https://api.instantly.ai/api/v1/campaign/list?limit=1&skip=0', {
    headers: { Authorization: `Bearer ${key}` },
  }).catch(() => null);
  if (r3?.ok) return 'v1_bearer';

  return 'unknown';
}

async function fetchCampaigns(key: string, version: InstantlyVersion): Promise<{ campaigns: Record<string, unknown>[]; apiVersion: string }> {
  if (version === 'v1_apiparam') {
    const r = await fetch(`https://api.instantly.ai/api/v1/campaign/list?api_key=${encodeURIComponent(key)}&limit=100&skip=0`);
    if (!r.ok) throw new Error(`Instantly v1 ${r.status}`);
    const d = await r.json() as Record<string, unknown>;
    return { campaigns: (d.campaigns ?? d.data ?? d.items ?? []) as Record<string, unknown>[], apiVersion: 'v1' };
  }
  if (version === 'v1_bearer') {
    const r = await fetch('https://api.instantly.ai/api/v1/campaign/list?limit=100&skip=0', { headers: { Authorization: `Bearer ${key}` } });
    if (!r.ok) throw new Error(`Instantly v1 bearer ${r.status}`);
    const d = await r.json() as Record<string, unknown>;
    return { campaigns: (d.campaigns ?? d.data ?? d.items ?? []) as Record<string, unknown>[], apiVersion: 'v1' };
  }
  if (version === 'v2_bearer') {
    const r = await fetch('https://api.instantly.ai/api/v2/campaigns?limit=100', { headers: { Authorization: `Bearer ${key}` } });
    if (!r.ok) throw new Error(`Instantly v2 ${r.status}`);
    const d = await r.json() as Record<string, unknown>;
    return { campaigns: (d.items ?? d.data ?? d.campaigns ?? []) as Record<string, unknown>[], apiVersion: 'v2' };
  }
  return { campaigns: [], apiVersion: 'unknown' };
}

async function fetchAnalytics(key: string, version: InstantlyVersion, campaignId: string): Promise<Record<string, unknown> | null> {
  try {
    if (version === 'v2_bearer') {
      // v2 analytics might be at a different endpoint
      const r = await fetch(`https://api.instantly.ai/api/v2/analytics/campaigns?campaign_id=${campaignId}`, { headers: { Authorization: `Bearer ${key}` } });
      if (r.ok) return r.json() as Promise<Record<string, unknown>>;
      // Try alternate v2 analytics endpoint
      const r2 = await fetch(`https://api.instantly.ai/api/v2/campaigns/${campaignId}/analytics`, { headers: { Authorization: `Bearer ${key}` } });
      if (r2.ok) return r2.json() as Promise<Record<string, unknown>>;
      return null;
    }
    if (version === 'v1_apiparam') {
      const r = await fetch(`https://api.instantly.ai/api/v1/campaign/analytics?api_key=${encodeURIComponent(key)}&campaign_id=${campaignId}`);
      if (r.ok) return r.json() as Promise<Record<string, unknown>>;
      return null;
    }
    if (version === 'v1_bearer') {
      const r = await fetch(`https://api.instantly.ai/api/v1/campaign/analytics?campaign_id=${campaignId}`, { headers: { Authorization: `Bearer ${key}` } });
      if (r.ok) return r.json() as Promise<Record<string, unknown>>;
      return null;
    }
    return null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error_code: 'auth_required', source: 'instantly', message: 'Admin session required.' }, { status: 401 });
  const key = ENV.INSTANTLY_API_KEY;
  if (!key) return NextResponse.json({ error_code: 'missing_env_var', status: 'no_credentials', source: 'instantly', message: 'Instantly key not found. Check instantl or INSTANTLY_API_KEY in Vercel env vars.', records_fetched: 0 });

  let runId: string | null = null;
  try {
    runId = await createSyncRun('instantly', 'discovery');

    // Detect which API version/auth the key supports
    const version = await detectVersion(key);
    if (version === 'unknown') {
      await completeSyncRun(runId, 'error', { fetched: 0, written: 0 }, {}, 'Key rejected by all Instantly API versions');
      return NextResponse.json({
        error_code: 'invalid_api_key',
        status: 'error',
        source: 'instantly',
        message: 'Instantly API key rejected by v1 (api_key param), v1 (Bearer), and v2 (Bearer). Verify the key in Vercel env vars (instantl variable).',
        records_fetched: 0,
      }, { status: 500 });
    }

    const { campaigns, apiVersion } = await fetchCampaigns(key, version);
    let written = 0;
    const analyticsResults: Record<string, unknown>[] = [];

    for (const c of campaigns) {
      try { await upsertRawRecord('raw_instantly_campaigns', String(c.id), c, runId); written++; } catch {}
    }

    for (const c of campaigns.slice(0, 20)) {
      const analytics = await fetchAnalytics(key, version, String(c.id));
      if (analytics) {
        const enriched = { campaign_id: c.id, campaign_name: c.name, ...analytics };
        analyticsResults.push(enriched);
        try { await upsertRawRecord('raw_instantly_campaign_analytics', `${c.id}-analytics`, enriched, runId, { campaign_id: String(c.id) }); written++; } catch {}
      }
    }

    const leadsData: Record<string, unknown>[] = [];
    if (version === 'v1_apiparam' || version === 'v1_bearer') {
      for (const c of campaigns.slice(0, 5)) {
        try {
          const authParam = version === 'v1_apiparam'
            ? `?api_key=${encodeURIComponent(key)}&campaign_id=${c.id}&limit=50`
            : `?campaign_id=${c.id}&limit=50`;
          const authHeaders = version === 'v1_bearer' ? { Authorization: `Bearer ${key}` } : undefined;
          const r = await fetch(`https://api.instantly.ai/api/v1/lead/list${authParam}`, { headers: authHeaders });
          if (r.ok) {
            const d = await r.json() as Record<string, unknown>;
            const items = (d.leads ?? d.data ?? d.items ?? []) as Record<string, unknown>[];
            for (const l of items) {
              try { await upsertRawRecord('raw_instantly_leads', `${c.id}-${l.email}`, l, runId, { campaign_id: String(c.id) }); written++; leadsData.push(l); } catch {}
            }
          }
        } catch {}
      }
    }

    const names = campaigns.map(c => String(c.name ?? ''));
    const followsConvention = names.filter(n => /^[A-Z]{2,3}-/i.test(n)).length;
    const totalSent = analyticsResults.reduce((s, a) => s + Number(a.total_leads ?? a.contacted ?? 0), 0);
    const totalReplies = analyticsResults.reduce((s, a) => s + Number(a.reply_count ?? a.replied ?? 0), 0);
    const totalOpens = analyticsResults.reduce((s, a) => s + Number(a.open_count ?? a.opened ?? 0), 0);
    const totalInterested = analyticsResults.reduce((s, a) => s + Number(a.interested_count ?? a.positive_reply ?? 0), 0);

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
      analytics_fields_available: analyticsResults.length > 0 ? Object.keys(analyticsResults[0]).filter(k => !['campaign_id','campaign_name'].includes(k)) : [],
      lead_fields_available: leadsData.length > 0 ? Object.keys(leadsData[0]).slice(0, 20) : [],
      data_quality_notes: [
        followsConvention < campaigns.length ? `${campaigns.length - followsConvention} campaigns don't follow MARKET-SEGMENT-PERIOD naming` : '✓ Campaign naming follows convention',
        totalSent > 0 ? `${totalSent.toLocaleString()} emails sent across ${analyticsResults.length} campaigns` : 'No email volume data from analytics',
        leadsData.length > 0 ? `Lead domains: ${[...new Set(leadsData.map(l => String(l.email ?? '').split('@')[1]).filter(Boolean))].slice(0,5).join(', ')}` : 'Lead data not available in this scope',
      ].filter(Boolean),
    };

    await upsertDataProfile('instantly', 'campaigns', runId, { record_count: campaigns.length, field_count: Object.keys(campaigns[0] ?? {}).length, fields: [], quality_score: Math.min(100, Math.round(followsConvention / Math.max(1, campaigns.length) * 60 + (totalSent > 0 ? 40 : 0))), mapping_recommendations: INSTANTLY_CAMPAIGN_MAPPINGS });
    await completeSyncRun(runId, 'completed', { fetched: campaigns.length + analyticsResults.length + leadsData.length, written }, meta);

    return NextResponse.json({ status: 'ok', source: 'instantly', sync_run_id: runId,
      message: `${campaigns.length} campaigns · ${analyticsResults.length} analytics · ${leadsData.length} leads · ${totalSent.toLocaleString()} emails sent · API ${apiVersion}`,
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
