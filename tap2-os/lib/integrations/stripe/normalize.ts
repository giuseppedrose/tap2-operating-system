import type { StripeCustomer, StripeSubscription } from './types'
import type { Customer, Subscription } from '@/lib/supabase/types'

export function normalizeStripeCustomer(
  raw: StripeCustomer,
  existingId?: string
): Partial<Customer> {
  return {
    id: existingId,
    name: raw.name ?? raw.email,
    stripe_customer_id: raw.id,
    created_at: new Date(raw.created * 1000).toISOString(),
  }
}

export function normalizeStripeSubscription(
  raw: StripeSubscription,
  customerId: string
): Partial<Subscription> {
  const item = raw.items.data[0]
  const price = item?.price
  let mrr = 0
  if (price?.unit_amount && price.recurring) {
    mrr =
      price.recurring.interval === 'year'
        ? price.unit_amount / 12 / 100
        : (price.unit_amount * (item.quantity ?? 1)) / 100
  }

  return {
    customer_id: customerId,
    stripe_subscription_id: raw.id,
    status: raw.status as Subscription['status'],
    mrr: Math.round(mrr * 100) / 100,
    currency: price?.currency?.toUpperCase() ?? 'EUR',
    billing_interval: price?.recurring?.interval ?? 'month',
    started_at: new Date(raw.current_period_start * 1000).toISOString(),
    cancelled_at: raw.canceled_at
      ? new Date(raw.canceled_at * 1000).toISOString()
      : null,
  }
}
