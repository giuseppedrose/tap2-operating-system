import { getSupabaseClient } from './client'

// --- Revenue / Customers ---
export interface DbCustomer {
  id: string
  name: string
  country: string | null
  city: string | null
  industry: string | null
  source: string | null
  partner_owner: string | null
  status: string
  current_mrr: number
  start_date: string | null
  churn_date: string | null
  created_at: string
}

export async function fetchCustomers(): Promise<DbCustomer[] | null> {
  const sb = getSupabaseClient()
  if (!sb) return null
  const { data, error } = await sb
    .from('customers')
    .select('*')
    .order('current_mrr', { ascending: false })
  if (error) { console.error('fetchCustomers:', error.message); return null }
  return data
}

// --- Deals / Pipeline ---
export interface DbDeal {
  id: string
  company_name: string
  deal_name: string | null
  stage: string
  value: number | null
  expected_mrr: number | null
  probability: number | null
  source: string | null
  partner_owner: string | null
  close_date: string | null
  created_at: string
}

export async function fetchDeals(): Promise<DbDeal[] | null> {
  const sb = getSupabaseClient()
  if (!sb) return null
  const { data, error } = await sb
    .from('deals')
    .select('*')
    .order('close_date', { ascending: true })
  if (error) { console.error('fetchDeals:', error.message); return null }
  return data
}

// --- Cash Snapshots ---
export interface DbCashSnapshot {
  id: string
  snapshot_date: string
  bank_balance: number
  monthly_burn: number
  runway_months: number | null
  accounts_receivable: number | null
  outstanding_invoices: number | null
}

export async function fetchCashSnapshots(): Promise<DbCashSnapshot[] | null> {
  const sb = getSupabaseClient()
  if (!sb) return null
  const { data, error } = await sb
    .from('cash_snapshots')
    .select('*')
    .order('snapshot_date', { ascending: true })
  if (error) { console.error('fetchCashSnapshots:', error.message); return null }
  return data
}

// --- Outbound Campaigns ---
export interface DbCampaign {
  id: string
  name: string
  market: string | null
  segment: string | null
  owner: string | null
  status: string
  emails_sent: number
  open_rate: number | null
  reply_rate: number | null
  positive_reply_rate: number | null
  meetings_booked: number
  demos_completed: number
  deals_created: number
  pipeline_generated: number | null
  mrr_closed: number | null
}

export async function fetchCampaigns(): Promise<DbCampaign[] | null> {
  const sb = getSupabaseClient()
  if (!sb) return null
  const { data, error } = await sb
    .from('outbound_campaigns')
    .select('*')
    .order('emails_sent', { ascending: false })
  if (error) { console.error('fetchCampaigns:', error.message); return null }
  return data
}

// --- Product Metrics ---
export interface DbProductMetric {
  id: string
  date: string
  active_clients: number
  active_wallets: number
  wallet_installs: number
  active_cards: number
  notifications_sent: number
  scans: number
  redemptions: number
}

export async function fetchProductMetrics(): Promise<DbProductMetric[] | null> {
  const sb = getSupabaseClient()
  if (!sb) return null
  const { data, error } = await sb
    .from('product_metrics')
    .select('*')
    .order('date', { ascending: true })
  if (error) { console.error('fetchProductMetrics:', error.message); return null }
  return data
}

// --- Partners ---
export interface DbPartner {
  id: string
  name: string
  role: string | null
  country_focus: string | null
  language: string | null
  active: boolean
}

export async function fetchPartners(): Promise<DbPartner[] | null> {
  const sb = getSupabaseClient()
  if (!sb) return null
  const { data, error } = await sb
    .from('partners')
    .select('*')
    .eq('active', true)
    .order('name')
  if (error) { console.error('fetchPartners:', error.message); return null }
  return data
}
