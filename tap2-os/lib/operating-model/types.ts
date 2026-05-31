// Tap2 Operating Model — TypeScript types

export type DealStage =
  | 'New Lead'
  | 'Contacted'
  | 'Positive Reply'
  | 'Meeting Booked'
  | 'Discovery Completed'
  | 'Demo Completed'
  | 'Proposal Sent'
  | 'Trial / Pilot'
  | 'Negotiation'
  | 'Closed Won'
  | 'Closed Lost'
  | 'Nurture';

export type DealHealth =
  | 'Healthy'
  | 'High Intent'
  | 'Needs Follow-up'
  | 'Stale'
  | 'At Risk'
  | 'Low Quality';

export type DealQuality = 'A' | 'B' | 'C' | 'D' | 'Unscored';

export type PartnerGrade = 'A' | 'B' | 'C' | 'D' | 'Needs Review';

export type CampaignStatus = 'Active' | 'Paused' | 'Completed' | 'Draft';

export type DataStatus = 'live' | 'connected' | 'seed' | 'mock' | 'pending' | 'manual' | 'csv';

export type GTMRecommendation =
  | 'Double Down'
  | 'Test More'
  | 'Improve Follow-up'
  | 'Pause'
  | 'Needs Data';

// ─── Deal ───────────────────────────────────────────────────────────────────

export interface Deal {
  deal_id: string;
  deal_name: string;
  company_name: string;
  company_domain: string;
  country: string;
  city: string;
  industry: string;
  segment: string;
  use_case: string;
  deal_stage: DealStage;
  amount: number;             // lifetime value estimate (12 × mrr)
  expected_mrr: number;
  expected_arr: number;
  probability: number;        // 0-100
  weighted_mrr: number;       // expected_mrr × probability / 100
  weighted_arr: number;
  owner: string;
  partner_owner: string;
  source: string;
  source_detail: string;
  campaign_id: string | null;
  campaign_name: string | null;
  created_date: string;
  last_activity_date: string;
  close_date: string;
  expected_close_month: string;
  days_in_stage: number;
  sales_cycle_days: number;
  next_step: string;
  next_step_due_date: string;
  deal_health: DealHealth;
  deal_quality: DealQuality;
  quality_score: number;      // 0-100
  urgency: 'High' | 'Medium' | 'Low' | 'Unknown';
  lost_reason: string | null;
  competitor: string | null;
  objections: string[];
  notes: string;
}

// ─── Partner ─────────────────────────────────────────────────────────────────

export interface PartnerPerformance {
  name: string;
  leads_owned: number;
  qualified_leads: number;
  meetings_booked: number;
  meetings_completed: number;
  demos_completed: number;
  proposals_sent: number;
  trials_started: number;
  closed_won: number;
  closed_lost: number;
  closed_mrr: number;
  closed_arr: number;
  pipeline_generated: number;
  weighted_pipeline: number;
  avg_deal_quality_score: number;
  avg_deal_size: number;
  lead_to_meeting_rate: number;
  meeting_to_demo_rate: number;
  demo_to_close_rate: number;
  overall_close_rate: number;
  avg_sales_cycle_days: number;
  stale_deals: number;
  overdue_next_steps: number;
  best_source: string;
  best_market: string;
  best_use_case: string;
  activity_score: number;     // 0-100
  conversion_score: number;   // 0-100
  revenue_impact_score: number; // 0-100
  pipeline_quality_score: number; // 0-100
  grade: PartnerGrade;
  grade_rationale: string;
}

// ─── Campaign ─────────────────────────────────────────────────────────────────

export interface Campaign {
  campaign_id: string;
  campaign_name: string;
  market: string;
  segment: string;
  owner: string;
  status: CampaignStatus;
  start_date: string;
  emails_sent: number;
  delivered: number;
  bounced: number;
  bounce_rate: number;
  open_rate: number;
  reply_rate: number;
  positive_reply_rate: number;
  negative_reply_rate: number;
  unsubscribe_rate: number;
  meetings_booked: number;
  meetings_completed: number;
  demos_completed: number;
  deals_created: number;
  pipeline_generated: number;
  weighted_pipeline: number;
  closed_mrr: number;
  closed_arr: number;
  cost_estimate: number;
  cost_per_reply: number | null;
  cost_per_meeting: number | null;
  pipeline_per_1000: number;
  closed_mrr_per_1000: number;
  quality_score: number;
  insights: string[];
}

// ─── GTM Source ───────────────────────────────────────────────────────────────

export interface GTMSource {
  source: string;
  category: string;
  leads: number;
  qualified_leads: number;
  positive_replies: number;
  meetings: number;
  demos: number;
  proposals: number;
  trials: number;
  closed_won: number;
  closed_lost: number;
  closed_mrr: number;
  pipeline_generated: number;
  weighted_pipeline: number;
  lead_to_meeting_rate: number;
  meeting_to_demo_rate: number;
  demo_to_close_rate: number;
  overall_close_rate: number;
  avg_deal_quality: number;
  avg_sales_cycle_days: number;
  quality_score: number;
  recommendation: GTMRecommendation;
  recommendation_rationale: string;
}

// ─── Lifecycle Stage ──────────────────────────────────────────────────────────

export interface LifecycleStage {
  stage: string;
  count: number;
  avg_days_in_stage: number;
  conversion_to_next: number | null;
  dropoff_rate: number | null;
  absolute_dropped: number | null;
  revenue_at_risk: number;
}

// ─── Forecast Month ───────────────────────────────────────────────────────────

export interface ForecastMonth {
  month: string;
  starting_mrr: number;
  new_mrr: number;
  expansion_mrr: number;
  churned_mrr: number;
  net_new_mrr: number;
  ending_mrr: number;
  arr: number;
  customers: number;
  cash: number;
  burn: number;
  runway_months: number;
  closes_needed: number;
  pipeline_needed: number;
  meetings_needed: number;
  leads_needed: number;
}

export interface ForecastScenario {
  name: string;
  color: string;
  monthly_growth_rate: number;
  new_clients_per_month: number;
  arpa: number;
  churn_rate: number;
  months_to_100k_arr: number | null;
  months_to_1m_arr: number | null;
  months: ForecastMonth[];
}
