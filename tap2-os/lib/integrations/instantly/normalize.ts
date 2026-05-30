import type { InstantlyCampaign, InstantlyCampaignAnalytics, InstantlyLead, AttributionMatch } from './types'
import type { OutboundCampaign, CampaignLead } from '@/lib/supabase/types'

export function normalizeInstantlyCampaign(
  raw: InstantlyCampaign,
  analytics: InstantlyCampaignAnalytics | null
): Partial<OutboundCampaign> {
  return {
    instantly_campaign_id: raw.id,
    name: raw.name,
    status: raw.status,
    emails_sent: analytics?.emails_sent ?? 0,
    open_rate: analytics?.open_rate ?? 0,
    reply_rate: analytics?.reply_rate ?? 0,
    positive_reply_rate: analytics?.positive_reply_rate ?? 0,
    created_at: raw.created_at,
  }
}

export function normalizeInstantlyLead(raw: InstantlyLead, campaignId: string): Partial<CampaignLead> {
  return {
    campaign_id: campaignId,
    email: raw.email,
    company_name: raw.company_name,
    contact_name: [raw.first_name, raw.last_name].filter(Boolean).join(' ') || null,
    created_at: raw.created_at,
  }
}

// Attribution matching: Instantly lead → HubSpot contact/deal
// Priority: exact email > domain > company name fuzzy
export function matchLeadToHubspot(
  lead: InstantlyLead,
  hubspotContacts: Array<{ id: string; email: string | null; domain: string | null; company: string | null }>,
  hubspotDeals: Array<{ id: string; company: string | null }>
): AttributionMatch {
  const domain = lead.email.split('@')[1]?.toLowerCase()

  // 1. Exact email match
  const emailMatch = hubspotContacts.find(
    (c) => c.email?.toLowerCase() === lead.email.toLowerCase()
  )
  if (emailMatch) {
    return {
      instantlyLeadId: lead.id,
      instantlyEmail: lead.email,
      hubspotContactId: emailMatch.id,
      hubspotCompanyId: null,
      hubspotDealId: null,
      matchMethod: 'email',
      confidence: 1.0,
    }
  }

  // 2. Domain match
  const domainMatch = hubspotContacts.find(
    (c) => c.domain?.toLowerCase() === domain
  )
  if (domainMatch) {
    return {
      instantlyLeadId: lead.id,
      instantlyEmail: lead.email,
      hubspotContactId: domainMatch.id,
      hubspotCompanyId: null,
      hubspotDealId: null,
      matchMethod: 'domain',
      confidence: 0.8,
    }
  }

  // 3. Company name fuzzy match (simple Levenshtein distance <= 3)
  if (lead.company_name) {
    const normalized = lead.company_name.toLowerCase().trim()
    const dealMatch = hubspotDeals.find((d) => {
      const dn = d.company?.toLowerCase().trim() ?? ''
      return levenshtein(normalized, dn) <= 3
    })
    if (dealMatch) {
      return {
        instantlyLeadId: lead.id,
        instantlyEmail: lead.email,
        hubspotContactId: null,
        hubspotCompanyId: null,
        hubspotDealId: dealMatch.id,
        matchMethod: 'company_name',
        confidence: 0.6,
      }
    }
  }

  return {
    instantlyLeadId: lead.id,
    instantlyEmail: lead.email,
    hubspotContactId: null,
    hubspotCompanyId: null,
    hubspotDealId: null,
    matchMethod: 'none',
    confidence: 0,
  }
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}
