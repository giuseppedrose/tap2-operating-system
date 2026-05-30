import { instantlyFetch, isInstantlyConfigured } from './client'
import type { InstantlyCampaign, InstantlyCampaignAnalytics, InstantlyLead } from './types'

export async function syncCampaigns(): Promise<InstantlyCampaign[]> {
  if (!isInstantlyConfigured) return []
  const data = await instantlyFetch('/campaign/list?limit=100')
  return data.campaigns ?? []
}

export async function syncCampaignAnalytics(campaignId: string): Promise<InstantlyCampaignAnalytics | null> {
  if (!isInstantlyConfigured) return null
  try {
    const data = await instantlyFetch(`/analytics/campaign/summary?campaign_id=${campaignId}`)
    return data ?? null
  } catch {
    return null
  }
}

export async function syncCampaignLeads(campaignId: string, limit = 100): Promise<InstantlyLead[]> {
  if (!isInstantlyConfigured) return []
  const data = await instantlyFetch(`/lead/list?campaign_id=${campaignId}&limit=${limit}`)
  return data.leads ?? []
}
