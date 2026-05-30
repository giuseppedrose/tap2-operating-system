-- ============================================================
-- Tap2 Operating System — Initial Schema
-- Migration: 20250101000000_initial_schema
-- ============================================================

-- ============================================================
-- PARTNERS
-- ============================================================
create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  role text,
  country_focus text,
  language text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- GTM SOURCES
-- ============================================================
create table if not exists gtm_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  active boolean not null default true
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  city text,
  industry text,
  source text,
  partner_owner text,
  stripe_customer_id text unique,
  hubspot_company_id text unique,
  status text not null default 'active'
    check (status in ('active', 'trial', 'churned', 'paused')),
  current_mrr numeric(10,2) not null default 0,
  start_date date,
  churn_date date,
  created_at timestamptz not null default now()
);

create index if not exists customers_status_idx on customers(status);
create index if not exists customers_partner_owner_idx on customers(partner_owner);
create index if not exists customers_source_idx on customers(source);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  stripe_subscription_id text unique,
  status text not null default 'active'
    check (status in ('active', 'trialing', 'past_due', 'canceled', 'unpaid')),
  mrr numeric(10,2) not null default 0,
  currency text not null default 'EUR',
  billing_interval text not null default 'month'
    check (billing_interval in ('month', 'year')),
  started_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_customer_id_idx on subscriptions(customer_id);
create index if not exists subscriptions_status_idx on subscriptions(status);

-- ============================================================
-- DEALS
-- ============================================================
create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  hubspot_deal_id text unique,
  company_name text not null,
  deal_name text,
  stage text not null default 'Lead'
    check (stage in (
      'Lead', 'Contacted', 'Meeting Booked', 'Demo Completed',
      'Proposal Sent', 'Trial Started', 'Negotiation',
      'Closed Won', 'Closed Lost'
    )),
  value numeric(10,2),
  expected_mrr numeric(10,2),
  probability integer default 0 check (probability between 0 and 100),
  source text,
  partner_owner text,
  close_date date,
  created_at timestamptz not null default now()
);

create index if not exists deals_stage_idx on deals(stage);
create index if not exists deals_partner_owner_idx on deals(partner_owner);
create index if not exists deals_close_date_idx on deals(close_date);

-- ============================================================
-- OUTBOUND CAMPAIGNS
-- ============================================================
create table if not exists outbound_campaigns (
  id uuid primary key default gen_random_uuid(),
  instantly_campaign_id text unique,
  name text not null,
  market text,
  segment text,
  owner text,
  status text not null default 'active'
    check (status in ('active', 'paused', 'completed', 'draft')),
  emails_sent integer not null default 0,
  open_rate numeric(5,2) default 0,
  reply_rate numeric(5,2) default 0,
  positive_reply_rate numeric(5,2) default 0,
  meetings_booked integer not null default 0,
  demos_completed integer not null default 0,
  deals_created integer not null default 0,
  pipeline_generated numeric(10,2) default 0,
  mrr_closed numeric(10,2) default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- CAMPAIGN LEADS
-- ============================================================
create table if not exists campaign_leads (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references outbound_campaigns(id) on delete cascade,
  email text not null,
  company_name text,
  contact_name text,
  country text,
  city text,
  segment text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'replied', 'positive', 'meeting', 'not_interested', 'unsubscribed')),
  replied boolean not null default false,
  positive_reply boolean not null default false,
  meeting_booked boolean not null default false,
  hubspot_contact_id text,
  hubspot_company_id text,
  hubspot_deal_id text,
  created_at timestamptz not null default now()
);

create index if not exists campaign_leads_campaign_id_idx on campaign_leads(campaign_id);
create index if not exists campaign_leads_email_idx on campaign_leads(email);

-- ============================================================
-- MEETINGS
-- ============================================================
create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source text,
  partner_owner text,
  company_name text,
  contact_name text,
  calendar_event_id text unique,
  fathom_call_id text unique,
  meeting_type text not null default 'Discovery'
    check (meeting_type in (
      'Discovery', 'Demo', 'Follow-up', 'Investor', 'Partner', 'Client Success', 'Other'
    )),
  meeting_date timestamptz not null,
  outcome text,
  next_step text,
  created_at timestamptz not null default now()
);

create index if not exists meetings_meeting_date_idx on meetings(meeting_date);
create index if not exists meetings_partner_owner_idx on meetings(partner_owner);

-- ============================================================
-- CALL INSIGHTS
-- ============================================================
create table if not exists call_insights (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meetings(id) on delete cascade,
  summary text,
  objections text[],
  buying_signals text[],
  next_steps text[],
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  ai_score integer check (ai_score between 0 and 100),
  created_at timestamptz not null default now()
);

-- ============================================================
-- BANK TRANSACTIONS
-- ============================================================
create table if not exists bank_transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_date date not null,
  description text not null,
  counterparty text,
  amount numeric(12,2) not null,
  currency text not null default 'EUR',
  category text default 'Other'
    check (category in (
      'Payroll', 'Contractor', 'Development', 'Marketing', 'SaaS',
      'Legal', 'Accounting', 'Travel', 'Office', 'Tax',
      'Founder Expense', 'Revenue', 'Other', 'Needs Review'
    )),
  subcategory text,
  is_recurring boolean not null default false,
  source_file text,
  created_at timestamptz not null default now()
);

create index if not exists bank_transactions_date_idx on bank_transactions(transaction_date);
create index if not exists bank_transactions_category_idx on bank_transactions(category);

-- ============================================================
-- CASH SNAPSHOTS
-- ============================================================
create table if not exists cash_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null unique,
  bank_balance numeric(12,2) not null,
  monthly_burn numeric(10,2) not null,
  runway_months numeric(5,1),
  accounts_receivable numeric(10,2) default 0,
  outstanding_invoices numeric(10,2) default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PRODUCT METRICS
-- ============================================================
create table if not exists product_metrics (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  active_clients integer not null default 0,
  active_wallets integer not null default 0,
  wallet_installs integer not null default 0,
  active_cards integer not null default 0,
  notifications_sent integer not null default 0,
  scans integer not null default 0,
  redemptions integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- FORECASTS
-- ============================================================
create table if not exists forecasts (
  id uuid primary key default gen_random_uuid(),
  scenario text not null
    check (scenario in ('Conservative', 'Expected', 'Aggressive')),
  month date not null,
  new_customers integer not null default 0,
  churned_customers integer not null default 0,
  expected_mrr numeric(10,2) not null default 0,
  expected_arr numeric(10,2) not null default 0,
  expected_cash numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique(scenario, month)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Enable after setting up Supabase Auth for your team.
-- ============================================================
-- alter table customers enable row level security;
-- alter table deals enable row level security;
-- alter table bank_transactions enable row level security;
-- alter table outbound_campaigns enable row level security;
-- alter table meetings enable row level security;
-- alter table call_insights enable row level security;
-- alter table cash_snapshots enable row level security;
-- alter table product_metrics enable row level security;
-- alter table forecasts enable row level security;
