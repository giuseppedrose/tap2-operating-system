// Tap2 OS — Supabase database types
// Matches schema.sql exactly

export type CustomerStatus = 'active' | 'trial' | 'churned' | 'paused'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid'
export type BillingInterval = 'month' | 'year'
export type DealStage =
  | 'Lead'
  | 'Contacted'
  | 'Meeting Booked'
  | 'Demo Completed'
  | 'Proposal Sent'
  | 'Trial Started'
  | 'Negotiation'
  | 'Closed Won'
  | 'Closed Lost'
export type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft'
export type LeadStatus = 'new' | 'contacted' | 'replied' | 'positive' | 'meeting' | 'not_interested' | 'unsubscribed'
export type MeetingType = 'Discovery' | 'Demo' | 'Follow-up' | 'Investor' | 'Partner' | 'Client Success' | 'Other'
export type Sentiment = 'positive' | 'neutral' | 'negative'
export type ForecastScenario = 'Conservative' | 'Expected' | 'Aggressive'
export type ExpenseCategory =
  | 'Payroll'
  | 'Contractor'
  | 'Development'
  | 'Marketing'
  | 'SaaS'
  | 'Legal'
  | 'Accounting'
  | 'Travel'
  | 'Office'
  | 'Tax'
  | 'Founder Expense'
  | 'Revenue'
  | 'Other'
  | 'Needs Review'

export interface Partner {
  id: string
  name: string
  role: string | null
  country_focus: string | null
  language: string | null
  active: boolean
  created_at: string
}

export interface GtmSource {
  id: string
  name: string
  category: string
  active: boolean
}

export interface Customer {
  id: string
  name: string
  country: string | null
  city: string | null
  industry: string | null
  source: string | null
  partner_owner: string | null
  stripe_customer_id: string | null
  hubspot_company_id: string | null
  status: CustomerStatus
  current_mrr: number
  start_date: string | null
  churn_date: string | null
  created_at: string
}

export interface Subscription {
  id: string
  customer_id: string
  stripe_subscription_id: string | null
  status: SubscriptionStatus
  mrr: number
  currency: string
  billing_interval: BillingInterval
  started_at: string | null
  cancelled_at: string | null
  created_at: string
}

export interface Deal {
  id: string
  hubspot_deal_id: string | null
  company_name: string
  deal_name: string | null
  stage: DealStage
  value: number | null
  expected_mrr: number | null
  probability: number
  source: string | null
  partner_owner: string | null
  close_date: string | null
  created_at: string
}

export interface OutboundCampaign {
  id: string
  instantly_campaign_id: string | null
  name: string
  market: string | null
  segment: string | null
  owner: string | null
  status: CampaignStatus
  emails_sent: number
  open_rate: number
  reply_rate: number
  positive_reply_rate: number
  meetings_booked: number
  demos_completed: number
  deals_created: number
  pipeline_generated: number
  mrr_closed: number
  created_at: string
}

export interface CampaignLead {
  id: string
  campaign_id: string
  email: string
  company_name: string | null
  contact_name: string | null
  country: string | null
  city: string | null
  segment: string | null
  status: LeadStatus
  replied: boolean
  positive_reply: boolean
  meeting_booked: boolean
  hubspot_contact_id: string | null
  hubspot_company_id: string | null
  hubspot_deal_id: string | null
  created_at: string
}

export interface Meeting {
  id: string
  title: string
  source: string | null
  partner_owner: string | null
  company_name: string | null
  contact_name: string | null
  calendar_event_id: string | null
  fathom_call_id: string | null
  meeting_type: MeetingType
  meeting_date: string
  outcome: string | null
  next_step: string | null
  created_at: string
}

export interface CallInsight {
  id: string
  meeting_id: string
  summary: string | null
  objections: string[] | null
  buying_signals: string[] | null
  next_steps: string[] | null
  sentiment: Sentiment | null
  ai_score: number | null
  created_at: string
}

export interface BankTransaction {
  id: string
  transaction_date: string
  description: string
  counterparty: string | null
  amount: number
  currency: string
  category: ExpenseCategory
  subcategory: string | null
  is_recurring: boolean
  source_file: string | null
  created_at: string
}

export interface CashSnapshot {
  id: string
  snapshot_date: string
  bank_balance: number
  monthly_burn: number
  runway_months: number | null
  accounts_receivable: number
  outstanding_invoices: number
  created_at: string
}

export interface ProductMetrics {
  id: string
  date: string
  active_clients: number
  active_wallets: number
  wallet_installs: number
  active_cards: number
  notifications_sent: number
  scans: number
  redemptions: number
  created_at: string
}

export interface Forecast {
  id: string
  scenario: ForecastScenario
  month: string
  new_customers: number
  churned_customers: number
  expected_mrr: number
  expected_arr: number
  expected_cash: number
  created_at: string
}

// Joined / enriched types used in UI
export interface CustomerWithPartner extends Customer {
  partner?: Partner
}

export interface DealWithPartner extends Deal {
  partner?: Partner
}
