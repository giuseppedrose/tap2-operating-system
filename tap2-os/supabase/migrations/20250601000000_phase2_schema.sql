-- Phase 2 additions

create table if not exists customer_lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  event_type text not null,
  from_stage text,
  to_stage text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists objections (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id),
  text text not null,
  category text,
  partner_owner text,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists sales_activities (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id),
  partner_owner text,
  activity_type text not null,
  notes text,
  activity_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists data_source_status (
  id text primary key,
  name text not null,
  status text not null default 'pending',
  last_sync_at timestamptz,
  records_imported integer default 0,
  error_message text,
  updated_at timestamptz not null default now()
);

create table if not exists investor_metrics_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null unique,
  mrr numeric(10,2),
  arr numeric(10,2),
  active_clients integer,
  pipeline_value numeric(10,2),
  weighted_pipeline numeric(10,2),
  runway_months numeric(5,1),
  active_wallets integer,
  created_at timestamptz not null default now()
);
