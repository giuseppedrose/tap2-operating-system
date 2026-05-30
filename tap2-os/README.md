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
| AI Layer | Claude API (Anthropic) |

---

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/giuseppedrose/VeganHouse
cd VeganHouse/tap2-os
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in the values. **Phase 1 runs fully on mock data — all vars are optional.**

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy to Vercel

```bash
npx vercel --prod
```

Set environment variables in Vercel → Settings → Environment Variables.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server only) |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_live_...) |
| `HUBSPOT_ACCESS_TOKEN` | HubSpot private app token |
| `INSTANTLY_API_KEY` | Instantly AI API key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `FATHOM_API_KEY` | Fathom meeting notes API key |
| `ANTHROPIC_API_KEY` | Claude API key for AI features |

---

## Dashboards

| Route | Dashboard |
|-------|-----------|
| `/` | Founder Dashboard — morning overview |
| `/revenue` | Revenue — MRR, ARR, churn, clients |
| `/pipeline` | Sales Pipeline — HubSpot-style kanban |
| `/partners` | Partner Performance — leaderboard |
| `/gtm` | GTM Channels — repeatable distribution |
| `/campaigns` | Outbound Campaigns — Instantly AI |
| `/forecast` | Forecast — 3-scenario model |
| `/cash` | Cash & Burn — Rabobank data |
| `/product` | Product Metrics — wallets, scans |
| `/board` | Board Dashboard — investor view |
| `/admin` | Data Sources & Admin |

---

## Database Schema

Run `lib/supabase/schema.sql` against your Supabase project.

Tables: `customers`, `subscriptions`, `deals`, `partners`, `gtm_sources`, `outbound_campaigns`, `campaign_leads`, `meetings`, `call_insights`, `bank_transactions`, `cash_snapshots`, `product_metrics`, `forecasts`

---

## Integration Plan

### Phase 1 (Current) — Mock Data
All dashboards run on mock data from `lib/mock-data/`. Integration stubs in `lib/integrations/` have proper TypeScript interfaces.

### Phase 2 — Real Data Sync
- **Stripe**: MRR, subscriptions, webhook handler
- **HubSpot**: Deals, contacts, pipeline sync
- **Instantly AI**: Campaigns, leads, attribution
- **Rabobank**: CSV upload + auto-categorization
- **Google Calendar**: Meeting sync
- **Fathom**: Call summaries + transcript pull

### Phase 3 — AI Layer (Claude API)
- Weekly founder memo auto-generated
- Objection extraction from Fathom transcripts
- Deal scoring + next-best-action recommendations
- Pipeline risk detection

---

## Attribution Logic (Instantly → HubSpot)

1. Exact email match
2. Domain match
3. Company name fuzzy match (Levenshtein < 3)

See `lib/integrations/instantly/normalize.ts`.

---

## Partner Owners

Giuseppe · Dorian · Joaquin · Jonathan · Carlo · Niels · Qubico Studio · Other

## GTM Sources

Horecava · HIP Spain · Cold Email · Cold Calling · LinkedIn · CitySales · OptiDist · Qubico Studio · Referral · Website · Marketing Agency · Colombia · Italy Outbound · Spain Outbound

---

## Forecast Scenarios

| Scenario | New Clients/Month |
|----------|------------------|
| Conservative | 3 |
| Expected | 10 |
| Aggressive | 25 |

**Current state: €1.4k MRR / €16.8k ARR · 32 active clients**
