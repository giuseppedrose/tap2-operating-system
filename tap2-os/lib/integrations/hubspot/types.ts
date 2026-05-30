export interface HubSpotDeal {
  id: string
  properties: {
    dealname: string
    dealstage: string
    amount: string | null
    closedate: string | null
    hs_deal_stage_probability: string | null
    hubspot_owner_id: string | null
    createdate: string
  }
}

export interface HubSpotCompany {
  id: string
  properties: {
    name: string
    domain: string | null
    country: string | null
    city: string | null
    industry: string | null
    createdate: string
  }
}

export interface HubSpotContact {
  id: string
  properties: {
    firstname: string | null
    lastname: string | null
    email: string | null
    company: string | null
    createdate: string
  }
}

export interface HubSpotOwner {
  id: string
  email: string
  firstName: string
  lastName: string
}

// Stage ID → stage name mapping (configure per your HubSpot portal)
export const HUBSPOT_STAGE_MAP: Record<string, string> = {
  appointmentscheduled: 'Meeting Booked',
  qualifiedtobuy: 'Demo Completed',
  presentationscheduled: 'Proposal Sent',
  decisionmakerboughtin: 'Trial Started',
  contractsent: 'Negotiation',
  closedwon: 'Closed Won',
  closedlost: 'Closed Lost',
}
