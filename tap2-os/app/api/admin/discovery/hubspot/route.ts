import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/config/env';
import { createSyncRun, completeSyncRun, upsertRawRecord, upsertDataProfile, getSupabaseAdmin } from '@/lib/integrations/supabase-admin';
import { HUBSPOT_DEAL_MAPPINGS, HUBSPOT_COMPANY_MAPPINGS, HUBSPOT_REQUIRED_CUSTOM_PROPERTIES } from '@/lib/integrations/mapping/hubspot-mapper';
import { confidenceScore } from '@/lib/integrations/mapping/mapping-confidence';

function checkAuth(req: NextRequest) { const s = req.cookies.get('tap2_admin_session'); return Boolean(s?.value && s.value.length >= 32); }

async function hsGet(path: string, params?: Record<string, string>): Promise<Record<string, unknown>> {
  const t = ENV.HUBSPOT_ACCESS_TOKEN; if (!t) throw new Error('HubSpot not configured');
  const url = new URL(`https://api.hubapi.com${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(`HubSpot ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

async function hsPost(path: string, body: unknown): Promise<Record<string, unknown>> {
  const t = ENV.HUBSPOT_ACCESS_TOKEN; if (!t) throw new Error('HubSpot not configured');
  const res = await fetch(`https://api.hubapi.com${path}`, { method: 'POST', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`HubSpot ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

async function fetchAllHS(objectType: string, properties: string[], max = 200): Promise<Record<string, unknown>[]> {
  const results: Record<string, unknown>[] = [];
  let after: string | undefined;
  while (results.length < max) {
    const body: Record<string, unknown> = { limit: 100, properties };
    if (after) body.after = after;
    const page = await hsPost(`/crm/v3/objects/${objectType}/search`, body);
    const items = (page.results as Record<string, unknown>[]) ?? [];
    results.push(...items);
    const paging = page.paging as Record<string, unknown> | undefined;
    const next = (paging?.next as Record<string, unknown> | undefined)?.after;
    if (!next || !items.length) break;
    after = String(next);
  }
  return results;
}

function profileProps(records: Record<string, unknown>[], propNames: string[]) {
  return propNames.map(name => {
    const populated = records.filter(r => {
      const p = (r.properties as Record<string, unknown>) ?? r;
      return p[name] != null && p[name] !== '' && p[name] !== '0';
    }).length;
    return { name, population_rate: records.length ? Math.round((populated / records.length) * 100) : 0 };
  }).sort((a, b) => b.population_rate - a.population_rate);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const token = ENV.HUBSPOT_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ status: 'no_credentials', source: 'hubspot', message: 'HubSpot token not found. Check Hubspot or HUBSPOT_ACCESS_TOKEN in Vercel env vars.', records_fetched: 0 });

  let runId: string | null = null;
  try {
    runId = await createSyncRun('hubspot', 'discovery');

    // Fetch everything in parallel
    const [companies, contacts, deals, ownersRes, pipelinesRes, dealPropsRes, companyPropsRes, contactPropsRes] = await Promise.all([
      fetchAllHS('companies', ['name','domain','country','city','industry','hs_lead_status','hubspot_owner_id','createdate','numberofemployees','annualrevenue','tap2_segment'], 200),
      fetchAllHS('contacts', ['email','firstname','lastname','hs_lead_status','hubspot_owner_id','associatedcompanyid','createdate','lifecyclestage','phone'], 200),
      fetchAllHS('deals', ['dealname','dealstage','amount','closedate','hubspot_owner_id','pipeline','hs_probability','createdate','hs_lastmodifieddate','hs_analytics_source','deal_currency_code','tap2_expected_mrr','tap2_partner_owner','tap2_use_case','tap2_market','tap2_campaign_id','tap2_next_step','tap2_next_step_due_date','tap2_lost_reason','tap2_competitor','tap2_icp_fit','hs_deal_stage_probability'], 300),
      hsGet('/crm/v3/owners', { limit: '100' }),
      hsGet('/crm/v3/pipelines/deals'),
      hsGet('/crm/v3/properties/deals', { limit: '500' }),
      hsGet('/crm/v3/properties/companies', { limit: '500' }),
      hsGet('/crm/v3/properties/contacts', { limit: '500' }),
    ]);

    const owners = (ownersRes.results as Record<string, unknown>[]) ?? [];
    const pipelines = (pipelinesRes.results as Record<string, unknown>[]) ?? [];
    const dealProps = (dealPropsRes.results as Record<string, unknown>[]) ?? [];
    const companyProps = (companyPropsRes.results as Record<string, unknown>[]) ?? [];
    const contactProps = (contactPropsRes.results as Record<string, unknown>[]) ?? [];

    // Write raw records
    let written = 0;
    for (const c of companies) { const p = (c.properties as Record<string, unknown>) ?? c; try { await upsertRawRecord('raw_hubspot_companies', String(c.id), p, runId); written++; } catch {} }
    for (const c of contacts) { const p = (c.properties as Record<string, unknown>) ?? c; try { await upsertRawRecord('raw_hubspot_contacts', String(c.id), p, runId); written++; } catch {} }
    for (const d of deals) { const p = (d.properties as Record<string, unknown>) ?? d; try { await upsertRawRecord('raw_hubspot_deals', String(d.id), p, runId); written++; } catch {} }
    for (const o of owners) { try { await upsertRawRecord('raw_hubspot_owners', String(o.id), o as Record<string, unknown>, runId); written++; } catch {} }

    // Write property definitions
    const sb = getSupabaseAdmin();
    for (const prop of dealProps.slice(0, 300)) {
      try { await sb.from('raw_hubspot_properties').upsert({ object_type: 'deals', property_name: String(prop.name), raw_payload: prop, fetched_at: new Date().toISOString(), sync_run_id: runId }, { onConflict: 'object_type,property_name' }); } catch {}
    }

    // Detect deal stages from pipelines
    const stages = pipelines.flatMap(pl => ((pl.stages as Record<string, unknown>[]) ?? []).map(s => ({
      pipeline_id: pl.id, pipeline_label: pl.label,
      stage_id: s.id, stage_label: s.label,
      probability: ((s.metadata as Record<string, number>)?.probability ?? 0) * 100,
      is_closed: Boolean((s.metadata as Record<string, boolean>)?.isClosed),
      is_won: (s.metadata as Record<string, string>)?.closedWon === 'true',
    })));

    // Property analysis
    const dealPropNames = dealProps.map(p => String(p.name));
    const tap2PropsFound = HUBSPOT_REQUIRED_CUSTOM_PROPERTIES.filter(p => dealPropNames.includes(p.name)).map(p => p.name);
    const tap2PropsMissing = HUBSPOT_REQUIRED_CUSTOM_PROPERTIES.filter(p => !dealPropNames.includes(p.name)).map(p => ({ name: p.name, label: p.label, priority: p.priority }));

    // Custom vs standard property breakdown
    const customProps = dealProps.filter(p => !(p as Record<string, boolean>).hubspotDefined).map(p => String(p.name));
    const tap2OwnedProps = customProps.filter(n => n.startsWith('tap2_'));

    // Deal population rates for key fields
    const keyDealFields = ['dealname','dealstage','amount','closedate','hubspot_owner_id','tap2_expected_mrr','tap2_partner_owner','tap2_use_case','tap2_market','tap2_next_step','hs_analytics_source'];
    const dealFieldPopulation = profileProps(deals, keyDealFields);

    // Pipeline value calculation
    const totalPipeline = deals.reduce((s, d) => {
      const p = (d.properties as Record<string, unknown>) ?? d;
      return s + Number(p.amount ?? 0);
    }, 0);
    const stageBreakdown = stages.map(stage => ({
      ...stage,
      deal_count: deals.filter(d => { const p = (d.properties as Record<string, unknown>) ?? d; return p.dealstage === stage.stage_id; }).length,
    }));

    // Lifecycle stage breakdown for contacts
    const lifecycleStages: Record<string, number> = {};
    contacts.forEach(c => {
      const p = (c.properties as Record<string, unknown>) ?? c;
      const stage = String(p.lifecyclestage ?? 'unknown');
      lifecycleStages[stage] = (lifecycleStages[stage] ?? 0) + 1;
    });

    const meta = {
      company_count: companies.length,
      contact_count: contacts.length,
      deal_count: deals.length,
      owner_count: owners.length,
      pipeline_count: pipelines.length,
      stage_count: stages.length,
      total_deal_props: dealProps.length,
      total_company_props: companyProps.length,
      total_contact_props: contactProps.length,
      custom_props_found: customProps.length,
      tap2_props_found: tap2OwnedProps,
      tap2_props_missing: tap2PropsMissing,
      deal_stages: stageBreakdown,
      total_pipeline_value: totalPipeline,
      deal_field_population: dealFieldPopulation,
      lifecycle_stage_breakdown: lifecycleStages,
      owner_names: owners.map(o => `${o.firstName ?? ''} ${o.lastName ?? ''}`.trim()),
      mapping_confidence: { deals: confidenceScore(HUBSPOT_DEAL_MAPPINGS), companies: confidenceScore(HUBSPOT_COMPANY_MAPPINGS) },
      data_quality_notes: [
        tap2PropsMissing.length > 0 ? `${tap2PropsMissing.length} Tap2 custom properties missing from HubSpot — must create before full sync` : '✓ All Tap2 custom properties found',
        totalPipeline > 0 ? `€${totalPipeline.toLocaleString()} total pipeline detected` : 'No pipeline value detected — check amount field',
        stages.length > 0 ? `${stages.length} deal stages detected across ${pipelines.length} pipeline(s)` : 'No deal stages detected',
        deals.length > 0 ? `Deal field populations: ${dealFieldPopulation.slice(0,3).map(f => `${f.name}=${f.population_rate}%`).join(', ')}` : '',
      ].filter(Boolean),
    };

    await upsertDataProfile('hubspot', 'deals', runId, { record_count: deals.length, field_count: keyDealFields.length, fields: dealFieldPopulation, quality_score: Math.min(100, Math.round(tap2OwnedProps.length * 8 + (deals.length > 0 ? 40 : 0))), mapping_recommendations: HUBSPOT_DEAL_MAPPINGS });
    await upsertDataProfile('hubspot', 'companies', runId, { record_count: companies.length, field_count: companyProps.length, fields: [], quality_score: companies.length > 0 ? 70 : 0, mapping_recommendations: HUBSPOT_COMPANY_MAPPINGS });

    await completeSyncRun(runId, 'completed', { fetched: companies.length + contacts.length + deals.length + owners.length, written }, meta);

    return NextResponse.json({ status: 'ok', source: 'hubspot', sync_run_id: runId,
      message: `${companies.length} companies · ${contacts.length} contacts · ${deals.length} deals · ${owners.length} owners · ${tap2OwnedProps.length}/${HUBSPOT_REQUIRED_CUSTOM_PROPERTIES.length} Tap2 custom props found`,
      records_fetched: companies.length + contacts.length + deals.length + owners.length,
      profile: meta, deal_mappings: HUBSPOT_DEAL_MAPPINGS, required_custom_properties: HUBSPOT_REQUIRED_CUSTOM_PROPERTIES });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (runId) await completeSyncRun(runId, 'error', { fetched: 0, written: 0 }, {}, msg).catch(() => null);
    return NextResponse.json({ status: 'error', source: 'hubspot', message: msg, records_fetched: 0 }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const configured = Boolean(ENV.HUBSPOT_ACCESS_TOKEN);
  let lastRun = null;
  try { const { data } = await getSupabaseAdmin().from('source_sync_runs').select('*').eq('source', 'hubspot').order('created_at', { ascending: false }).limit(1).single(); lastRun = data; } catch {}
  return NextResponse.json({ configured, last_run: lastRun });
}
