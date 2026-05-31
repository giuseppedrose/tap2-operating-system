import { NextRequest, NextResponse } from 'next/server';
import { createSyncRun, completeSyncRun, upsertRawRecord, getSupabaseAdmin } from '@/lib/integrations/supabase-admin';
import { HUBSPOT_DEAL_MAPPINGS, HUBSPOT_COMPANY_MAPPINGS, HUBSPOT_REQUIRED_CUSTOM_PROPERTIES } from '@/lib/integrations/mapping/hubspot-mapper';
import { confidenceScore } from '@/lib/integrations/mapping/mapping-confidence';

function checkAuth(req: NextRequest): boolean {
  const session = req.cookies.get('tap2_admin_session');
  return Boolean(session?.value && session.value.length >= 32);
}

async function hsGet(path: string, token: string, params?: Record<string, string>) {
  const url = new URL(`https://api.hubapi.com${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message ?? `HubSpot API error: ${res.status}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

async function hsPost(path: string, token: string, body: unknown) {
  const res = await fetch(`https://api.hubapi.com${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message ?? `HubSpot API error: ${res.status}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

function profileProperties(props: Record<string, unknown>[]): { name: string; type: string; is_custom: boolean; population_rate: number }[] {
  return props.slice(0, 50).map((p: Record<string, unknown>) => ({
    name: String(p.name ?? ''),
    type: String(p.type ?? 'unknown'),
    is_custom: Boolean((p as Record<string, unknown>).hubspotDefined === false || String(p.name).startsWith('tap2_')),
    population_rate: 0, // calculated after fetching records
  }));
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ status: 'no_credentials', source: 'hubspot', message: 'HUBSPOT_ACCESS_TOKEN not configured. Add it to Vercel environment variables.', records_fetched: 0 });
  }

  let syncRunId: string | null = null;
  try {
    syncRunId = await createSyncRun('hubspot', 'discovery');

    // Fetch all in parallel where possible
    const [companiesRes, contactsRes, dealsRes, ownersRes, pipelinesRes] = await Promise.all([
      hsPost('/crm/v3/objects/companies/search', token, { limit: 100, properties: ['name','domain','country','city','industry','hs_lead_status','hubspot_owner_id','createdate'] }),
      hsPost('/crm/v3/objects/contacts/search', token, { limit: 100, properties: ['email','firstname','lastname','hs_lead_status','hubspot_owner_id','associatedcompanyid','createdate'] }),
      hsPost('/crm/v3/objects/deals/search', token, { limit: 100, properties: ['dealname','dealstage','amount','closedate','hubspot_owner_id','pipeline','hs_probability','createdate','hs_lastmodifieddate','hs_analytics_source'] }),
      hsGet('/crm/v3/owners', token, { limit: '100' }),
      hsGet('/crm/v3/pipelines/deals', token),
    ]);

    // Fetch property definitions
    const [dealPropsRes, companyPropsRes, contactPropsRes] = await Promise.all([
      hsGet('/crm/v3/properties/deals', token),
      hsGet('/crm/v3/properties/companies', token),
      hsGet('/crm/v3/properties/contacts', token),
    ]);

    const companies = (companiesRes.results as Record<string, unknown>[]) ?? [];
    const contacts = (contactsRes.results as Record<string, unknown>[]) ?? [];
    const deals = (dealsRes.results as Record<string, unknown>[]) ?? [];
    const owners = (ownersRes.results as Record<string, unknown>[]) ?? [];
    const pipelines = (pipelinesRes.results as Record<string, unknown>[]) ?? [];
    const dealProps = (dealPropsRes.results as Record<string, unknown>[]) ?? [];
    const companyProps = (companyPropsRes.results as Record<string, unknown>[]) ?? [];
    const contactProps = (contactPropsRes.results as Record<string, unknown>[]) ?? [];

    // Write raw records
    let written = 0;
    for (const c of companies) { const p = (c.properties as Record<string, unknown>) ?? c; try { await upsertRawRecord('raw_hubspot_companies', String(c.id), p, syncRunId); written++; } catch {} }
    for (const c of contacts) { const p = (c.properties as Record<string, unknown>) ?? c; try { await upsertRawRecord('raw_hubspot_contacts', String(c.id), p, syncRunId); written++; } catch {} }
    for (const d of deals) { const p = (d.properties as Record<string, unknown>) ?? d; try { await upsertRawRecord('raw_hubspot_deals', String(d.id), p, syncRunId); written++; } catch {} }
    for (const o of owners) { try { await upsertRawRecord('raw_hubspot_owners', String(o.id), o as Record<string, unknown>, syncRunId); written++; } catch {} }

    // Write property definitions to raw table
    const sb = getSupabaseAdmin();
    for (const prop of dealProps.slice(0, 200)) {
      try {
        await sb.from('raw_hubspot_properties').upsert({ object_type: 'deals', property_name: String(prop.name), raw_payload: prop, fetched_at: new Date().toISOString(), sync_run_id: syncRunId }, { onConflict: 'object_type,property_name' });
      } catch {}
    }

    // Detect which Tap2 custom properties exist
    const dealPropNames = dealProps.map((p: Record<string, unknown>) => String(p.name));
    const tap2CustomFound = HUBSPOT_REQUIRED_CUSTOM_PROPERTIES.filter(p => dealPropNames.includes(p.name) || dealPropNames.includes(p.name));
    const tap2CustomMissing = HUBSPOT_REQUIRED_CUSTOM_PROPERTIES.filter(p => !dealPropNames.includes(p.name));

    // Detect deal stages
    const stageInfo = pipelines.flatMap((pl: Record<string, unknown>) =>
      ((pl.stages as Record<string, unknown>[]) ?? []).map((s: Record<string, unknown>) => ({
        pipeline: pl.label,
        stage_id: s.id,
        stage_label: s.label,
        probability: (s.metadata as Record<string, number>)?.probability,
        closed_won: (s.metadata as Record<string, boolean>)?.isClosed && (s.metadata as Record<string, string>)?.closedWon === 'true',
      }))
    );

    // Population rate for deal fields
    const dealFieldPopulation = dealProps.slice(0, 20).map((prop: Record<string, unknown>) => {
      const populated = deals.filter(d => {
        const props = (d.properties as Record<string, unknown>) ?? d;
        return props[String(prop.name)] != null && props[String(prop.name)] !== '';
      }).length;
      return { field: prop.name, population_rate: deals.length ? Math.round((populated / deals.length) * 100) : 0 };
    }).sort((a, b) => b.population_rate - a.population_rate);

    const meta = {
      company_count: companies.length, contact_count: contacts.length, deal_count: deals.length,
      owner_count: owners.length, pipeline_count: pipelines.length,
      total_deal_properties: dealProps.length, total_company_properties: companyProps.length, total_contact_properties: contactProps.length,
      tap2_custom_properties_found: tap2CustomFound.map(p => p.name),
      tap2_custom_properties_missing: tap2CustomMissing.map(p => p.name),
      deal_stages_detected: stageInfo,
      deal_field_population_top20: dealFieldPopulation,
      owner_names: owners.map((o: Record<string, unknown>) => `${o.firstName} ${o.lastName}`.trim()),
      mapping_confidence: { deals: confidenceScore(HUBSPOT_DEAL_MAPPINGS), companies: confidenceScore(HUBSPOT_COMPANY_MAPPINGS) },
      has_more: { companies: Number(companiesRes.total ?? 0) > 100, contacts: Number(contactsRes.total ?? 0) > 100, deals: Number(dealsRes.total ?? 0) > 100 },
    };

    await completeSyncRun(syncRunId, 'completed', { fetched: companies.length + contacts.length + deals.length + owners.length, written }, meta);
    return NextResponse.json({
      status: 'ok', source: 'hubspot', sync_run_id: syncRunId,
      message: `${companies.length} companies, ${contacts.length} contacts, ${deals.length} deals, ${owners.length} owners discovered.`,
      records_fetched: companies.length + contacts.length + deals.length + owners.length,
      profile: meta, deal_mappings: HUBSPOT_DEAL_MAPPINGS, company_mappings: HUBSPOT_COMPANY_MAPPINGS,
      required_custom_properties: HUBSPOT_REQUIRED_CUSTOM_PROPERTIES,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (syncRunId) await completeSyncRun(syncRunId, 'error', { fetched: 0, written: 0 }, {}, msg).catch(() => null);
    return NextResponse.json({ status: 'error', source: 'hubspot', message: msg, records_fetched: 0 }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const configured = Boolean(process.env.HUBSPOT_ACCESS_TOKEN);
  let lastRun = null;
  try {
    const { data } = await getSupabaseAdmin().from('source_sync_runs').select('*').eq('source', 'hubspot').order('created_at', { ascending: false }).limit(1).single();
    lastRun = data;
  } catch {}
  return NextResponse.json({ configured, last_run: lastRun });
}
