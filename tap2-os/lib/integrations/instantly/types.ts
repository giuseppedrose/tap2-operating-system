export interface InstantlyCampaign {
  id: string
  name: string
  status: 'active' | 'paused' | 'completed' | 'draft'
  created_at: string
}

export interface InstantlyCampaignAnalytics {
  campaign_id: string
  total_leads: number
  contacted_leads: number
  emails_sent: number
  unique_opens: number
  unique_replies: number
  positive_replies: number
  bounced: number
  unsubscribed: number
  open_rate: number
  reply_rate: number
  positive_reply_rate: number
}

export interface InstantlyLead {
  id: string
  campaign_id: string
  email: string
  first_name: string | null
  last_name: string | null
  company_name: string | null
  website: string | null
  status: string
  created_at: string
}

export interface InstantlyLeadEmailActivity {
  lead_id: string
  email: string
  subject: string
  sent_at: string
  opened_at: string | null
  replied_at: string | null
  reply_body: string | null
  sentiment: 'positive' | 'negative' | 'neutral' | null
}

// Match result when linking an Instantly lead to a HubSpot contact/deal
export interface AttributionMatch {
  instantlyLeadId: string
  instantlyEmail: string
  hubspotContactId: string | null
  hubspotCompanyId: string | null
  hubspotDealId: string | null
  matchMethod: 'email' | 'domain' | 'company_name' | 'none'
  confidence: number
}
