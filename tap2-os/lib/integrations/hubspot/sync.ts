import { hubspotFetch, isHubSpotConfigured } from './client'
import type { HubSpotDeal, HubSpotCompany, HubSpotContact } from './types'

export async function syncDeals(): Promise<HubSpotDeal[]> {
  if (!isHubSpotConfigured) return []

  const data = await hubspotFetch(
    '/crm/v3/objects/deals?limit=100&properties=dealname,dealstage,amount,closedate,hs_deal_stage_probability,hubspot_owner_id'
  )
  return data.results as HubSpotDeal[]
}

export async function syncCompanies(): Promise<HubSpotCompany[]> {
  if (!isHubSpotConfigured) return []

  const data = await hubspotFetch(
    '/crm/v3/objects/companies?limit=100&properties=name,domain,country,city,industry'
  )
  return data.results as HubSpotCompany[]
}

export async function syncContacts(): Promise<HubSpotContact[]> {
  if (!isHubSpotConfigured) return []

  const data = await hubspotFetch(
    '/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,company'
  )
  return data.results as HubSpotContact[]
}
