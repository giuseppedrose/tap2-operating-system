import { getStripeClient } from './client'
import type { StripeCustomer, StripeSubscription } from './types'

export async function syncStripeCustomers(): Promise<StripeCustomer[]> {
  const stripe = getStripeClient()
  if (!stripe) return []

  const customers: StripeCustomer[] = []
  for await (const customer of stripe.customers.list({ limit: 100 })) {
    customers.push(customer as StripeCustomer)
  }
  return customers
}

export async function syncStripeSubscriptions(): Promise<StripeSubscription[]> {
  const stripe = getStripeClient()
  if (!stripe) return []

  const subscriptions: StripeSubscription[] = []
  for await (const sub of stripe.subscriptions.list({ limit: 100, status: 'all' })) {
    subscriptions.push(sub as StripeSubscription)
  }
  return subscriptions
}

export async function getCurrentMrr(): Promise<number> {
  const stripe = getStripeClient()
  if (!stripe) return 0

  let mrr = 0
  for await (const sub of stripe.subscriptions.list({ status: 'active', limit: 100 })) {
    for (const item of sub.items.data) {
      const price = item.price
      if (price.unit_amount && price.recurring) {
        const monthlyAmount =
          price.recurring.interval === 'year'
            ? price.unit_amount / 12
            : price.unit_amount
        mrr += (monthlyAmount * (item.quantity ?? 1)) / 100
      }
    }
  }
  return Math.round(mrr * 100) / 100
}
