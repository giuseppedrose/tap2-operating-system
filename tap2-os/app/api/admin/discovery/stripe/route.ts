import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/config/env';
import { createSyncRun, completeSyncRun, upsertRawRecord, upsertDataProfile, getSupabaseAdmin } from '@/lib/integrations/supabase-admin';
import { STRIPE_CUSTOMER_MAPPINGS, STRIPE_SUBSCRIPTION_MAPPINGS, calcMRRFromSubscription } from '@/lib/integrations/mapping/stripe-mapper';
import { confidenceScore } from '@/lib/integrations/mapping/mapping-confidence';

function checkAuth(req: NextRequest) { const s = req.cookies.get('tap2_admin_session'); return Boolean(s?.value && s.value.length >= 32); }

async function sFetch(path: string, params?: Record<string, string>): Promise<Record<string, unknown>> {
  const key = ENV.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe not configured');
  const url = new URL(`https://api.stripe.com/v1${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${key}`, 'Stripe-Version': '2023-10-16' } });
  if (!res.ok) throw new Error(`Stripe ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

async function fetchAll(path: string, params: Record<string, string> = {}, max = 200): Promise<Record<string, unknown>[]> {
  const results: Record<string, unknown>[] = [];
  let cursor: string | undefined;
  while (results.length < max) {
    const p: Record<string, string> = { limit: '100', ...params };
    if (cursor) p.starting_after = cursor;
    const page = await sFetch(path, p);
    const items = (page.data as Record<string, unknown>[]) ?? [];
    results.push(...items);
    if (!page.has_more || !items.length) break;
    cursor = String(items[items.length - 1].id);
  }
  return results;
}

function profileFields(records: Record<string, unknown>[]) {
  if (!records.length) return [];
  const keys = new Set<string>();
  records.forEach(r => Object.keys(r).forEach(k => keys.add(k)));
  return Array.from(keys).map(key => {
    const populated = records.filter(r => r[key] != null && r[key] !== '').length;
    return { name: key, type: typeof records[0]?.[key], population_rate: Math.round((populated / records.length) * 100) };
  }).sort((a, b) => b.population_rate - a.population_rate);
}

function calcMRRCents(sub: Record<string, unknown>): number {
  const items = ((sub.items as Record<string, unknown>)?.data as Record<string, unknown>[]) ?? [];
  if (!items.length) return 0;
  const price = items[0]?.price as Record<string, unknown> | undefined;
  if (!price?.unit_amount) return 0;
  const amount = Number(price.unit_amount);
  const interval = (price.recurring as Record<string, string> | undefined)?.interval ?? 'month';
  if (interval === 'year')  return Math.round(amount / 12);
  if (interval === 'week')  return Math.round(amount * 4.33);
  return amount;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const key = ENV.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ status: 'no_credentials', source: 'stripe', message: 'Stripe key not found. Check SS or STRIPE_SECRET_KEY in Vercel env vars.', records_fetched: 0 });

  let runId: string | null = null;
  try {
    runId = await createSyncRun('stripe', 'discovery');

    // Fetch all data in parallel
    const [customers, subscriptions, invoices, products, prices] = await Promise.all([
      fetchAll('/customers', {}, 200),
      fetchAll('/subscriptions', { status: 'all', expand: 'data.items' }, 200),
      fetchAll('/invoices', { limit: '100' }, 100),
      fetchAll('/products', {}, 100),
      fetchAll('/prices', { active: 'true' }, 100),
    ]);

    // Write raw records
    let written = 0;
    for (const c of customers) { try { await upsertRawRecord('raw_stripe_customers', String(c.id), c, runId); written++; } catch {} }
    for (const s of subscriptions) { try { await upsertRawRecord('raw_stripe_subscriptions', String(s.id), s, runId, { customer_id: String(s.customer ?? '') }); written++; } catch {} }
    for (const inv of invoices) { try { await upsertRawRecord('raw_stripe_invoices', String(inv.id), inv, runId, { customer_id: String(inv.customer ?? '') }); written++; } catch {} }

    // MRR analysis
    const activeSubs = subscriptions.filter(s => s.status === 'active');
    const trialSubs = subscriptions.filter(s => s.status === 'trialing');
    const pastDueSubs = subscriptions.filter(s => s.status === 'past_due');
    const canceledSubs = subscriptions.filter(s => s.status === 'canceled');

    const activeMRR = activeSubs.reduce((s, sub) => s + calcMRRCents(sub), 0) / 100;
    const trialMRR  = trialSubs.reduce((s, sub) => s + calcMRRCents(sub), 0) / 100;
    const totalMRR  = activeMRR + trialMRR;

    // Customer metadata fields analysis (what custom data exists)
    const metadataKeys = new Set<string>();
    customers.forEach(c => { if (c.metadata && typeof c.metadata === 'object') Object.keys(c.metadata as object).forEach(k => metadataKeys.add(k)); });

    // Currency analysis
    const currencies = [...new Set(subscriptions.map(s => s.currency).filter(Boolean))];

    // Billing interval breakdown
    const intervals: Record<string, number> = {};
    subscriptions.forEach(s => {
      const items = ((s.items as Record<string, unknown>)?.data as Record<string, unknown>[]) ?? [];
      const interval = ((items[0]?.price as Record<string, unknown>)?.recurring as Record<string, string>)?.interval ?? 'unknown';
      intervals[interval] = (intervals[interval] ?? 0) + 1;
    });

    // Price points
    const priceAmounts = prices.map(p => ({ id: p.id, amount: Number(p.unit_amount ?? 0) / 100, currency: p.currency, interval: ((p.recurring as Record<string, string>)?.interval ?? 'one_time') }));

    const meta = {
      customer_count: customers.length,
      subscription_count: subscriptions.length,
      active_subscriptions: activeSubs.length,
      trial_subscriptions: trialSubs.length,
      past_due_subscriptions: pastDueSubs.length,
      canceled_subscriptions: canceledSubs.length,
      invoice_count: invoices.length,
      product_count: products.length,
      active_mrr_eur: Math.round(activeMRR),
      trial_mrr_eur: Math.round(trialMRR),
      total_mrr_eur: Math.round(totalMRR),
      total_arr_eur: Math.round(totalMRR * 12),
      currencies_detected: currencies,
      billing_intervals: intervals,
      price_points: priceAmounts.slice(0, 20),
      customer_metadata_keys: Array.from(metadataKeys),
      customer_fields: profileFields(customers).slice(0, 30),
      subscription_fields: profileFields(subscriptions).slice(0, 30),
      mapping_confidence: confidenceScore(STRIPE_CUSTOMER_MAPPINGS),
      data_quality_notes: [
        metadataKeys.size === 0 ? 'No customer metadata fields found — consider adding market, partner_owner, hubspot_id to Stripe customer metadata' : `Customer metadata fields: ${Array.from(metadataKeys).join(', ')}`,
        currencies.length > 1 ? `Multiple currencies detected: ${currencies.join(', ')} — MRR calculation assumes EUR` : 'Single currency — MRR calculation straightforward',
        pastDueSubs.length > 0 ? `${pastDueSubs.length} past-due subscriptions may need attention` : 'No past-due subscriptions',
      ],
    };

    // Write profiles
    await upsertDataProfile('stripe', 'customers', runId, { record_count: customers.length, field_count: meta.customer_fields.length, fields: meta.customer_fields, quality_score: Math.min(100, Math.round(activeSubs.length * 3 + (metadataKeys.size > 0 ? 20 : 0))), mapping_recommendations: STRIPE_CUSTOMER_MAPPINGS });
    await upsertDataProfile('stripe', 'subscriptions', runId, { record_count: subscriptions.length, field_count: meta.subscription_fields.length, fields: meta.subscription_fields, quality_score: Math.min(100, activeSubs.length > 0 ? 80 : 20), mapping_recommendations: STRIPE_SUBSCRIPTION_MAPPINGS });

    await completeSyncRun(runId, 'completed', { fetched: customers.length + subscriptions.length + invoices.length, written }, meta);

    return NextResponse.json({ status: 'ok', source: 'stripe', sync_run_id: runId,
      message: `${customers.length} customers · ${subscriptions.length} subscriptions (${activeSubs.length} active) · €${Math.round(totalMRR)}/mo MRR detected`,
      records_fetched: customers.length + subscriptions.length + invoices.length, profile: meta,
      customer_mappings: STRIPE_CUSTOMER_MAPPINGS, subscription_mappings: STRIPE_SUBSCRIPTION_MAPPINGS });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (runId) await completeSyncRun(runId, 'error', { fetched: 0, written: 0 }, {}, msg).catch(() => null);
    return NextResponse.json({ status: 'error', source: 'stripe', message: msg, records_fetched: 0 }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const configured = Boolean(ENV.STRIPE_SECRET_KEY);
  let lastRun = null;
  try { const { data } = await getSupabaseAdmin().from('source_sync_runs').select('*').eq('source', 'stripe').order('created_at', { ascending: false }).limit(1).single(); lastRun = data; } catch {}
  return NextResponse.json({ configured, last_run: lastRun });
}
