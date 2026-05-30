# Tap2 Operating System

Internal command center for Tap2 — wallet-native loyalty infrastructure for HoReCa & local businesses.

Answers the founder's morning questions:
1. MRR, ARR, growth, churn?
2. Who is selling effectively?
3. Which partner/channel is producing pipeline?
4. Which GTM channel scales us to €100k ARR?
5. Cash position, burn, runway, forecast?
6. Which outbound campaigns are working?
7. What objections are we hearing?
8. What should the team focus on this week?

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (App Router) |
| UI | Radix UI Primitives + custom components |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Vercel |
| AI Layer | Claude API (Phase 3) |

---

## Local Setup

### 1. Clone & install dependencies

```bash
# The app lives in the tap2-os/ subfolder of this repository
git clone https://github.com/giuseppedrose/tap2-operating-system
cd tap2-operating-system/tap2-os
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your Supabase credentials (see Supabase Setup below).
All other variables are commented out and only needed in Phase 2.

> **Never commit `.env.local` to Git.** It is already in `.gitignore`.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app runs fully on **mock data** until you connect Supabase — all 11 dashboards work without any API keys.

---

## Supabase Setup

### Option A — Use Supabase Cloud (recommended)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API**
3. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy `anon / public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
6. Run the migration in the Supabase SQL editor:

```bash
# Copy the contents of this file into the Supabase SQL editor:
supabase/migrations/20250101000000_initial_schema.sql
```

7. Optionally seed reference data:

```bash
# Copy the contents of this file into the Supabase SQL editor:
supabase/seed.sql
```

### Option B — Local Supabase (requires Docker)

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db reset

# Your local keys will be printed — add them to .env.local
```

---

## Environment Variables

### Required (for Supabase features)

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → service_role |

### Phase 2 integrations (leave blank for now)

| Variable | Service |
|----------|--------|
| `STRIPE_SECRET_KEY` | Stripe |
| `STRIPE_WEBHOOK_SECRET` | Stripe |
| `HUBSPOT_ACCESS_TOKEN` | HubSpot |
| `INSTANTLY_API_KEY` | Instantly AI |
| `GOOGLE_CLIENT_ID` | Google Calendar |
| `GOOGLE_CLIENT_SECRET` | Google Calendar |
| `FATHOM_API_KEY` | Fathom |
| `ANTHROPIC_API_KEY` | Claude API (Phase 3) |

See `.env.local.example` for the full template.

---

## Deploy to Vercel

### 1. Connect repository

Go to [vercel.com/new](https://vercel.com/new), import the repository (`giuseppedrose/tap2-operating-system`), and set **Root Directory** to `tap2-os`.

### 2. Add environment variables

In Vercel → Project → Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL      = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY     = eyJ...
```

### 3. Deploy

```bash
# Or via CLI:
npx vercel --prod
```

### Supabase CORS / allowed origins

In Supabase Dashboard → Authentication → URL Configuration, add your Vercel URL to **Allowed Redirect URLs**:
```
https://your-app.vercel.app
```

---

## Dashboards

| Route | Dashboard | Description |
|-------|-----------|-------------|
| `/` | Founder Dashboard | Morning KPI overview + MRR chart + top opportunities |
| `/revenue` | Revenue | MRR, ARR, churn rate, NRR, client table |
| `/pipeline` | Sales Pipeline | Deal stages, pipeline value, deals by owner |
| `/partners` | Partner Performance | Leaderboard with conversion rates |
| `/gtm` | GTM Channels | Channel comparison to find repeatable distribution |
| `/campaigns` | Outbound Campaigns | Instantly AI metrics, ROI per campaign |
| `/forecast` | Forecast | 3-scenario 24-month model |
| `/cash` | Cash & Burn | Bank balance, burn breakdown, runway |
| `/product` | Product Metrics | Wallets, scans, redemptions vs benchmark |
| `/board` | Board Dashboard | Investor-ready executive summary |
| `/admin` | Data Sources | Integration status, CSV upload, env var checker |

---

## Database Schema

13 tables — see `supabase/migrations/20250101000000_initial_schema.sql` for full DDL.

| Table | Description |
|-------|-------------|
| `customers` | Active + historical clients |
| `subscriptions` | Stripe subscription records |
| `deals` | Pipeline deals (HubSpot sync in Phase 2) |
| `partners` | Sales team & agency partners |
| `gtm_sources` | GTM channel registry |
| `outbound_campaigns` | Instantly AI campaign performance |
| `campaign_leads` | Individual leads per campaign |
| `meetings` | Calendar meetings + Fathom link |
| `call_insights` | AI-extracted sales call insights |
| `bank_transactions` | Rabobank / manual transactions |
| `cash_snapshots` | Monthly cash position snapshots |
| `product_metrics` | Wallet engagement metrics |
| `forecasts` | Revenue & cash forecasts |

---

## Project Structure

```
tap2-os/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Founder Dashboard
│   ├── revenue/page.tsx
│   ├── pipeline/page.tsx
│   ├── partners/page.tsx
│   ├── gtm/page.tsx
│   ├── campaigns/page.tsx
│   ├── forecast/page.tsx
│   ├── cash/page.tsx
│   ├── product/page.tsx
│   ├── board/page.tsx
│   └── admin/page.tsx
├── components/
│   ├── layout/                 # Sidebar, Header
│   ├── shared/                 # KpiCard, ChartCard, DataTable, etc.
│   └── ui/                     # Badge, Button, Card
├── lib/
│   ├── mock-data/              # Mock data for all dashboards
│   ├── integrations/           # API integration stubs (Phase 2)
│   │   ├── stripe/
│   │   ├── hubspot/
│   │   ├── instantly/
│   │   ├── rabobank/
│   │   ├── google-calendar/
│   │   ├── fathom/
│   │   └── gmail/
│   ├── supabase/               # DB client + TypeScript types
│   └── utils.ts
├── supabase/
│   ├── config.toml             # Local dev config
│   ├── migrations/             # Schema migrations
│   └── seed.sql                # Reference data + mock records
├── .env.local.example          # Environment variable template
└── .gitignore                  # .env.local and all secrets excluded
```

---

## Integration Roadmap

### Phase 1 (current) — Mock data
All dashboards use `lib/mock-data/`. No external API credentials needed.

### Phase 2 — Real data sync
Connect one integration at a time by adding the env var and redeploying:

1. **Supabase** — database layer (ready now)
2. **Stripe** — live MRR, subscriptions, churn
3. **HubSpot** — pipeline, deals, contacts
4. **Instantly AI** — campaign stats + lead attribution
5. **Rabobank** — CSV upload → auto-categorized transactions
6. **Google Calendar** — meeting sync
7. **Fathom** — call recordings + summaries

### Phase 3 — AI layer (Claude API)
- Weekly founder memo auto-generated from all data sources
- Objection extraction from Fathom call transcripts
- Deal scoring + next-best-action recommendations
- Pipeline risk alerts

---

## Security Notes

- `.env.local` is in `.gitignore` — **real keys never touch Git**
- `.env.local.example` is safe to commit — contains only placeholder strings
- Supabase service role key is server-only (not prefixed with `NEXT_PUBLIC_`)
- Phase 2 API keys are commented out in `.env.local.example` until needed
- Row Level Security (RLS) policies are included but commented out in the migration — enable before going multi-user

---

## Partners & GTM Sources

**Partners:** Giuseppe · Dorian · Joaquin · Jonathan · Carlo · Niels · Qubico Studio · Other

**GTM Sources:** Horecava · HIP Spain · Cold Email · Cold Calling · LinkedIn · CitySales · OptiDist · Qubico Studio · Referral · Website · Marketing Agency · Colombia · Italy Outbound · Spain Outbound

---

**Current state: €1.4k MRR / €16.8k ARR · 32 active clients**
