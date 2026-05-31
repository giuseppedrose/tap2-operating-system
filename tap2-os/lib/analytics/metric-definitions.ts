/**
 * Tap2 OS — Institutional Metric Definitions
 * Every metric has a precise formula, source of truth, and business interpretation.
 * Eliminates ambiguity in board and investor conversations.
 */

export type DataStatus = 'live' | 'seed' | 'manual' | 'derived' | 'pending';
export type Confidence = 'high' | 'medium' | 'low' | 'unverified';

export interface MetricDefinition {
  name: string;
  abbreviation: string;
  category: string;
  formula: string;
  sourceOfTruth: string;
  dataStatus: DataStatus;
  confidence: Confidence;
  displayedOn: string[];
  interpretation: string;
  warning?: string;
}

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {

  MRR: {
    name: 'Monthly Recurring Revenue',
    abbreviation: 'MRR',
    category: 'Revenue',
    formula: 'Sum of all active subscription MRR at end of period',
    sourceOfTruth: 'Stripe — subscriptions[].items[0].price.unit_amount / 100',
    dataStatus: 'seed',
    confidence: 'unverified',
    displayedOn: ['/', '/revenue', '/forecast', '/investor'],
    interpretation: 'The primary revenue metric. Represents predictable monthly contracted revenue. Use ARR (MRR × 12) for annualised comparisons.',
    warning: 'Seed data until Stripe is connected. Stripe subscription sync will replace this.',
  },

  ARR: {
    name: 'Annual Recurring Revenue',
    abbreviation: 'ARR',
    category: 'Revenue',
    formula: 'MRR × 12',
    sourceOfTruth: 'Derived from Stripe MRR',
    dataStatus: 'derived',
    confidence: 'unverified',
    displayedOn: ['/', '/revenue', '/forecast', '/investor'],
    interpretation: 'Annualised view of contracted revenue. Used for investor comparisons and milestone tracking. Not realised cash — represents run-rate.',
  },

  NEW_MRR: {
    name: 'New MRR',
    abbreviation: 'New MRR',
    category: 'Revenue',
    formula: 'Sum of MRR from customers who subscribed this period for the first time',
    sourceOfTruth: 'Stripe — subscription.created events in period',
    dataStatus: 'seed',
    confidence: 'low',
    displayedOn: ['/revenue'],
    interpretation: 'Gross demand signal. High new MRR with low expansion = healthy acquisition but no upsell. Compare against closed pipeline to validate conversion.',
  },

  EXPANSION_MRR: {
    name: 'Expansion MRR',
    abbreviation: 'Expansion MRR',
    category: 'Revenue',
    formula: 'Sum of MRR increases from existing customers this period (upgrades, seat additions)',
    sourceOfTruth: 'Stripe — subscription.updated events where new_amount > old_amount',
    dataStatus: 'seed',
    confidence: 'low',
    displayedOn: ['/revenue'],
    interpretation: 'Product-market fit signal and upsell health. Currently near zero — indicates pricing tiers or usage-based expansion are not yet activated.',
  },

  CHURNED_MRR: {
    name: 'Churned MRR',
    abbreviation: 'Churned MRR',
    category: 'Revenue',
    formula: 'Sum of MRR lost from cancellations and downgrades this period',
    sourceOfTruth: 'Stripe — subscription.deleted + subscription.updated where new_amount < old_amount',
    dataStatus: 'seed',
    confidence: 'low',
    displayedOn: ['/revenue'],
    interpretation: 'At €80/mo current (seed), churn rate is 2.1%. Every €89 customer that churns requires a new acquisition to stay flat. Below €50 churned/mo is healthy at current scale.',
  },

  NET_NEW_MRR: {
    name: 'Net New MRR',
    abbreviation: 'Net New MRR',
    category: 'Revenue',
    formula: 'New MRR + Expansion MRR − Churned MRR',
    sourceOfTruth: 'Derived from Stripe events',
    dataStatus: 'derived',
    confidence: 'low',
    displayedOn: ['/revenue'],
    interpretation: 'The single most important growth metric. Positive net new MRR means the business is growing. The required net new MRR to hit €100k ARR in 12 months is ~€580/mo — current pace is ~€250/mo.',
  },

  GRR: {
    name: 'Gross Revenue Retention',
    abbreviation: 'GRR',
    category: 'Revenue Quality',
    formula: '(Prior Period MRR − Churned MRR − Contraction MRR) / Prior Period MRR × 100',
    sourceOfTruth: 'Derived from Stripe',
    dataStatus: 'derived',
    confidence: 'low',
    displayedOn: ['/revenue'],
    interpretation: 'Maximum value is 100%. Measures revenue retained before expansion. Below 85% indicates product/fit issues. Current seed estimate: ~97.9% (2.1% monthly churn).',
    warning: 'Seed estimate. Stripe required for accurate GRR.',
  },

  NRR: {
    name: 'Net Revenue Retention',
    abbreviation: 'NRR',
    category: 'Revenue Quality',
    formula: '(Prior Period MRR − Churned MRR + Expansion MRR) / Prior Period MRR × 100',
    sourceOfTruth: 'Derived from Stripe',
    dataStatus: 'derived',
    confidence: 'low',
    displayedOn: ['/revenue'],
    interpretation: 'Values above 100% mean existing customers grow faster than they churn. SaaS benchmark: >110% is excellent, >120% is world-class. Current seed estimate ~100.5% — expansion barely covers churn.',
  },

  ARPA: {
    name: 'Average Revenue Per Account',
    abbreviation: 'ARPA',
    category: 'Revenue',
    formula: 'Total MRR / Active Customer Count',
    sourceOfTruth: 'Derived from Stripe MRR and customer count',
    dataStatus: 'derived',
    confidence: 'medium',
    displayedOn: ['/', '/revenue', '/forecast', '/investor'],
    interpretation: 'Current seed ARPA is €44/mo. Mix of €29 (CO starter), €49 (basic), €89 (growth). As mix shifts toward NL HoReCa and gym/membership, ARPA should rise toward €60+.',
  },

  PIPELINE_GROSS: {
    name: 'Gross Pipeline Value',
    abbreviation: 'Pipeline (Gross)',
    category: 'Pipeline',
    formula: 'Sum of expected_arr on all open deals (non-closed)',
    sourceOfTruth: 'HubSpot — open deals with amount or expected_mrr × 12',
    dataStatus: 'seed',
    confidence: 'low',
    displayedOn: ['/', '/pipeline', '/investor'],
    interpretation: 'Vanity metric on its own. Use weighted pipeline for forward-looking analysis. Gross pipeline includes low-probability and stale deals.',
    warning: 'Seed data. HubSpot required for accurate deal tracking.',
  },

  PIPELINE_WEIGHTED: {
    name: 'Weighted Pipeline',
    abbreviation: 'W. Pipeline',
    category: 'Pipeline',
    formula: 'Sum of (expected_arr × probability/100) per open deal',
    sourceOfTruth: 'Derived from HubSpot deal probability by stage',
    dataStatus: 'derived',
    confidence: 'low',
    displayedOn: ['/', '/pipeline', '/forecast', '/investor'],
    interpretation: 'Risk-adjusted pipeline. More useful than gross. At current €655 weighted MRR, significant additional pipeline is needed to hit €100k ARR on expected timeline.',
  },

  PIPELINE_COVERAGE: {
    name: 'Pipeline Coverage Ratio',
    abbreviation: 'Pipeline Coverage',
    category: 'Pipeline',
    formula: 'Weighted Pipeline MRR / Required MRR to hit next milestone',
    sourceOfTruth: 'Derived from HubSpot pipeline and milestone model',
    dataStatus: 'derived',
    confidence: 'low',
    displayedOn: ['/pipeline', '/forecast'],
    interpretation: 'The ratio of current weighted pipeline to what is needed to hit €100k ARR. Below 1.0× means pipeline is insufficient. Target: 3× minimum coverage at top of funnel.',
  },

  WIN_RATE: {
    name: 'Win Rate',
    abbreviation: 'Win Rate',
    category: 'Pipeline',
    formula: 'Closed Won deals / (Closed Won + Closed Lost deals) × 100',
    sourceOfTruth: 'HubSpot — deal stage closed_won vs closed_lost',
    dataStatus: 'seed',
    confidence: 'medium',
    displayedOn: ['/pipeline'],
    interpretation: 'Current seed win rate: 29 won / (29 won + 5 lost) = 85%. This is high and likely inflated due to early-stage self-selection bias. Expect this to drop toward 20-35% at scale.',
  },

  MEETING_CONVERSION: {
    name: 'Lead-to-Meeting Conversion Rate',
    abbreviation: 'L→M Rate',
    category: 'GTM',
    formula: 'Deals reaching Meeting Booked stage / Total leads entered × 100',
    sourceOfTruth: 'HubSpot deal stages + Instantly reply attribution',
    dataStatus: 'seed',
    confidence: 'low',
    displayedOn: ['/gtm', '/lifecycle'],
    interpretation: 'Seed estimate ~40-50% from positive reply to meeting. True lead-to-meeting (from first contact) is much lower, likely 5-15%. Critical outbound efficiency metric.',
  },

  DEMO_CONVERSION: {
    name: 'Meeting-to-Demo Conversion Rate',
    abbreviation: 'M→D Rate',
    category: 'GTM',
    formula: 'Deals reaching Demo Completed stage / Deals that booked a meeting × 100',
    sourceOfTruth: 'HubSpot',
    dataStatus: 'seed',
    confidence: 'low',
    displayedOn: ['/gtm', '/lifecycle'],
    interpretation: 'Show rate × quality filter. High show rate (>80%) with low demo conversion suggests wrong ICP. Low show rate (<70%) suggests qualification problem.',
  },

  CLOSE_RATE: {
    name: 'Demo-to-Close Rate',
    abbreviation: 'D→Close',
    category: 'GTM',
    formula: 'Closed Won deals / Deals that completed demo × 100',
    sourceOfTruth: 'HubSpot',
    dataStatus: 'seed',
    confidence: 'low',
    displayedOn: ['/gtm', '/pipeline'],
    interpretation: 'The most critical conversion metric. Seed estimate: ~45%. World-class SaaS close rates post-demo are 20-40%. Above 40% suggests self-selection or small sample.',
  },

  SALES_CYCLE: {
    name: 'Average Sales Cycle (Days)',
    abbreviation: 'Avg Cycle',
    category: 'Pipeline',
    formula: 'Average (close_date − created_date) for Closed Won deals',
    sourceOfTruth: 'HubSpot',
    dataStatus: 'seed',
    confidence: 'medium',
    displayedOn: ['/pipeline'],
    interpretation: 'Current seed average: ~18 days. Very fast for SaaS, consistent with direct founder-led sales to small business owners. Expect to lengthen as deal size grows.',
  },

  DAYS_IN_STAGE: {
    name: 'Average Days in Stage',
    abbreviation: 'Days in Stage',
    category: 'Pipeline',
    formula: 'Average days a deal has been in current stage (as of today)',
    sourceOfTruth: 'HubSpot — stage_entered_date per deal',
    dataStatus: 'seed',
    confidence: 'low',
    displayedOn: ['/pipeline'],
    interpretation: 'Stale stage indicator. Deals exceeding threshold: Contacted >7d, Proposal >10d, Trial >14d, Negotiation >7d. Current stale count: flagged in pipeline cockpit.',
  },

  STALE_PIPELINE: {
    name: 'Stale Pipeline',
    abbreviation: 'Stale Pipeline',
    category: 'Pipeline',
    formula: 'Sum of gross pipeline value on deals exceeding days-in-stage threshold',
    sourceOfTruth: 'Derived from HubSpot deal activity dates',
    dataStatus: 'derived',
    confidence: 'low',
    displayedOn: ['/pipeline'],
    interpretation: 'Fake pipeline detection. Stale deals inflate gross pipeline without real close probability. Should be marked lost or moved to nurture if not actioned.',
  },

  DEAL_QUALITY_SCORE: {
    name: 'Deal Quality Score',
    abbreviation: 'Quality',
    category: 'Pipeline',
    formula: 'Composite 0-100: ICP fit (20) + source quality (15) + positive reply (10) + meeting completed (15) + decision maker identified (10) + budget fit (10) + clear next step (10) + close date set (5) + use case fit (5)',
    sourceOfTruth: 'Derived from HubSpot deal properties and Tap2 custom fields',
    dataStatus: 'seed',
    confidence: 'low',
    displayedOn: ['/pipeline'],
    interpretation: 'Score ≥80 = A quality (high conviction). 60-79 = B (qualified, needs nurture). 40-59 = C (weak signal). <40 = D (low quality, review for purge).',
  },

  CAC: {
    name: 'Customer Acquisition Cost',
    abbreviation: 'CAC',
    category: 'Unit Economics',
    formula: 'Total Sales & Marketing spend / New customers acquired in period',
    sourceOfTruth: 'Rabobank CSV (spend) + Stripe/HubSpot (customers)',
    dataStatus: 'pending',
    confidence: 'unverified',
    displayedOn: ['/gtm'],
    interpretation: 'Cannot be calculated until Rabobank CSV is uploaded (spend data) and Stripe is connected (new customer counts). Target: CAC < 3× ARPA for payback within 3 months.',
    warning: 'Requires Rabobank CSV + Stripe. Shown as — until both are connected.',
  },

  CAMPAIGN_EFFICIENCY: {
    name: 'Campaign Efficiency Score',
    abbreviation: 'Eff. Score',
    category: 'Campaigns',
    formula: 'Composite: (positive_reply_rate × 25) + (meeting_to_close_rate × 35) + (mrr_per_1000_emails × 0.2) + (quality_score × 20)',
    sourceOfTruth: 'Instantly campaign analytics + HubSpot attribution',
    dataStatus: 'seed',
    confidence: 'low',
    displayedOn: ['/campaigns'],
    interpretation: 'Normalised score 0-100 comparing outbound campaigns on quality and revenue efficiency, not just volume.',
  },

  CASH_BURN: {
    name: 'Gross Burn Rate',
    abbreviation: 'Gross Burn',
    category: 'Cash',
    formula: 'Sum of all cash outflows in period (payroll + contractors + SaaS + all expenses)',
    sourceOfTruth: 'Rabobank CSV — debit transactions',
    dataStatus: 'manual',
    confidence: 'unverified',
    displayedOn: ['/cash'],
    interpretation: 'Seed estimate: €8,200/mo. Actual figure requires Rabobank CSV upload. Gross burn includes all outflows — use net burn for runway calculation.',
    warning: 'Seed estimate only. Upload Rabobank CSV to replace.',
  },

  NET_BURN: {
    name: 'Net Burn Rate',
    abbreviation: 'Net Burn',
    category: 'Cash',
    formula: 'Gross Burn − MRR collected',
    sourceOfTruth: 'Derived from Rabobank CSV + Stripe',
    dataStatus: 'derived',
    confidence: 'unverified',
    displayedOn: ['/', '/cash'],
    interpretation: 'The actual cash depletion rate per month. At €8,200 burn and €1,400 MRR, net burn is ~€6,800/mo. Every €1k MRR growth reduces net burn by €1k.',
  },

  RUNWAY: {
    name: 'Runway',
    abbreviation: 'Runway',
    category: 'Cash',
    formula: 'Cash balance / Net burn rate',
    sourceOfTruth: 'Derived from Rabobank cash balance + net burn',
    dataStatus: 'manual',
    confidence: 'unverified',
    displayedOn: ['/', '/cash', '/investor'],
    interpretation: 'Seed estimate: 4.7 months. CRITICAL THRESHOLD: below 6 months triggers urgent action. At current pace, MRR growth reduces net burn — every new €267 deal = 1 additional month of runway.',
    warning: 'Seed estimate. Requires Rabobank CSV for actual cash balance.',
  },

  FORECAST_ATTAINMENT: {
    name: 'Forecast Attainment',
    abbreviation: 'Attainment',
    category: 'Forecast',
    formula: 'Actual MRR / Expected scenario MRR at same point in time × 100',
    sourceOfTruth: 'Derived from Stripe MRR + forecast model',
    dataStatus: 'pending',
    confidence: 'unverified',
    displayedOn: ['/forecast'],
    interpretation: 'Compares actual performance to committed forecast. Below 80% triggers scenario revision. Above 100% triggers upside scenario review.',
    warning: 'Not calculable until Stripe is connected and forecast baseline is set.',
  },
};

// Helper to get definition
export function getMetric(key: string): MetricDefinition | undefined {
  return METRIC_DEFINITIONS[key];
}

// Status display helpers
export const DATA_STATUS_LABELS: Record<DataStatus, { label: string; color: string }> = {
  live:       { label: 'Live',        color: 'text-emerald-700' },
  seed:       { label: 'Seed',        color: 'text-amber-600' },
  manual:     { label: 'Manual',      color: 'text-purple-600' },
  derived:    { label: 'Derived',     color: 'text-blue-600' },
  pending:    { label: 'Pending',     color: 'text-gray-400' },
};

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  high:        'High confidence',
  medium:      'Medium confidence',
  low:         'Low confidence — seed data',
  unverified:  'Unverified',
};
