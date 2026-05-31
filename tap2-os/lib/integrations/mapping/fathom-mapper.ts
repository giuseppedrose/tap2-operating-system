import type { FieldMapping } from './types';

export const FATHOM_MEETING_MAPPINGS: FieldMapping[] = [
  { source: 'fathom', object_type: 'meeting', source_field: 'id',              tap2_field: 'external_id',      tap2_table: 'meetings', confidence: 'exact' },
  { source: 'fathom', object_type: 'meeting', source_field: 'title',           tap2_field: 'title',            tap2_table: 'meetings', confidence: 'exact' },
  { source: 'fathom', object_type: 'meeting', source_field: 'started_at',      tap2_field: 'meeting_date',     tap2_table: 'meetings', confidence: 'exact' },
  { source: 'fathom', object_type: 'meeting', source_field: 'duration',        tap2_field: 'duration_seconds', tap2_table: 'meetings', confidence: 'exact' },
  { source: 'fathom', object_type: 'meeting', source_field: 'attendees',       tap2_field: 'participants',     tap2_table: 'meetings', confidence: 'likely', notes: 'Array of attendee emails — match to HubSpot contacts' },
  { source: 'fathom', object_type: 'meeting', source_field: 'summary.text',    tap2_field: 'summary',          tap2_table: 'meetings', confidence: 'likely' },
  { source: 'fathom', object_type: 'meeting', source_field: 'action_items',    tap2_field: 'action_items',     tap2_table: 'meetings', confidence: 'likely' },
  { source: 'fathom', object_type: 'meeting', source_field: 'recording_url',   tap2_field: 'recording_url',    tap2_table: 'meetings', confidence: 'exact' },
];

// How to map Fathom meetings to HubSpot deals/companies
export const FATHOM_HUBSPOT_MATCHING_STRATEGY = [
  { method: 'email_match',   description: 'Match attendee emails to HubSpot contacts → company → deal', reliability: 'high' },
  { method: 'domain_match',  description: 'Extract domain from attendee email → match HubSpot company domain', reliability: 'high' },
  { method: 'title_match',   description: 'Extract company name from meeting title → fuzzy match HubSpot company name', reliability: 'medium' },
  { method: 'calendar_link', description: 'If Google Calendar event linked to HubSpot deal via calendar integration', reliability: 'high' },
];
