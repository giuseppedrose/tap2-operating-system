-- Phase 9: Raw Source Ingestion Tables
-- Purpose: Store raw API responses before normalization.
-- Do not normalize early. Preserve full payloads for profiling.
-- Never store API keys or secrets in these tables.

-- ─── Sync run tracking ──────────────────────────────────────────────────────

create table if not exists source_sync_runs (
  id            uuid primary key default gen_random_uuid(),
  source        text not null,                    -- 'stripe' | 'hubspot' | 'instantly' | 'fathom' | 'google_calendar'
  run_type      text not null default 'discovery', -- 'discovery' | 'incremental' | 'full'
  status        text not null default 'running',  -- 'running' | 'completed' | 'error' | 'partial'
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  records_fetched  integer default 0,
  records_written  integer default 0,
  records_failed   integer default 0,
  error_message    text,
  meta          jsonb default '{}'::jsonb,        -- sample counts, field list, etc.
  created_at    timestamptz not null default now()
);

-- ─── Source data profiles ───────────────────────────────────────────────────

create table if not exists source_data_profiles (
  id            uuid primary key default gen_random_uuid(),
  source        text not null,
  object_type   text not null,                    -- 'customer', 'deal', 'campaign', etc.
  sync_run_id   uuid references source_sync_runs(id),
  record_count  integer default 0,
  field_count   integer default 0,
  fields        jsonb default '[]'::jsonb,        -- [{name, type, population_rate, sample_values}]
  quality_score integer default 0,               -- 0-100
  mapping_recommendations jsonb default '[]'::jsonb,
  profiled_at   timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  unique(source, object_type)
);

-- ─── Source field mappings ───────────────────────────────────────────────────

create table if not exists source_field_mappings (
  id            uuid primary key default gen_random_uuid(),
  source        text not null,
  object_type   text not null,
  source_field  text not null,
  tap2_field    text not null,
  tap2_table    text,
  confidence    text not null default 'possible', -- 'exact' | 'likely' | 'possible' | 'missing' | 'not_applicable'
  notes         text,
  confirmed     boolean default false,
  created_at    timestamptz not null default now(),
  unique(source, object_type, source_field)
);

-- ─── Raw Stripe tables ──────────────────────────────────────────────────────

create table if not exists raw_stripe_customers (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,             -- Stripe customer id
  raw_payload   jsonb not null,
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now()
);

create table if not exists raw_stripe_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  customer_id   text,
  raw_payload   jsonb not null,
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now()
);

create table if not exists raw_stripe_invoices (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  customer_id   text,
  raw_payload   jsonb not null,
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now()
);

create table if not exists raw_stripe_balance_transactions (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  raw_payload   jsonb not null,
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now()
);

-- ─── Raw HubSpot tables ─────────────────────────────────────────────────────

create table if not exists raw_hubspot_companies (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  raw_payload   jsonb not null,
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now()
);

create table if not exists raw_hubspot_contacts (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  raw_payload   jsonb not null,
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now()
);

create table if not exists raw_hubspot_deals (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  raw_payload   jsonb not null,
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now()
);

create table if not exists raw_hubspot_owners (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  raw_payload   jsonb not null,
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now()
);

create table if not exists raw_hubspot_activities (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  activity_type text,
  raw_payload   jsonb not null,
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now()
);

create table if not exists raw_hubspot_associations (
  id            uuid primary key default gen_random_uuid(),
  from_object   text,
  from_id       text,
  to_object     text,
  to_id         text,
  association_type text,
  raw_payload   jsonb not null default '{}'::jsonb,
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now()
);

create table if not exists raw_hubspot_properties (
  id            uuid primary key default gen_random_uuid(),
  object_type   text not null,                   -- 'contacts' | 'companies' | 'deals'
  property_name text not null,
  raw_payload   jsonb not null,
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now(),
  unique(object_type, property_name)
);

-- ─── Raw Instantly tables ───────────────────────────────────────────────────

create table if not exists raw_instantly_campaigns (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  raw_payload   jsonb not null,
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now()
);

create table if not exists raw_instantly_leads (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  campaign_id   text,
  raw_payload   jsonb not null,
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now()
);

create table if not exists raw_instantly_campaign_analytics (
  id            uuid primary key default gen_random_uuid(),
  campaign_id   text not null,
  date_range    text,
  raw_payload   jsonb not null,
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now()
);

-- ─── Raw Fathom tables ──────────────────────────────────────────────────────

create table if not exists raw_fathom_meetings (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  raw_payload   jsonb not null,
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now()
);

create table if not exists raw_fathom_summaries (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  meeting_id    text,
  raw_payload   jsonb not null,
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now()
);

create table if not exists raw_fathom_transcripts_metadata (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  meeting_id    text,
  raw_payload   jsonb not null,                  -- metadata only, not full transcript
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now()
);

-- ─── Raw Google Calendar tables ─────────────────────────────────────────────

create table if not exists raw_google_calendar_events (
  id            uuid primary key default gen_random_uuid(),
  external_id   text not null unique,
  calendar_id   text,
  raw_payload   jsonb not null,
  fetched_at    timestamptz not null default now(),
  sync_run_id   uuid references source_sync_runs(id),
  created_at    timestamptz not null default now()
);

-- ─── Indexes for performance ────────────────────────────────────────────────

create index if not exists idx_source_sync_runs_source on source_sync_runs(source);
create index if not exists idx_source_sync_runs_status on source_sync_runs(status);
create index if not exists idx_raw_stripe_customers_ext on raw_stripe_customers(external_id);
create index if not exists idx_raw_hubspot_deals_ext on raw_hubspot_deals(external_id);
create index if not exists idx_raw_hubspot_companies_ext on raw_hubspot_companies(external_id);
create index if not exists idx_raw_instantly_campaigns_ext on raw_instantly_campaigns(external_id);
create index if not exists idx_raw_fathom_meetings_ext on raw_fathom_meetings(external_id);
