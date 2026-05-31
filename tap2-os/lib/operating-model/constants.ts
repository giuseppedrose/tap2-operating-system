// Tap2 Operating Model — constants and assumptions
// Single source of truth for all business logic calculations

export const REFERENCE_DATE = new Date('2026-05-30');

// Pricing tiers (€/month)
export const ARPA_TIERS = {
  starter:  { label: 'Starter',  mrr: 29,  arr: 348,   markets: ['CO', 'LatAm'] },
  basic:    { label: 'Basic',    mrr: 49,  arr: 588,   markets: ['ES', 'IT', 'BE'] },
  growth:   { label: 'Growth',   mrr: 89,  arr: 1068,  markets: ['NL', 'EU'] },
  pro:      { label: 'Pro',      mrr: 149, arr: 1788,  markets: ['NL', 'EU'] },
  bundle:   { label: 'Bundle',   mrr: 178, arr: 2136,  markets: ['NL', 'EU'] },
  agency:   { label: 'Agency',   mrr: 267, arr: 3204,  markets: ['Global'] },
} as const;

// Blended ARPA (target)
export const BLENDED_ARPA = 44; // €/month — derived from €1,400 MRR / 32 clients

// Revenue milestones
export const MILESTONES = {
  current:    { mrr: 1400,  arr: 16800,  clients: 32 },
  target1:    { mrr: 8300,  arr: 99600,  clients: 189, label: '€100k ARR' },
  target2:    { mrr: 41700, arr: 500000, clients: 948, label: '€500k ARR' },
  target3:    { mrr: 83300, arr: 1000000, clients: 1894, label: '€1M ARR' },
} as const;

// Deal stage probabilities (%)
export const STAGE_PROBABILITY: Record<string, number> = {
  'New Lead':             5,
  'Contacted':            10,
  'Positive Reply':       20,
  'Meeting Booked':       30,
  'Discovery Completed':  40,
  'Demo Completed':       50,
  'Proposal Sent':        60,
  'Trial / Pilot':        75,
  'Negotiation':          85,
  'Closed Won':           100,
  'Closed Lost':          0,
  'Nurture':              5,
};

// Stale thresholds — days in stage before flagging stale
export const STALE_THRESHOLDS: Record<string, number> = {
  'New Lead':             7,
  'Contacted':            7,
  'Positive Reply':       5,
  'Meeting Booked':       10,
  'Discovery Completed':  7,
  'Demo Completed':       10,
  'Proposal Sent':        10,
  'Trial / Pilot':        14,
  'Negotiation':          7,
};

// Deal quality scoring weights (sum = 100)
export const QUALITY_WEIGHTS = {
  icpFit:               20,
  sourceQuality:        15,
  positiveReply:        10,
  meetingCompleted:     15,
  decisionMaker:        10,
  budgetFit:            10,
  clearNextStep:        10,
  closeDateSet:         5,
  useCaseFit:           5,
} as const;

// ICP segments
export const ICP_SEGMENTS = [
  'Independent Restaurant',
  'Café / Bar / Takeaway',
  'Restaurant Group / Chain',
  'Gym / Sports Club',
  'Retail / Shop',
  'Beauty / Wellness',
  'Tenant Card / Real Estate',
  'Dark Kitchen',
  'Catering',
  'Other',
] as const;

// GTM sources
export const GTM_SOURCES = [
  'Cold Email',
  'Cold Calling',
  'LinkedIn',
  'Referral',
  'Horecava',
  'HIP Spain',
  'CitySales',
  'OptiDist',
  'Qubico Studio',
  'Colombia Outbound',
  'Italy Outbound',
  'Spain Outbound',
  'Website / Inbound',
  'Partner Referral',
  'Other',
] as const;

// Forecast monthly churn assumptions by scenario
export const CHURN_ASSUMPTIONS = {
  conservative: 3.5,
  expected:     2.1,
  aggressive:   1.2,
  investor:     1.5,
};

// Burn estimate (monthly)
export const MONTHLY_BURN_ESTIMATE = 8200;
export const CASH_ESTIMATE = 38500;
