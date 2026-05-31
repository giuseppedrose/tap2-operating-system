import { NextRequest, NextResponse } from 'next/server';
import { createSyncRun, completeSyncRun, upsertRawRecord, getSupabaseAdmin } from '@/lib/integrations/supabase-admin';
import { STRIPE_CUSTOMER_MAPPINGS, STRIPE_SUBSCRIPTION_MAPPINGS, calcMRRFromSubscription } from '@/lib/integrations/mapping/stripe-mapper';
import { confidenceScore } from '@/lib/integrations/mapping/mapping-confidence';

function checkAuth(req: NextRequest): boolean {
  const session = req.cookies.get('tap2_admin_session');
  return Boolean(session?.value && session.value.length >= 32);
}

async function stripeGet(path: string, apiKey: string, params?: Record<string, string>) {
  const url = new URL(`https://api.stripe.com/v1${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}`, 'Stripe-Version': '2023-10-16' },
  });
  if (!res.ok) {
    const err = await res.json() as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Stripe API error: ${res.status}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

function profileFields(records: Record<string, unknown>[]): { name: string; type: string; population_rate: number }[] {
  if (!records.length) return [];
  const allKeys = new Set<string>();
  records.forEach(r => Object.keys(r).forEach(k => allKeys.add(k)));
  return Array.from(allKeys).map(key => {
    const populated = records.filter(r => r[key] != null && r[key] !== '').length;
    const val = records[0]?.[key];
    return { name: key, type: Array.isArray(val) ? 'array' : typeof val, population_rate: Math.round((populated / records.length) * 100) };
  }).sort((a, b) => b.population_rate - a.population_rate);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    return NextResponse.json({ status: 'no_credentials', source: 'stripe', message: 'STRIPE_SECRET_KEY not configured. Add it to Vercel environment variables.', records_fetched: 0 });
  }

  let syncRunId: string | null = null;
  try {
    syncRunId = await createSyncRun('stripe', 'discovery');
    const [customersRes, subsRes, invoicesRes] = await Promise.all([
      stripeGet('/customers', apiKey, { limit: '50' }),
      stripeGet('/subscriptions', apiKey, { limit: '50', status: 'all' }),
      stripeGet('/invoices', apiKey, { limit: '50' }),
    ]);

    const customers = (customersRes.data as Record<string, unknown>[]) ?? [];
    const subscriptions = (subsRes.data as Record<string, unknown>[]) ?? [];
    const invoices = (invoicesRes.data as Record<string, unknown>[]) ?? [];

    let written = 0;
    for (const c of customers) { try { await upsertRawRecord('raw_stripe_customers', String(c.id), c, syncRunId); written++; } catch {} }
    for (const s of subscriptions) { try { await upsertRawRecord('raw_stripe_subscriptions', String(s.id), s, syncRunId, { customer_id: String(s.customer ?? '') }); written++; } catch {} }
    for (const inv of invoices) { try { await upsertRawRecord('raw_stripe_invoices', String(inv.id), inv, syncRunId, { customer_id: String(inv.customer ?? '') }); written++; } catch {} }

    const activeSubs = subscriptions.filter(s => s.status === 'active' || s.status === 'trialing');
    const totalMRR = activeSubs.reduce((sum, s) => sum + calcMRRFromSubscription(s) / 100, 0);
    const currencies = [...new Set(subscriptions.map(s => s.currency).filter(Boolean))];
    const meta = {
      customer_count: customers.length, subscription_count: subscriptions.length,
      active_subscriptions: activeSubs.length, invoice_count: invoices.length,
      estimated_mrr_eur: Math.round(totalMRR), currencies_detected: currencies,
      customer_fields: profileFields(customers).slice(0, 20),
      subscription_fields: profileFields(subscriptions).slice(0, 20),
      mapping_confidence: confidenceScore(STRIPE_CUSTOMER_MAPPINGS),
      has_more: { customers: customersRes.has_more, subscriptions: subsRes.has_more },
    };

    await completeSyncRun(syncRunId, 'completed', { fetched: customers.length + subscriptions.length + invoices.length, written }, meta);
    return NextResponse.json({ status: 'ok', source: 'stripe', sync_run_id: syncRunId, message: `${customers.length} customers, ${subscriptions.length} subscriptions, ${invoices.length} invoices discovered.`, records_fetched: customers.length + subscriptions.length + invoices.length, profile: meta, customer_mappings: STRIPE_CUSTOMER_MAPPINGS, subscription_mappings: STRIPE_SUBSCRIPTION_MAPPINGS });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    if (syncRunId) await completeSyncRun(syncRunId, 'error', { fetched: 0, written: 0 }, {}, msg).catch(() => null);
    return NextResponse.json({ status: 'error', source: 'stripe', message: msg, records_fetched: 0 }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const configured = Boolean(process.env.STRIPE_SECRET_KEY);
  let lastRun = null;
  try {
    const { data } = await getSupabaseAdmin().from('source_sync_runs').select('*').eq('source', 'stripe').order('created_at', { ascending: false }).limit(1).single();
    lastRun = data;
  } catch {}
  return NextResponse.json({ configured, last_run: lastRun });
}
