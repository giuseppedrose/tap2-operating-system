import type { FieldMapping } from './types';

export const INSTANTLY_CAMPAIGN_MAPPINGS: FieldMapping[] = [
  { source: 'instantly', object_type: 'campaign', source_field: 'id',          tap2_field: 'campaign_id',       tap2_table: 'outbound_campaigns', confidence: 'exact' },
  { source: 'instantly', object_type: 'campaign', source_field: 'name',        tap2_field: 'campaign_name',     tap2_table: 'outbound_campaigns', confidence: 'exact', notes: 'Campaign name should follow convention: Market-Segment-Period (e.g. NL-HoReCa-Q4-2025)' },
  { source: 'instantly', object_type: 'campaign', source_field: 'status',      tap2_field: 'status',            tap2_table: 'outbound_campaigns', confidence: 'exact' },
  { source: 'instantly', object_type: 'campaign', source_field: 'created_at',  tap2_field: 'start_date',        tap2_table: 'outbound_campaigns', confidence: 'likely' },
];

export const INSTANTLY_ANALYTICS_MAPPINGS: FieldMapping[] = [
  { source: 'instantly', object_type: 'analytics', source_field: 'total_leads',      tap2_field: 'emails_sent',           tap2_table: 'outbound_campaigns', confidence: 'likely' },
  { source: 'instantly', object_type: 'analytics', source_field: 'contacted_count',  tap2_field: 'delivered',             tap2_table: 'outbound_campaigns', confidence: 'likely' },
  { source: 'instantly', object_type: 'analytics', source_field: 'open_count',        tap2_field: 'opened',               tap2_table: 'outbound_campaigns', confidence: 'exact' },
  { source: 'instantly', object_type: 'analytics', source_field: 'reply_count',       tap2_field: 'replied',              tap2_table: 'outbound_campaigns', confidence: 'exact' },
  { source: 'instantly', object_type: 'analytics', source_field: 'bounce_count',      tap2_field: 'bounced',              tap2_table: 'outbound_campaigns', confidence: 'exact' },
  { source: 'instantly', object_type: 'analytics', source_field: 'unsubscribe_count', tap2_field: 'unsubscribed',         tap2_table: 'outbound_campaigns', confidence: 'exact' },
  { source: 'instantly', object_type: 'analytics', source_field: 'interested_count',  tap2_field: 'positive_replies',     tap2_table: 'outbound_campaigns', confidence: 'likely', notes: '"Interested" in Instantly ≈ positive reply in Tap2' },
  { source: 'instantly', object_type: 'lead',      source_field: 'email',             tap2_field: 'email',                tap2_table: 'campaign_leads',     confidence: 'exact' },
  { source: 'instantly', object_type: 'lead',      source_field: 'company_name',      tap2_field: 'company_name',         tap2_table: 'campaign_leads',     confidence: 'exact' },
  { source: 'instantly', object_type: 'lead',      source_field: 'status',            tap2_field: 'lead_status',          tap2_table: 'campaign_leads',     confidence: 'exact' },
];

// Naming convention recommendation for Instantly campaigns
export const INSTANTLY_NAMING_CONVENTION = {
  format: '[MARKET]-[SEGMENT]-[PERIOD]',
  examples: ['NL-HoReCa-Q4-2025', 'ES-HoReCa-Q1-2026', 'NL-Gym-Q1-2026'],
  why: 'Enables automatic market/segment extraction from campaign name for attribution',
};
