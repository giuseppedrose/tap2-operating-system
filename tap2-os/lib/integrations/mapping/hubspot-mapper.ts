import type { FieldMapping, FieldProfile, ObjectProfile } from './types';

// Known HubSpot standard fields and their Tap2 mappings
export const HUBSPOT_DEAL_MAPPINGS: FieldMapping[] = [
  { source: 'hubspot', object_type: 'deals', source_field: 'dealname',           source_label: 'Deal Name',              tap2_field: 'deal_name',             tap2_table: 'deals',   confidence: 'exact',    action: 'use_as_is' },
  { source: 'hubspot', object_type: 'deals', source_field: 'dealstage',           source_label: 'Deal Stage',             tap2_field: 'deal_stage',            tap2_table: 'deals',   confidence: 'exact',    action: 'transform',  notes: 'Map stage IDs to Tap2 stage labels' },
  { source: 'hubspot', object_type: 'deals', source_field: 'amount',              source_label: 'Amount',                 tap2_field: 'pipeline_value',        tap2_table: 'deals',   confidence: 'exact',    action: 'use_as_is' },
  { source: 'hubspot', object_type: 'deals', source_field: 'hubspot_owner_id',    source_label: 'Deal Owner',             tap2_field: 'owner',                 tap2_table: 'deals',   confidence: 'exact',    action: 'transform',  notes: 'Resolve owner ID → name via owners endpoint' },
  { source: 'hubspot', object_type: 'deals', source_field: 'closedate',           source_label: 'Close Date',             tap2_field: 'close_date',            tap2_table: 'deals',   confidence: 'exact',    action: 'use_as_is' },
  { source: 'hubspot', object_type: 'deals', source_field: 'createdate',          source_label: 'Create Date',            tap2_field: 'created_date',          tap2_table: 'deals',   confidence: 'exact',    action: 'use_as_is' },
  { source: 'hubspot', object_type: 'deals', source_field: 'hs_lastmodifieddate', source_label: 'Last Modified',          tap2_field: 'last_activity_date',    tap2_table: 'deals',   confidence: 'likely',   action: 'use_as_is' },
  { source: 'hubspot', object_type: 'deals', source_field: 'pipeline',            source_label: 'Pipeline',               tap2_field: 'pipeline_id',           tap2_table: 'deals',   confidence: 'exact',    action: 'use_as_is' },
  { source: 'hubspot', object_type: 'deals', source_field: 'hs_probability',      source_label: 'Win Probability',        tap2_field: 'probability',           tap2_table: 'deals',   confidence: 'exact',    action: 'use_as_is' },
  { source: 'hubspot', object_type: 'deals', source_field: 'hs_deal_stage_probability', source_label: 'Stage Probability', tap2_field: 'probability',          tap2_table: 'deals',   confidence: 'exact',    action: 'use_as_is' },
  // Custom Tap2 properties (to be created in HubSpot)
  { source: 'hubspot', object_type: 'deals', source_field: 'tap2_expected_mrr',   source_label: 'Expected MRR (Custom)', tap2_field: 'expected_mrr',          tap2_table: 'deals',   confidence: 'missing',  action: 'create_in_source', notes: 'Create custom property in HubSpot' },
  { source: 'hubspot', object_type: 'deals', source_field: 'tap2_partner_owner',  source_label: 'Partner Owner (Custom)', tap2_field: 'partner_owner',        tap2_table: 'deals',   confidence: 'missing',  action: 'create_in_source', notes: 'Create custom property in HubSpot' },
  { source: 'hubspot', object_type: 'deals', source_field: 'tap2_use_case',       source_label: 'Use Case (Custom)',      tap2_field: 'use_case',              tap2_table: 'deals',   confidence: 'missing',  action: 'create_in_source' },
  { source: 'hubspot', object_type: 'deals', source_field: 'tap2_market',         source_label: 'Market (Custom)',        tap2_field: 'market',                tap2_table: 'deals',   confidence: 'missing',  action: 'create_in_source' },
  { source: 'hubspot', object_type: 'deals', source_field: 'tap2_campaign_id',    source_label: 'Campaign ID (Custom)',   tap2_field: 'campaign_id',           tap2_table: 'deals',   confidence: 'missing',  action: 'create_in_source' },
  { source: 'hubspot', object_type: 'deals', source_field: 'tap2_next_step',      source_label: 'Next Step (Custom)',     tap2_field: 'next_step',             tap2_table: 'deals',   confidence: 'missing',  action: 'create_in_source' },
  { source: 'hubspot', object_type: 'deals', source_field: 'tap2_lost_reason',    source_label: 'Lost Reason (Custom)',   tap2_field: 'lost_reason',           tap2_table: 'deals',   confidence: 'missing',  action: 'create_in_source' },
  { source: 'hubspot', object_type: 'deals', source_field: 'tap2_competitor',     source_label: 'Competitor (Custom)',    tap2_field: 'competitor',            tap2_table: 'deals',   confidence: 'missing',  action: 'create_in_source' },
  { source: 'hubspot', object_type: 'deals', source_field: 'tap2_icp_fit',        source_label: 'ICP Fit (Custom)',       tap2_field: 'icp_fit',               tap2_table: 'deals',   confidence: 'missing',  action: 'create_in_source' },
  // Standard fields that approximate some Tap2 fields
  { source: 'hubspot', object_type: 'deals', source_field: 'hs_analytics_source', source_label: 'Analytics Source',      tap2_field: 'source',                tap2_table: 'deals',   confidence: 'likely',   notes: 'HubSpot auto-tracks UTM source — may need enrichment' },
  { source: 'hubspot', object_type: 'deals', source_field: 'deal_currency_code',  source_label: 'Currency',               tap2_field: 'currency',              tap2_table: 'deals',   confidence: 'exact',    action: 'use_as_is' },
];

export const HUBSPOT_COMPANY_MAPPINGS: FieldMapping[] = [
  { source: 'hubspot', object_type: 'companies', source_field: 'name',            tap2_field: 'company_name',    tap2_table: 'customers', confidence: 'exact' },
  { source: 'hubspot', object_type: 'companies', source_field: 'domain',          tap2_field: 'company_domain',  tap2_table: 'customers', confidence: 'exact' },
  { source: 'hubspot', object_type: 'companies', source_field: 'country',         tap2_field: 'country',         tap2_table: 'customers', confidence: 'exact' },
  { source: 'hubspot', object_type: 'companies', source_field: 'city',            tap2_field: 'city',            tap2_table: 'customers', confidence: 'exact' },
  { source: 'hubspot', object_type: 'companies', source_field: 'industry',        tap2_field: 'industry',        tap2_table: 'customers', confidence: 'likely',   notes: 'HubSpot industry values may differ from Tap2 segments' },
  { source: 'hubspot', object_type: 'companies', source_field: 'hs_lead_status',  tap2_field: 'status',          tap2_table: 'customers', confidence: 'likely' },
  { source: 'hubspot', object_type: 'companies', source_field: 'hubspot_owner_id', tap2_field: 'partner_owner',  tap2_table: 'customers', confidence: 'likely',   notes: 'Use as partner_owner if no custom field exists' },
  { source: 'hubspot', object_type: 'companies', source_field: 'tap2_segment',    tap2_field: 'segment',         tap2_table: 'customers', confidence: 'missing',  action: 'create_in_source' },
];

export const HUBSPOT_CONTACT_MAPPINGS: FieldMapping[] = [
  { source: 'hubspot', object_type: 'contacts', source_field: 'email',            tap2_field: 'email',           tap2_table: 'contacts',  confidence: 'exact' },
  { source: 'hubspot', object_type: 'contacts', source_field: 'firstname',        tap2_field: 'first_name',      tap2_table: 'contacts',  confidence: 'exact' },
  { source: 'hubspot', object_type: 'contacts', source_field: 'lastname',         tap2_field: 'last_name',       tap2_table: 'contacts',  confidence: 'exact' },
  { source: 'hubspot', object_type: 'contacts', source_field: 'hs_lead_status',   tap2_field: 'lead_status',     tap2_table: 'contacts',  confidence: 'likely' },
  { source: 'hubspot', object_type: 'contacts', source_field: 'hubspot_owner_id', tap2_field: 'owner',           tap2_table: 'contacts',  confidence: 'exact' },
  { source: 'hubspot', object_type: 'contacts', source_field: 'associatedcompanyid', tap2_field: 'company_id',   tap2_table: 'contacts',  confidence: 'exact' },
];

// Custom properties that MUST be created in HubSpot for full Tap2 OS integration
export const HUBSPOT_REQUIRED_CUSTOM_PROPERTIES = [
  { name: 'tap2_expected_mrr',       label: 'Expected MRR',       type: 'number',      object: 'deals',     priority: 'critical' },
  { name: 'tap2_partner_owner',      label: 'Partner Owner',      type: 'enumeration', object: 'deals',     priority: 'critical', note: 'Options: Giuseppe, Dorian, Joaquin, Jonathan, Carlo, Niels, Qubico Studio' },
  { name: 'tap2_use_case',           label: 'Use Case',           type: 'enumeration', object: 'deals',     priority: 'critical', note: 'Options: Loyalty stamp card, Membership card, Tenant card, etc.' },
  { name: 'tap2_market',             label: 'Market / Country',   type: 'enumeration', object: 'deals',     priority: 'high',     note: 'Options: NL, ES, IT, CO, BE, Other' },
  { name: 'tap2_campaign_id',        label: 'Campaign ID',        type: 'single_line_text', object: 'deals', priority: 'high',    note: 'Link to Instantly campaign ID' },
  { name: 'tap2_next_step',          label: 'Next Step',          type: 'single_line_text', object: 'deals', priority: 'high' },
  { name: 'tap2_next_step_due_date', label: 'Next Step Due Date', type: 'date',        object: 'deals',     priority: 'high' },
  { name: 'tap2_lost_reason',        label: 'Lost Reason',        type: 'enumeration', object: 'deals',     priority: 'medium',   note: 'Options: Chose competitor, No budget, Wrong timing, etc.' },
  { name: 'tap2_competitor',         label: 'Competitor Mentioned', type: 'single_line_text', object: 'deals', priority: 'medium' },
  { name: 'tap2_icp_fit',            label: 'ICP Fit Score',      type: 'enumeration', object: 'deals',     priority: 'medium',   note: 'Options: A, B, C, D' },
  { name: 'tap2_segment',            label: 'Client Segment',     type: 'enumeration', object: 'companies', priority: 'high',     note: 'Options: Independent Restaurant, Café/Bar, Gym, Retail, etc.' },
];
