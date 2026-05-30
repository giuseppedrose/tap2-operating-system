"use client";

import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { mockRevenueData } from "@/lib/mock-data/revenue";
import { mockPipelineData } from "@/lib/mock-data/pipeline";
import { mockCashData } from "@/lib/mock-data/cash";
import { mockProductData } from "@/lib/mock-data/product";
import { mockForecastData } from "@/lib/mock-data/forecast";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Legend,
} from "recharts";
import { DollarSign, Users, Wallet, TrendingUp, Cpu, GitBranch } from "lucide-react";

const BLUE = "#0358F1";

export default function BoardPage() {
  const expectedScenario = mockForecastData.scenarios.find((s) => s.name === "Expected")!;

  // Key board metrics
  const netBurn = mockCashData.monthlyBurn - mockRevenueData.currentMRR;

  return (
    <div className="space-y-8">
      {/* Board Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tap2 Board Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">Executive summary — December 2025</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500">Stage</p>
            <p className="text-lg font-bold" style={{ color: BLUE }}>Pre-Seed</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs text-gray-400">Founded</p>
            <p className="text-sm font-semibold text-gray-900">2024</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Markets</p>
            <p className="text-sm font-semibold text-gray-900">NL · ES · CO · IT</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Product</p>
            <p className="text-sm font-semibold text-gray-900">Digital Loyalty Wallet</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Focus Vertical</p>
            <p className="text-sm font-semibold text-gray-900">HoReCa / Plant-Based F&B</p>
          </div>
        </div>
      </div>

      {/* North Star KPIs */}
      <div>
        <h3 className="mb-4 text-base font-semibold text-gray-700 uppercase tracking-wide text-xs">North Star Metrics</h3>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard title="MRR" value={`€${mockRevenueData.currentMRR.toLocaleString()}`} trend={mockRevenueData.growth} trendLabel="MoM" icon={<DollarSign className="h-5 w-5" />} />
          <KpiCard title="ARR" value={`€${mockRevenueData.arr.toLocaleString()}`} subvalue="annualized" icon={<TrendingUp className="h-5 w-5" />} />
          <KpiCard title="Paying Clients" value={mockRevenueData.activeClients} trend={8.3} trendLabel="MoM" icon={<Users className="h-5 w-5" />} />
          <KpiCard title="Cash Runway" value={`${mockCashData.runway} mo`} subvalue={`€${mockCashData.bankBalance.toLocaleString()} balance`} icon={<Wallet className="h-5 w-5" />} />
          <KpiCard title="Pipeline" value={`€${mockPipelineData.weightedPipeline.toLocaleString()}`} subvalue="weighted" icon={<GitBranch className="h-5 w-5" />} />
          <KpiCard title="Active Wallets" value={mockProductData.activeWallets.toLocaleString()} trend={5.1} trendLabel="MoM" icon={<Cpu className="h-5 w-5" />} />
        </div>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="MRR Growth" description="Monthly recurring revenue — 12 months">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockRevenueData.mrrHistory} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="boardMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BLUE} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => v.split(" ")[0]} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`€${v}`, "MRR"]} />
              <Area type="monotone" dataKey="mrr" stroke={BLUE} strokeWidth={2.5} fill="url(#boardMrr)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="18-Month Revenue Forecast" description="Expected scenario projection">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={expectedScenario.months.slice(0, 18)} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => v.split(" ")[0]} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`€${v}`, "MRR"]} />
              <Line type="monotone" dataKey="expectedMrr" stroke={BLUE} strokeWidth={2.5} dot={false} strokeDasharray="6 2" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Unit Economics */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Unit Economics</h3>
          <div className="space-y-3">
            {[
              { label: "ARPC (Monthly)", value: `€${mockRevenueData.averageRevenuePerClient.toFixed(2)}` },
              { label: "Monthly Churn", value: `${mockRevenueData.churn}%` },
              { label: "Net Revenue Retention", value: "~102%" },
              { label: "Net Monthly Burn", value: `€${netBurn.toLocaleString()}` },
              { label: "Burn Multiple", value: `${(netBurn / mockRevenueData.newMRR).toFixed(1)}x` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Funnel */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Sales Funnel (Cumulative)</h3>
          <div className="space-y-2">
            {mockPipelineData.stages.filter((s) => !["Closed Lost"].includes(s.stage)).map((stage, i, arr) => (
              <div key={stage.stage} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{stage.stage}</span>
                    <span className="font-medium text-gray-900">{stage.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(stage.count / arr[0].count) * 100}%`,
                        background: BLUE,
                        opacity: 1 - i * 0.08,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Health */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Product Health</h3>
          <div className="space-y-3">
            {[
              { label: "Active Wallets", value: mockProductData.activeWallets.toLocaleString() },
              { label: "Active Cards", value: mockProductData.activeCards.toLocaleString() },
              { label: "Wallet Conversion", value: `${mockProductData.walletConversionRate}%` },
              { label: "Activation Rate", value: `${mockProductData.activationRate}%` },
              { label: "Monthly Scans", value: mockProductData.scans.toLocaleString() },
              { label: "Redemptions", value: mockProductData.redemptions.toLocaleString() },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Burn vs Revenue */}
      <ChartCard title="Burn vs Revenue — Path to Profitability" description="Monthly burn rate and MRR convergence">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={mockCashData.burnHistory} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="boardBurn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="boardRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BLUE} stopOpacity={0.08} />
                <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => v.split(" ")[0]} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`€${Number(v).toLocaleString()}`]} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="burn" stroke="#ef4444" strokeWidth={2} fill="url(#boardBurn)" dot={false} name="Total Burn" />
            <Area type="monotone" dataKey="revenue" stroke={BLUE} strokeWidth={2} fill="url(#boardRev)" dot={false} name="MRR" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
