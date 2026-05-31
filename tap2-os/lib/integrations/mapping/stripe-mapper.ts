import type { FieldMapping } from './types';

export const STRIPE_CUSTOMER_MAPPINGS: FieldMapping[] = [
  { source: 'stripe', object_type: 'customer', source_field: 'id',                  tap2_field: 'stripe_customer_id', tap2_table: 'customers', confidence: 'exact' },
  { source: 'stripe', object_type: 'customer', source_field: 'email',               tap2_field: 'email',              tap2_table: 'customers', confidence: 'exact' },
  { source: 'stripe', object_type: 'customer', source_field: 'name',                tap2_field: 'company_name',       tap2_table: 'customers', confidence: 'likely',  notes: 'May be personal name or company — verify' },
  { source: 'stripe', object_type: 'customer', source_field: 'created',             tap2_field: 'start_date',         tap2_table: 'customers', confidence: 'likely',  notes: 'Customer created ≈ subscription start for small teams' },
  { source: 'stripe', object_type: 'customer', source_field: 'metadata.hubspot_id', tap2_field: 'hubspot_company_id', tap2_table: 'customers', confidence: 'possible', notes: 'Only if HubSpot ID is stored in Stripe metadata' },
  { source: 'stripe', object_type: 'customer', source_field: 'metadata.market',     tap2_field: 'country',            tap2_table: 'customers', confidence: 'possible', notes: 'Only if market is stored in Stripe customer metadata' },
  { source: 'stripe', object_type: 'customer', source_field: 'address.country',     tap2_field: 'country',            tap2_table: 'customers', confidence: 'likely',   notes: 'Billing address country' },
];

export const STRIPE_SUBSCRIPTION_MAPPINGS: FieldMapping[] = [
  { source: 'stripe', object_type: 'subscription', source_field: 'id',             tap2_field: 'stripe_subscription_id', tap2_table: 'subscriptions', confidence: 'exact' },
  { source: 'stripe', object_type: 'subscription', source_field: 'customer',       tap2_field: 'stripe_customer_id',     tap2_table: 'subscriptions', confidence: 'exact' },
  { source: 'stripe', object_type: 'subscription', source_field: 'status',         tap2_field: 'status',                 tap2_table: 'subscriptions', confidence: 'exact',  notes: 'active | trialing | past_due | canceled | unpaid' },
  { source: 'stripe', object_type: 'subscription', source_field: 'items.data[0].price.unit_amount', tap2_field: 'mrr_cents', tap2_table: 'subscriptions', confidence: 'exact', notes: 'Price in cents / billing interval = MRR' },
  { source: 'stripe', object_type: 'subscription', source_field: 'items.data[0].price.recurring.interval', tap2_field: 'billing_interval', tap2_table: 'subscriptions', confidence: 'exact' },
  { source: 'stripe', object_type: 'subscription', source_field: 'current_period_start', tap2_field: 'period_start',    tap2_table: 'subscriptions', confidence: 'exact' },
  { source: 'stripe', object_type: 'subscription', source_field: 'current_period_end',   tap2_field: 'period_end',      tap2_table: 'subscriptions', confidence: 'exact' },
  { source: 'stripe', object_type: 'subscription', source_field: 'trial_end',       tap2_field: 'trial_end',             tap2_table: 'subscriptions', confidence: 'exact' },
  { source: 'stripe', object_type: 'subscription', source_field: 'canceled_at',     tap2_field: 'churn_date',            tap2_table: 'subscriptions', confidence: 'exact' },
];

// MRR calculation logic for Stripe
export function calcMRRFromSubscription(subscription: Record<string, unknown>): number {
  const items = (subscription.items as { data?: { price?: { unit_amount?: number; recurring?: { interval?: string } } }[] })?.data ?? [];
  if (!items.length) return 0;
  const price = items[0]?.price;
  if (!price?.unit_amount) return 0;
  const interval = price.recurring?.interval ?? 'month';
  const amountCents = price.unit_amount;
  // Normalise to monthly
  if (interval === 'year') return Math.round(amountCents / 12);
  if (interval === 'week') return Math.round(amountCents * 4.33);
  return amountCents; // already monthly in cents
}
