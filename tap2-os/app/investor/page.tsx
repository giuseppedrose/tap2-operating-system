"use client";

import Image from "next/image";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceLine,
} from "recharts";
import { TAP2_COLORS, axisStyle, tooltipStyle, gridStyle } from "@/components/charts/chart-theme";
import { DataStatusBadge } from "@/components/shared/data-status-badge";
import { mockRevenueData } from "@/lib/mock-data/revenue";
import {
  CreditCard, Users, GitBranch, Wallet, Cpu, ArrowRight,
  Database, Mail, Calendar, Inbox, BarChart3, Building,
} from "lucide-react";

const BLUE = TAP2_COLORS.primary;

// Path-to-scale milestones
const milestones = [
  {
    label: "Current",
    mrr: 1400,
    arr: 16800,
    clients: 32,
    arpa: 44,
    note: "Seed data baseline",
    isCurrent: true,
  },
  {
    label: "Next Milestone",
    mrr: 8300,
    arr: 99600,
    clients: 190,
    arpa: 44,
    note: "€100k ARR",
    isCurrent: false,
  },
  {
    label: "Long-term",
    mrr: 83000,
    arr: 996000,
    clients: 1890,
    arpa: 44,
    note: "€1M ARR",
    isCurrent: false,
  },
];

const archItems = [
  { icon: <CreditCard className="h-5 w-5" />, source: "Stripe", arrow: "Revenue Intelligence", status: "pending" as const },
  { icon: <Users className="h-5 w-5" />, source: "HubSpot", arrow: "Sales Pipeline", status: "pending" as const },
  { icon: <Mail className="h-5 w-5" />, source: "Instantly AI", arrow: "Outbound Campaigns", status: "pending" as const },
  { icon: <Building className="h-5 w-5" />, source: "Rabobank CSV", arrow: "Cash & Runway", status: "manual" as const },
  { icon: <Calendar className="h-5 w-5" />, source: "Google Calendar + Fathom", arrow: "Meetings & Objections", status: "pending" as const },
  { icon: <Inbox className="h-5 w-5" />, source: "Gmail", arrow: "Invoice Scanning", status: "pending" as const },
  { icon: <Database className="h-5 w-5" />, source: "Supabase", arrow: "Unified Data Layer", status: "connected" as const },
  { icon: <BarChart3 className="h-5 w-5" />, source: "Tap2 OS", arrow: "Operating Intelligence", status: "connected" as const },
];

const gtmChannels = [
  { channel: "Cold Email (Instantly)", status: "Pending activation" },
  { channel: "Cold Calling", status: "Active" },
  { channel: "LinkedIn Outbound", status: "Active" },
  { channel: "Trade Events (Horecava, HIP)", status: "Active" },
  { channel: "Partner Referral Network", status: "Active" },
  { channel: "Inbound / Organic", status: "Building" },
];

const productMetrics = [
  { label: "Wallet Installs", value: "2,840", note: "Seed data" },
  { label: "Active Cards", value: "1,920", note: "Seed data" },
  { label: "Notifications Sent", value: "14,200", note: "Seed data" },
  { label: "Scans / Redemptions", value: "3,180", note: "Seed data" },
];

const financialMetrics = [
  { label: "Monthly Burn", value: "~€8,200", note: "Seed / manual" },
  { label: "Runway", value: "~4.7 mo", note: "Seed estimate" },
  { label: "Cash on Hand", value: "~€38,500", note: "Seed / manual" },
  { label: "Outstanding Invoices", value: "—", note: "Gmail pending" },
];

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

function MetricCard({ label, value, note, badge }: {
  label: string; value: string; note: string; badge?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        {badge ?? <DataStatusBadge status="seed" />}
        <span className="text-xs text-gray-400">{note}</span>
      </div>
    </div>
  );
}

export default function InvestorPage() {
  const mrrData = mockRevenueData.mrrHistory;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/brand/logo-blue.png" alt="Tap2" width={72} height={28} className="object-contain" />
          <span className="text-xs font-medium text-gray-400 border-l border-gray-200 pl-3">Operating System</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DataStatusBadge status="seed" tooltip="Dashboard uses structured seed data. Live integrations are pending." />
          <DataStatusBadge status="connected" integration="Supabase" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12 space-y-16">
        {/* Hero */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Investor Preview — May 2026
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Tap2 Operating System
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Revenue, pipeline, GTM, product usage, cash, and forecasting in one operating layer.
          </p>
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-6 py-4 inline-block text-left">
            <p className="text-sm font-semibold text-amber-800">Data Transparency Notice</p>
            <p className="mt-1 text-sm text-amber-700 max-w-lg">
              All metrics shown are structured seed data unless marked otherwise. Live integrations (Stripe, HubSpot, Instantly, Rabobank) are prepared but not yet connected. Numbers will update automatically when integrations are activated.
            </p>
          </div>
        </section>

        {/* Company description */}
        <section>
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <Image src="/brand/symbol-blue.png" alt="Tap2" width={40} height={40} className="flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">What is Tap2?</h2>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  Tap2 is building <strong>wallet-native loyalty and customer engagement infrastructure</strong> for HoReCa and local businesses. Customers tap their phone on a Tap2 card to instantly join a loyalty programme in Apple Wallet or Google Wallet — no app download required.
                </p>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  Primary focus: restaurants, cafés, bars, gyms, and independent local businesses. Expanding into retail, beauty & wellness, and membership-based venues.
                </p>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  <strong>Tap2 OS</strong> is the internal operating system designed to track revenue, pipeline, GTM performance, product usage, cash, meetings, and forecasts in one place.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {[
                    "Current version: seed data + Supabase-connected architecture",
                    "Next step: connect Stripe, HubSpot, Instantly, Rabobank, Calendar, Fathom",
                    "Target: single-screen view of all business intelligence",
                  ].map((item) => (
                    <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                      <ArrowRight className="h-3 w-3" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Current Baseline */}
        <section>
          <SectionHeader
            title="Current Baseline"
            subtitle="Approximate figures — Stripe connection will replace these with live data"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
            <MetricCard label="MRR" value="~€1,400" note="Stripe pending" />
            <MetricCard label="ARR (annualized)" value="~€16,800" note="Based on current MRR" />
            <MetricCard label="Active Clients" value="30+" note="Manual estimate" />
            <MetricCard
              label="Pipeline"
              value="€42k"
              note="HubSpot pending"
              badge={<DataStatusBadge status="seed" integration="HubSpot Pending" />}
            />
          </div>

          {/* MRR chart */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">MRR Growth Trajectory</p>
                <p className="text-xs text-gray-400 mt-0.5">Are MRR and ARR moving toward the next milestone?</p>
              </div>
              <DataStatusBadge status="seed" integration="Stripe Pending" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={mrrData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="investorMrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BLUE} stopOpacity={0.12} />
                    <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="month" {...axisStyle} tickFormatter={(v) => v.split(" ")[0]} />
                <YAxis {...axisStyle} tickFormatter={(v) => `€${v}`} />
                <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`€${Number(v).toLocaleString()}`, "MRR"]} />
                <ReferenceLine y={8300} stroke="#d97706" strokeDasharray="4 4" label={{ value: "€8.3k target", fill: "#d97706", fontSize: 10 }} />
                <Area type="monotone" dataKey="mrr" stroke={BLUE} strokeWidth={2.5} fill="url(#investorMrrGrad)" dot={false} activeDot={{ r: 4, fill: BLUE }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Path to Scale */}
        <section>
          <SectionHeader
            title="Path to Scale"
            subtitle="Milestones based on €44 ARPA assumption — assumptions clearly labelled"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {milestones.map((m) => (
              <div
                key={m.label}
                className={`rounded-xl border p-6 ${m.isCurrent ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"} shadow-sm`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold uppercase tracking-wide ${m.isCurrent ? "text-blue-600" : "text-gray-400"}`}>
                    {m.label}
                  </span>
                  {m.isCurrent && <DataStatusBadge status="seed" />}
                </div>
                <p className={`text-3xl font-bold ${m.isCurrent ? "text-blue-700" : "text-gray-900"}`}>
                  €{(m.mrr / 1000).toFixed(1)}k
                  <span className="text-sm font-normal text-gray-400 ml-1">MRR</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">€{(m.arr / 1000).toFixed(0)}k ARR</p>
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{m.clients.toLocaleString()}</span> clients @ €{m.arpa}/mo ARPA
                  </p>
                  <p className="text-xs text-gray-400">{m.note}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-400 text-center">
            Assumptions: €44/mo average revenue per account (blended across starter, growth, and pro tiers). Churn at 2.1%/mo. No fundraising required to reach €100k ARR target.
          </p>
        </section>

        {/* OS Architecture */}
        <section>
          <SectionHeader
            title="Operating System Architecture"
            subtitle="Each integration connects to a Supabase-backed intelligence layer"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {archItems.map((item) => (
              <div key={item.source} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0" style={{ background: "#e8effd", color: BLUE }}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{item.source}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <ArrowRight className="h-3 w-3" />
                    {item.arrow}
                  </p>
                </div>
                <DataStatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </section>

        {/* GTM Intelligence */}
        <section>
          <SectionHeader
            title="GTM Intelligence"
            subtitle="Channels tracked — which acquisition source creates qualified pipeline? Sample insight labels until Instantly + HubSpot are connected."
          />
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">Channel Performance Overview</p>
              <DataStatusBadge status="seed" integration="Instantly + HubSpot Pending" />
            </div>
            <div className="space-y-2">
              {gtmChannels.map((ch) => (
                <div key={ch.channel} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700">{ch.channel}</span>
                  <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                    ch.status === "Active"
                      ? "bg-green-50 text-green-700"
                      : ch.status === "Building"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    {ch.status}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
              Sample insight (seed data): Cold calling and referrals show the highest close rate at ~8–9%. Attribution will be confirmed when HubSpot source tracking is connected.
            </p>
          </div>
        </section>

        {/* Product Intelligence */}
        <section>
          <SectionHeader
            title="Product Intelligence"
            subtitle="Wallet installs, active cards, notifications, and redemptions — all seed data until product analytics sync is connected"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {productMetrics.map((m) => (
              <div key={m.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{m.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{m.value}</p>
                <div className="mt-2">
                  <DataStatusBadge status="seed" />
                </div>
              </div>
            ))}
          </div>

          {/* Revenue by segment bar */}
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">Revenue by Client Segment</p>
              <DataStatusBadge status="seed" integration="Stripe Pending" />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={mockRevenueData.revenueBySegment} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="segment" {...axisStyle} />
                <YAxis {...axisStyle} tickFormatter={(v) => `€${v}`} />
                <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`€${v}`, "MRR"]} />
                <Bar dataKey="mrr" radius={[4, 4, 0, 0]}>
                  {mockRevenueData.revenueBySegment.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? BLUE : i === 1 ? TAP2_COLORS.secondary : TAP2_COLORS.muted} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Financial Intelligence */}
        <section>
          <SectionHeader
            title="Financial Intelligence"
            subtitle="Burn, runway, cash, and invoices — seed/manual estimates until Rabobank CSV and invoice imports are connected"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {financialMetrics.map((m) => (
              <div key={m.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{m.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{m.value}</p>
                <div className="mt-2">
                  <DataStatusBadge status={m.note.includes("Gmail") ? "pending" : "manual"} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{m.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Investor Data Policy */}
        <section>
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">Investor Data Policy</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { ok: true, text: "All non-live data is clearly labelled" },
                { ok: true, text: "Supabase is the only active integration" },
                { ok: true, text: "No API keys exposed in this view" },
                { ok: true, text: "No raw bank transactions shown" },
                { ok: true, text: "No customer PII or personal data" },
                { ok: true, text: "No internal admin controls visible" },
                { ok: true, text: "No private email or transcript content" },
                { ok: true, text: "Seed data is clearly distinguished from live data" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-sm">
                  <span className={`h-4 w-4 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${item.ok ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                    {item.ok ? "✓" : "✗"}
                  </span>
                  <span className="text-gray-600">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center border-t border-gray-200 pt-8">
          <Image src="/brand/symbol-blue.png" alt="Tap2" width={28} height={28} className="mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-900">Tap2</p>
          <p className="text-xs text-gray-400 mt-1">Wallet-native loyalty infrastructure for HoReCa and local businesses</p>
          <p className="text-xs text-gray-300 mt-4">
            Tap2 OS — Internal operating dashboard · Investor preview · {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </p>
        </footer>
      </div>
    </div>
  );
}
