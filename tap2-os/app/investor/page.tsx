"use client";

import Image from "next/image";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { CheckCircle, Circle, AlertTriangle } from "lucide-react";
import { getInvestorMetrics, calcGTMSources, REVENUE } from "@/lib/operating-model/calculations";
import { SEED_CAMPAIGNS } from "@/lib/operating-model/seed";
import { DataStatusBadge } from "@/components/shared/data-status-badge";
import { TAP2_COLORS, axisStyle, tooltipStyle, gridStyle } from "@/components/charts/chart-theme";

const MRR_HISTORY = [
  { month: "Jan 25", mrr: 800 },
  { month: "Feb 25", mrr: 860 },
  { month: "Mar 25", mrr: 920 },
  { month: "Apr 25", mrr: 980 },
  { month: "May 25", mrr: 1020 },
  { month: "Jun 25", mrr: 1080 },
  { month: "Jul 25", mrr: 1120 },
  { month: "Aug 25", mrr: 1160 },
  { month: "Sep 25", mrr: 1220 },
  { month: "Oct 25", mrr: 1280 },
  { month: "Nov 25", mrr: 1340 },
  { month: "Dec 25", mrr: 1400 },
  { month: "Jan 26", mrr: 1380 },
  { month: "Feb 26", mrr: 1420 },
  { month: "Mar 26", mrr: 1450 },
  { month: "Apr 26", mrr: 1390 },
  { month: "May 26", mrr: 1400 },
];

const INTEGRATIONS = [
  { name: "Stripe", purpose: "Revenue", status: "pending" as const },
  { name: "HubSpot", purpose: "Pipeline", status: "pending" as const },
  { name: "Instantly", purpose: "Campaigns", status: "pending" as const },
  { name: "Rabobank", purpose: "Cash", status: "pending" as const },
  { name: "Calendar + Fathom", purpose: "Meetings", status: "pending" as const },
  { name: "Gmail", purpose: "Invoices", status: "pending" as const },
  { name: "Supabase", purpose: "Data", status: "connected" as const },
  { name: "Tap2 OS", purpose: "Intelligence", status: "connected" as const },
];

const MILESTONE_CARDS = [
  {
    label: "Current",
    mrr: REVENUE.currentMRR,
    arr: REVENUE.arr,
    clients: REVENUE.activeClients,
    arpa: REVENUE.arpa,
    note: "Seed data baseline",
    color: "border-gray-200 bg-white",
  },
  {
    label: "€100k ARR",
    mrr: 8300,
    arr: 99600,
    clients: Math.round(8300 / REVENUE.arpa),
    arpa: REVENUE.arpa,
    note: `~${Math.round(8300 / REVENUE.arpa)} clients @ €${REVENUE.arpa} ARPA`,
    color: "border-amber-200 bg-amber-50",
  },
  {
    label: "€1M ARR",
    mrr: 83300,
    arr: 999600,
    clients: Math.round(83300 / REVENUE.arpa),
    arpa: REVENUE.arpa,
    note: `~${Math.round(83300 / REVENUE.arpa)} clients @ €${REVENUE.arpa} ARPA`,
    color: "border-blue-200 bg-blue-50",
  },
];

export default function InvestorPage() {
  const metrics = getInvestorMetrics();
  const gtmSources = calcGTMSources().slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Image src="/brand/logo-blue.png" alt="Tap2" width={80} height={28} className="object-contain" />
          <DataStatusBadge status="seed" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">

        {/* 1. Hero */}
        <section className="text-center space-y-4">
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            Investor Preview — May 2026
          </span>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Tap2 Operating System
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Revenue, pipeline, GTM, product usage, cash, and forecasting in one operating layer.
          </p>
          <div className="flex items-start gap-3 max-w-xl mx-auto rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              <span className="font-semibold">Data transparency:</span> All metrics shown are seed data unless marked live. Live integrations are pending — see integration status below.
            </p>
          </div>
        </section>

        {/* 2. What is Tap2 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">What is Tap2?</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <p className="text-gray-700 leading-relaxed">
              Tap2 is building wallet-native loyalty and customer engagement infrastructure for HoReCa and local businesses. Using NFC-enabled tap cards, Tap2 connects venues to their customers — enabling instant digital loyalty, notifications, and repeat visit incentives.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              {[
                "Started in the Netherlands HoReCa market (restaurants, cafes, bars)",
                "Expanding into gyms, retail, memberships, and service businesses",
                "Architecture ready for live Stripe, HubSpot, and POS integrations",
                "Building toward a full operating OS for local business revenue intelligence",
              ].map(point => (
                <li key={point} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 3. From Dashboard to Operating Discipline */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">From Dashboard to Operating Discipline</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-red-100 bg-red-50 p-5">
              <p className="text-sm font-semibold text-red-700 mb-3">Before: Fragmented Tools</p>
              <ul className="space-y-1.5 text-xs text-red-700">
                {["Stripe — revenue data siloed", "HubSpot — pipeline not synced", "Instantly — campaign results isolated", "Bank CSV — cash manually tracked", "Call notes — meeting insights lost"].map(t => (
                  <li key={t} className="flex items-center gap-2">
                    <Circle className="h-3 w-3 flex-shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-green-100 bg-green-50 p-5">
              <p className="text-sm font-semibold text-green-700 mb-3">After: One Operating Layer</p>
              <ul className="space-y-1.5 text-xs text-green-700">
                {[
                  "See cause and effect across GTM actions",
                  "Identify which campaigns generate closed revenue",
                  "Track partner performance with graded scorecards",
                  "Forecast 24-month scenarios from live MRR",
                  "Investor-grade transparency without Excel",
                ].map(t => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 flex-shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center">
            Goal: identify a repeatable GTM motion before scaling spend.
          </p>
        </section>

        {/* 4. Current Baseline */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Current Baseline</h2>
            <DataStatusBadge status="seed" />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "MRR", value: `~€${REVENUE.currentMRR}` },
              { label: "ARR", value: `~€${REVENUE.arr.toLocaleString()}` },
              { label: "Active Clients", value: String(REVENUE.activeClients) },
              { label: "ARPA", value: `€${REVENUE.arpa}/mo` },
            ].map(m => (
              <div key={m.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
                <p className="text-xs text-gray-500">{m.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{m.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-1">MRR History</p>
            <p className="text-xs text-blue-600 mb-3">Seed data — Stripe integration pending</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={MRR_HISTORY} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TAP2_COLORS.primary} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={TAP2_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="month" {...axisStyle} interval={3} />
                <YAxis {...axisStyle} tickFormatter={(v: unknown) => `€${String(v)}`} domain={[0, 10000]} />
                <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`€${String(v)}`, "MRR"]} />
                <ReferenceLine y={8300} stroke="#d97706" strokeDasharray="4 4" label={{ value: "€100k ARR target", fill: "#d97706", fontSize: 10 }} />
                <Area type="monotone" dataKey="mrr" stroke={TAP2_COLORS.primary} fill="url(#mrrGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 5. Path to Scale */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Path to Scale</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {MILESTONE_CARDS.map(card => (
              <div key={card.label} className={`rounded-xl border p-5 shadow-sm ${card.color}`}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900">€{card.mrr.toLocaleString()}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                <p className="text-sm text-gray-600 mt-1">ARR: €{card.arr.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-2">{card.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. OS Architecture */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Operating System Architecture</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {INTEGRATIONS.map(item => (
              <div key={item.name} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-900">{item.name}</span>
                  <DataStatusBadge status={item.status} />
                </div>
                <span className="text-xs text-gray-500">→ {item.purpose}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Revenue Engine */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Revenue Engine</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Pipeline (Gross)</p>
              <p className="text-2xl font-bold text-gray-900">€{metrics.pipelineGross.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Weighted: €{metrics.weightedPipeline.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Closed Won</p>
              <p className="text-2xl font-bold text-gray-900">{REVENUE.activeClients} clients</p>
              <p className="text-xs text-gray-400 mt-1">€{REVENUE.currentMRR}/mo MRR</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{SEED_CAMPAIGNS.length}</p>
              <p className="text-xs text-gray-400 mt-1">Cold email — seed data</p>
            </div>
          </div>
        </section>

        {/* 8. GTM Intelligence */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">GTM Intelligence</h2>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700 font-medium">Seed Insight</span>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {gtmSources.map(source => (
              <div key={source.source} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">{source.source}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium border ${
                    source.recommendation === "Double Down" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    source.recommendation === "Test More" ? "bg-green-50 text-green-700 border-green-200" :
                    "bg-gray-50 text-gray-600 border-gray-200"
                  }`}>
                    {source.recommendation}
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900">€{source.closed_mrr}<span className="text-xs font-normal text-gray-400">/mo MRR</span></p>
                <p className="text-xs text-gray-400 mt-1">{source.leads} leads → {source.meetings} meetings → {source.closed_won} closes</p>
              </div>
            ))}
          </div>
        </section>

        {/* 9. Product Intelligence */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Product Intelligence</h2>
            <DataStatusBadge status="seed" />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Wallet Installs", value: "2,840" },
              { label: "Active Cards", value: "1,920" },
              { label: "Notifications Sent", value: "14,200" },
              { label: "Scans", value: "3,180" },
            ].map(tile => (
              <div key={tile.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
                <p className="text-xs text-gray-500">{tile.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{tile.value}</p>
                <DataStatusBadge status="seed" />
              </div>
            ))}
          </div>
        </section>

        {/* 10. Financial Intelligence */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Financial Intelligence</h2>
            <DataStatusBadge status="manual" />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Burn", value: "~€8,200/mo", status: "manual" as const },
              { label: "Runway", value: "~4.7 mo", status: "manual" as const },
              { label: "Cash", value: "~€38,500", status: "manual" as const },
              { label: "Outstanding Invoices", value: "—", status: "pending" as const },
            ].map(tile => (
              <div key={tile.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">{tile.label}</p>
                  <DataStatusBadge status={tile.status} />
                </div>
                <p className="text-xl font-bold text-gray-900">{tile.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 11. Investor Data Policy */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Investor Data Policy</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-600 mb-3">The following are NOT shown in this investor view:</p>
            <ul className="space-y-2">
              {[
                "Individual client names or company details",
                "Personally identifiable information (PII)",
                "Internal team salaries or personal compensation",
                "Confidential partner agreements or pricing terms",
                "Legal documents or pending contract terms",
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 12. Next Integration Milestones */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Next Integration Milestones</h2>
          <ol className="space-y-2">
            {[
              { step: 1, name: "Stripe", action: "Connect live MRR and payment data" },
              { step: 2, name: "HubSpot", action: "Sync pipeline and deal stages live" },
              { step: 3, name: "Instantly", action: "Pull campaign metrics automatically" },
              { step: 4, name: "Rabobank", action: "Connect bank feed for live cash tracking" },
              { step: 5, name: "Calendar + Fathom", action: "Auto-log meetings and call summaries" },
            ].map(item => (
              <li key={item.step} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {item.step}
                </span>
                <div>
                  <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                  <span className="ml-2 text-xs text-gray-500">— {item.action}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-8 text-center text-xs text-gray-400">
          <div className="mb-3">
            <Image src="/brand/logo-blue.png" alt="Tap2" width={48} height={18} className="object-contain mx-auto opacity-40" />
          </div>
          <p>Tap2 Operating System — Investor Preview May 2026</p>
          <p className="mt-1">All metrics are seed data unless marked live. For questions contact the Tap2 team.</p>
        </footer>

      </div>
    </div>
  );
}
