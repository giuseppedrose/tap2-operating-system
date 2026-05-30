import type { HubSpotDeal, HubSpotCompany } from './types'
import { HUBSPOT_STAGE_MAP } from './types'
import type { Deal, Customer } from '@/lib/supabase/types'

export function normalizeHubSpotDeal(raw: HubSpotDeal): Partial<Deal> {
  const p = raw.properties
  const stage = HUBSPOT_STAGE_MAP[p.dealstage] ?? 'Lead'
  const value = p.amount ? parseFloat(p.amount) : null
  const probability = p.hs_deal_stage_probability
    ? Math.round(parseFloat(p.hs_deal_stage_probability) * 100)
    : 0

  return {
    hubspot_deal_id: raw.id,
    deal_name: p.dealname,
    stage: stage as Deal['stage'],
    value,
    probability,
    close_date: p.closedate ? p.closedate.split('T')[0] : null,
    created_at: p.createdate,
  }
}

export function normalizeHubSpotCompany(raw: HubSpotCompany): Partial<Customer> {
  const p = raw.properties
  return {
    name: p.name,
    hubspot_company_id: raw.id,
    country: p.country ?? null,
    city: p.city ?? null,
    industry: p.industry ?? null,
    created_at: p.createdate,
  }
}
