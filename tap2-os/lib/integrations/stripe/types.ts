export interface StripeCustomer {
  id: string
  email: string
  name: string | null
  metadata: Record<string, string>
  created: number
}

export interface StripeSubscription {
  id: string
  customer: string
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete'
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  canceled_at: number | null
  items: {
    data: StripeSubscriptionItem[]
  }
}

export interface StripeSubscriptionItem {
  id: string
  price: StripePrice
  quantity: number
}

export interface StripePrice {
  id: string
  unit_amount: number | null
  currency: string
  recurring: {
    interval: 'month' | 'year'
    interval_count: number
  } | null
}

export interface StripeInvoice {
  id: string
  customer: string
  subscription: string | null
  amount_paid: number
  amount_due: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'
  created: number
  period_start: number
  period_end: number
}

export interface StripeMrrSnapshot {
  date: string
  mrr: number
  newMrr: number
  churnedMrr: number
  expansionMrr: number
  activeSubscriptions: number
}
