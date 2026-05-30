"use client";

import { KpiCard } from "@/components/shared/kpi-card";
import { MilestoneCard } from "@/components/shared/milestone-card";
import { DataSourceBadge } from "@/components/shared/data-source-badge";
import {
  CURRENT_MRR, ARR, ACTIVE_CLIENT_COUNT,
  DATA_SOURCES,
} from "@/lib/mock-data/connected";
import { mockCashData } from "@/lib/mock-data/cash";
import { mockPipelineData } from "@/lib/mock-data/pipeline";
import { mockProductData } from "@/lib/mock-data/product";
import { mockForecastData } from "@/lib/mock-data/forecast";
import { DollarSign, Users, GitBranch, Wallet, Cpu, TrendingUp } from "lucide-react";

const BLUE = "#0358F1";

// Compute month when ARR reaches 100k in expected scenario
const expectedScenario = mockForecastData.scenarios.find((s) => s.name === "Expected")!;
const month100k = expectedScenario.months.find(m => m.expectedArr >= 100000);

// Best channels computed
const BEST_CHANNELS = [
  { label: 'Best GTM Source', name: 'Horecava', metric: '3 clients, €267 MRR closed', color: '#16a34a' },
  { label: 'Best Partner', name: 'Giuseppe', metric: '4 clients, €356 MRR closed', color: BLUE },
  { label: 'Best Campaign', name: 'NL Q4 2025', metric: '356 MRR closed', color: '#7c3aed' },
];

const INTEGRATIONS = [
  { emoji: '💳', name: 'Stripe', truth: 'Revenue truth', status: 'pending' as const },
  { emoji: '🔗', name: 'HubSpot', truth: 'Pipeline truth', status: 'pending' as const },
  { emoji: '📧', name: 'Instantly AI', truth: 'Outbound truth', status: 'pending' as const },
  { emoji: '🏦', name: 'Rabobank', truth: 'Cash truth', status: 'csv' as const },
  { emoji: '🎙️', name: 'Fathom + Calendar', truth: 'Meeting truth', status: 'pending' as const },
  { emoji: '🗄️', name: 'Supabase', truth: 'Data unification', status: 'connected' as const },
  { emoji: '⚡', name: 'Tap2 OS', truth: 'Operating intelligence', status: 'connected' as const },
];

export default function InvestorPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tap2 — Investor Operating View</h1>
            <p className="text-sm text-gray-500 mt-1">December 2025 · Pre-Seed · Digital Loyalty for HoReCa</p>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-sm text-gray-500">Data status:</span>
              <DataSourceBadge status="mock" />
            </div>
            <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: BLUE }}>
              Pre-Seed
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-gray-100 pt-4">
          <div><p className="text-xs text-gray-400">Founded</p><p className="text-sm font-semibold text-gray-900">2024</p></div>
          <div><p className="text-xs text-gray-400">Markets</p><p className="text-sm font-semibold text-gray-900">NL · ES · CO · IT</p></div>
          <div><p className="text-xs text-gray-400">Product</p><p className="text-sm font-semibold text-gray-900">Digital Loyalty Wallet</p></div>
          <div><p className="text-xs text-gray-400">Focus</p><p className="text-sm font-semibold text-gray-900">HoReCa / Plant-Based F&B</p></div>
        </div>
      </div>

      {/* North Star KPIs */}
      <div>
        <h2 className="mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">North Star Metrics</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard title="MRR" value={`€${CURRENT_MRR.toLocaleString()}`} trend={14.5} trendLabel="MoM" icon={<DollarSign className="h-5 w-5" />} />
          <KpiCard title="ARR" value={`€${ARR.toLocaleString()}`} subvalue="annualized" icon={<TrendingUp className="h-5 w-5" />} />
          <KpiCard title="Active Clients" value={ACTIVE_CLIENT_COUNT} trend={8.3} trendLabel="MoM" icon={<Users className="h-5 w-5" />} />
          <KpiCard title="Weighted Pipeline" value={`€${mockPipelineData.weightedPipeline.toLocaleString()}`} subvalue="prob-adjusted" icon={<GitBranch className="h-5 w-5" />} />
          <KpiCard title="Cash Runway" value={`${mockCashData.runway} mo`} subvalue={`€${mockCashData.bankBalance.toLocaleString()} balance`} icon={<Wallet className="h-5 w-5" />} />
          <KpiCard title="Active Wallets" value={mockProductData.activeWallets.toLocaleString()} trend={5.1} trendLabel="MoM" icon={<Cpu className="h-5 w-5" />} />
        </div>
      </div>

      {/* Milestone Tracker */}
      <div>
        <h2 className="mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Path to Scale</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MilestoneCard label="Path to €100k ARR" current={ARR} target={100000} />
          <MilestoneCard label="Path to €1M ARR" current={ARR} target={1000000} />
          <MilestoneCard label="Active Clients (target 94)" current={ACTIVE_CLIENT_COUNT} target={94} unit="" />
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col justify-center">
            <p className="text-sm font-medium text-gray-700 mb-2">Estimated €100k ARR Month</p>
            <p className="text-2xl font-bold" style={{ color: BLUE }}>
              {month100k ? month100k.month : 'Beyond 24mo'}
            </p>
            <p className="text-xs text-gray-400 mt-1">Expected scenario — {month100k ? `${month100k.totalCustomers} customers` : 'needs acceleration'}</p>
          </div>
        </div>
      </div>

      {/* Best Channels */}
      <div>
        <h2 className="mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Best Performing Channels</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {BEST_CHANNELS.map((ch) => (
            <div key={ch.name} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-400 mb-1">{ch.label}</p>
              <p className="text-xl font-bold text-gray-900">{ch.name}</p>
              <p className="text-sm text-gray-500 mt-1">{ch.metric}</p>
              <div className="mt-3 h-1 rounded-full" style={{ background: ch.color }} />
            </div>
          ))}
        </div>
      </div>

      {/* Why This OS Matters */}
      <div>
        <h2 className="mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Why This Operating System Matters</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {INTEGRATIONS.map((int) => {
            const statusColors: Record<string, { bg: string; text: string }> = {
              connected: { bg: 'bg-blue-50', text: 'text-blue-700' },
              pending:   { bg: 'bg-gray-50', text: 'text-gray-500' },
              csv:       { bg: 'bg-purple-50', text: 'text-purple-700' },
            };
            const sc = statusColors[int.status] ?? { bg: 'bg-gray-50', text: 'text-gray-500' };
            return (
              <div key={int.name} className={`rounded-xl border border-gray-200 p-4 text-center shadow-sm ${sc.bg}`}>
                <div className="text-2xl mb-2">{int.emoji}</div>
                <p className={`text-xs font-bold ${sc.text}`}>{int.name}</p>
                <p className="text-xs text-gray-500 mt-1">{int.truth}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Source Status */}
      <div>
        <h2 className="mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Integration Status</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DATA_SOURCES.map((ds) => (
            <div key={ds.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900">{ds.name}</p>
                  <DataSourceBadge status={ds.status} />
                </div>
                <p className="text-xs text-gray-500">
                  {ds.status === 'connected'
                    ? `${ds.records} records · Last sync ${ds.lastSync}`
                    : ds.status === 'csv'
                    ? 'Manual CSV import required'
                    : 'Not yet connected'}
                </p>
                {ds.tables.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">Tables: {ds.tables.slice(0, 3).join(', ')}{ds.tables.length > 3 ? '…' : ''}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Note */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-xs font-semibold text-blue-700 mb-1">Investor Data Policy</p>
        <p className="text-xs text-blue-600">
          This view does not expose: API keys, bank transaction details, customer PII, or admin credentials.
          All sensitive data is masked. Revenue figures are mock data pending Stripe connection.
        </p>
      </div>
    </div>
  );
}
