// The 15 customers are the source of truth — linked across all dashboards
export const CUSTOMERS = [
  { id: 'c01', name: 'De Groenhoek', country: 'NL', city: 'Amsterdam', source: 'Horecava', partner: 'Giuseppe', mrr: 89, status: 'active', startDate: '2025-01-15', segment: 'Restaurant', riskLevel: 'low', stripeStatus: 'active' },
  { id: 'c02', name: 'Vega Kitchen Amsterdam', country: 'NL', city: 'Amsterdam', source: 'Cold Calling', partner: 'Dorian', mrr: 89, status: 'active', startDate: '2025-02-01', segment: 'Restaurant', riskLevel: 'low', stripeStatus: 'mock' },
  { id: 'c03', name: 'El Vergel Madrid', country: 'ES', city: 'Madrid', source: 'HIP Spain', partner: 'Joaquin', mrr: 49, status: 'active', startDate: '2025-03-10', segment: 'Restaurant', riskLevel: 'low', stripeStatus: 'mock' },
  { id: 'c04', name: 'Roots & Co', country: 'NL', city: 'Utrecht', source: 'Referral', partner: 'Giuseppe', mrr: 89, status: 'active', startDate: '2025-01-20', segment: 'Restaurant', riskLevel: 'low', stripeStatus: 'mock' },
  { id: 'c05', name: 'Green Elephant', country: 'NL', city: 'Den Haag', source: 'LinkedIn', partner: 'Niels', mrr: 49, status: 'trial', startDate: '2025-11-01', segment: 'Restaurant', riskLevel: 'medium', stripeStatus: 'mock' },
  { id: 'c06', name: 'La Floresta Barcelona', country: 'ES', city: 'Barcelona', source: 'HIP Spain', partner: 'Joaquin', mrr: 49, status: 'active', startDate: '2025-04-05', segment: 'Restaurant', riskLevel: 'low', stripeStatus: 'mock' },
  { id: 'c07', name: 'Plantiful Haarlem', country: 'NL', city: 'Haarlem', source: 'Cold Email', partner: 'Carlo', mrr: 89, status: 'active', startDate: '2025-02-14', segment: 'Restaurant', riskLevel: 'low', stripeStatus: 'mock' },
  { id: 'c08', name: 'Bio Bistro Utrecht', country: 'NL', city: 'Utrecht', source: 'Horecava', partner: 'Giuseppe', mrr: 89, status: 'active', startDate: '2025-03-22', segment: 'Restaurant', riskLevel: 'low', stripeStatus: 'mock' },
  { id: 'c09', name: 'Madre Tierra Bogotá', country: 'CO', city: 'Bogotá', source: 'Colombia', partner: 'Jonathan', mrr: 29, status: 'active', startDate: '2025-05-01', segment: 'Restaurant', riskLevel: 'medium', stripeStatus: 'mock' },
  { id: 'c10', name: 'Naturverde Milan', country: 'IT', city: 'Milan', source: 'Italy Outbound', partner: 'Carlo', mrr: 49, status: 'active', startDate: '2025-06-01', segment: 'Restaurant', riskLevel: 'low', stripeStatus: 'mock' },
  { id: 'c11', name: 'The Sprout Rotterdam', country: 'NL', city: 'Rotterdam', source: 'Cold Calling', partner: 'Dorian', mrr: 89, status: 'active', startDate: '2025-04-18', segment: 'Restaurant', riskLevel: 'low', stripeStatus: 'mock' },
  { id: 'c12', name: 'Vegano Valencia', country: 'ES', city: 'Valencia', source: 'HIP Spain', partner: 'Joaquin', mrr: 0, status: 'churned', startDate: '2025-02-01', segment: 'Restaurant', riskLevel: 'churned', stripeStatus: 'canceled' },
  { id: 'c13', name: 'Conscious Kitchen Den Haag', country: 'NL', city: 'Den Haag', source: 'LinkedIn', partner: 'Niels', mrr: 89, status: 'active', startDate: '2025-07-10', segment: 'Restaurant', riskLevel: 'low', stripeStatus: 'mock' },
  { id: 'c14', name: 'Pura Vida Medellín', country: 'CO', city: 'Medellín', source: 'Colombia', partner: 'Jonathan', mrr: 29, status: 'active', startDate: '2025-08-01', segment: 'Restaurant', riskLevel: 'medium', stripeStatus: 'mock' },
  { id: 'c15', name: 'Qubico Demo Client', country: 'NL', city: 'Amsterdam', source: 'Qubico Studio', partner: 'Qubico Studio', mrr: 89, status: 'trial', startDate: '2025-11-15', segment: 'Restaurant', riskLevel: 'medium', stripeStatus: 'mock' },
] as const;

// Computed from customers
export const ACTIVE_CUSTOMERS = CUSTOMERS.filter(c => c.status === 'active');
export const CURRENT_MRR = ACTIVE_CUSTOMERS.reduce((s, c) => s + c.mrr, 0);
export const ACTIVE_CLIENT_COUNT = ACTIVE_CUSTOMERS.length;
export const ARR = CURRENT_MRR * 12;
export const ARPA = Math.round(CURRENT_MRR / ACTIVE_CLIENT_COUNT);

// Partner performance computed from customers + deals
export const PARTNER_NAMES = ['Giuseppe', 'Dorian', 'Joaquin', 'Jonathan', 'Carlo', 'Niels', 'Qubico Studio', 'Other'] as const;
export type PartnerName = typeof PARTNER_NAMES[number];

// Lifecycle stages with funnel counts
export const LIFECYCLE_STAGES = [
  { stage: 'Lead Captured', count: 312, avgDaysInStage: 2 },
  { stage: 'Contacted', count: 187, avgDaysInStage: 4 },
  { stage: 'Replied', count: 94, avgDaysInStage: 3 },
  { stage: 'Meeting Booked', count: 48, avgDaysInStage: 7 },
  { stage: 'Demo Completed', count: 32, avgDaysInStage: 5 },
  { stage: 'Proposal Sent', count: 21, avgDaysInStage: 8 },
  { stage: 'Trial Started', count: 14, avgDaysInStage: 14 },
  { stage: 'Customer Won', count: 13, avgDaysInStage: 0 },
  { stage: 'Active Customer', count: ACTIVE_CUSTOMERS.length, avgDaysInStage: 0 },
  { stage: 'At-Risk', count: 3, avgDaysInStage: 0 },
  { stage: 'Churned', count: 1, avgDaysInStage: 0 },
];

// Common objections
export const OBJECTIONS = [
  { text: 'We already use stamp cards', count: 34, partners: ['Dorian', 'Carlo'], sources: ['Cold Calling', 'Cold Email'] },
  { text: 'Too expensive', count: 28, partners: ['Joaquin', 'Niels'], sources: ['HIP Spain', 'LinkedIn'] },
  { text: 'We need POS integration', count: 22, partners: ['Giuseppe', 'Carlo'], sources: ['Horecava', 'Cold Email'] },
  { text: 'We need to think about it', count: 19, partners: ['Dorian', 'Niels'], sources: ['Cold Calling', 'LinkedIn'] },
  { text: 'Not now', count: 15, partners: ['Joaquin', 'Jonathan'], sources: ['HIP Spain', 'Colombia'] },
  { text: 'We already use another loyalty system', count: 11, partners: ['Giuseppe', 'Joaquin'], sources: ['Horecava', 'HIP Spain'] },
];

// Data source status
export type DataSourceStatus = 'live' | 'connected' | 'mock' | 'pending' | 'csv' | 'manual';
export const DATA_SOURCES = [
  { id: 'supabase', name: 'Supabase', status: 'connected' as DataSourceStatus, lastSync: '2025-12-01', records: 87, tables: ['customers', 'deals', 'partners', 'campaigns', 'cash_snapshots', 'product_metrics'], envVars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'] },
  { id: 'stripe', name: 'Stripe', status: 'pending' as DataSourceStatus, lastSync: null, records: 0, tables: ['customers', 'subscriptions'], envVars: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'] },
  { id: 'hubspot', name: 'HubSpot', status: 'pending' as DataSourceStatus, lastSync: null, records: 0, tables: ['deals', 'campaign_leads'], envVars: ['HUBSPOT_ACCESS_TOKEN'] },
  { id: 'instantly', name: 'Instantly AI', status: 'pending' as DataSourceStatus, lastSync: null, records: 0, tables: ['outbound_campaigns', 'campaign_leads'], envVars: ['INSTANTLY_API_KEY'] },
  { id: 'rabobank', name: 'Rabobank CSV', status: 'csv' as DataSourceStatus, lastSync: null, records: 0, tables: ['bank_transactions'], envVars: [] },
  { id: 'google-calendar', name: 'Google Calendar', status: 'pending' as DataSourceStatus, lastSync: null, records: 0, tables: ['meetings'], envVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] },
  { id: 'fathom', name: 'Fathom', status: 'pending' as DataSourceStatus, lastSync: null, records: 0, tables: ['meetings', 'call_insights'], envVars: ['FATHOM_API_KEY'] },
  { id: 'gmail', name: 'Gmail', status: 'pending' as DataSourceStatus, lastSync: null, records: 0, tables: ['meetings'], envVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] },
  { id: 'claude', name: 'Claude / Anthropic', status: 'pending' as DataSourceStatus, lastSync: null, records: 0, tables: ['call_insights'], envVars: ['ANTHROPIC_API_KEY'] },
];

// Weekly changes (mock delta logic)
export const WEEKLY_CHANGES = {
  mrrChange: +178,
  newCustomers: 2,
  lostCustomers: 0,
  pipelineChange: +3204,
  bestPartner: 'Giuseppe',
  bestGtmSource: 'Horecava',
  bestCampaign: 'NL Restaurant Owners Q4 2025',
};

// Founder action items (derived from data)
export const FOUNDER_ACTIONS = [
  { type: 'deal' as const, priority: 'high', text: 'Green Garden Den Haag — Negotiation for 14 days, follow up today', owner: 'Giuseppe' },
  { type: 'deal' as const, priority: 'high', text: 'Verde Gourmet Barcelona — Negotiation stalled, Joaquin to call', owner: 'Joaquin' },
  { type: 'campaign' as const, priority: 'medium', text: 'LinkedIn NL: 9.6% reply rate but only 6 meetings — booking process needs review', owner: 'Niels' },
  { type: 'partner' as const, priority: 'medium', text: 'Jonathan (Colombia): 3 deals in pipeline, 0 closed — support needed', owner: 'Jonathan' },
  { type: 'customer' as const, priority: 'high', text: 'Green Elephant — trial started Nov 1, no conversion yet (58 days)', owner: 'Niels' },
  { type: 'cash' as const, priority: 'low', text: '3 bank transactions uncategorized in December', owner: 'Giuseppe' },
  { type: 'data' as const, priority: 'medium', text: 'Stripe not connected — revenue data is mock', owner: 'Giuseppe' },
];
