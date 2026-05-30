"use client";

import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { mockRevenueData } from "@/lib/mock-data/revenue";
import { mockPipelineData } from "@/lib/mock-data/pipeline";
import { mockCashData } from "@/lib/mock-data/cash";
import { mockProductData } from "@/lib/mock-data/product";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { DollarSign, Users, GitBranch, Wallet, Cpu, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const BLUE = "#0358F1";

interface Client {
  id: string;
  name: string;
  country: string;
  mrr: number;
  status: string;
  source: string;
  partnerOwner: string;
}

const clientColumns: Column<Client>[] = [
  { header: "Client", accessor: "name", cell: (row) => <span className="font-medium text-gray-900">{row.name}</span> },
  { header: "Country", accessor: "country" },
  { header: "MRR", accessor: "mrr", cell: (row) => <span className="font-semibold text-gray-900">€{row.mrr}</span> },
  { header: "Status", accessor: "status", cell: (row) => <StatusBadge status={row.status} /> },
  { header: "Source", accessor: "source" },
  { header: "Owner", accessor: "partnerOwner" },
];

export default function FounderDashboard() {
  const revenueChartData = mockRevenueData.mrrHistory;
  const activeClients = mockRevenueData.clients.filter((c) => c.status === "active").slice(0, 8);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="MRR"
          value={`€${mockRevenueData.currentMRR.toLocaleString()}`}
          trend={mockRevenueData.growth}
          trendLabel="vs last month"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KpiCard
          title="ARR"
          value={`€${mockRevenueData.arr.toLocaleString()}`}
          subvalue="annualized"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KpiCard
          title="Active Clients"
          value={mockRevenueData.activeClients}
          trend={8.3}
          trendLabel="vs last month"
          icon={<Users className="h-5 w-5" />}
        />
        <KpiCard
          title="Pipeline"
          value={`€${mockPipelineData.totalPipeline.toLocaleString()}`}
          subvalue={`€${mockPipelineData.weightedPipeline.toLocaleString()} weighted`}
          icon={<GitBranch className="h-5 w-5" />}
        />
        <KpiCard
          title="Cash Balance"
          value={`€${mockCashData.bankBalance.toLocaleString()}`}
          subvalue={`${mockCashData.runway} mo runway`}
          icon={<Wallet className="h-5 w-5" />}
        />
        <KpiCard
          title="Active Wallets"
          value={mockProductData.activeWallets.toLocaleString()}
          trend={5.1}
          trendLabel="vs last month"
          icon={<Cpu className="h-5 w-5" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard
            title="MRR Growth"
            description="Monthly recurring revenue over last 12 months"
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueChartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BLUE} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v.split(" ")[0]}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `€${v}`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(v: unknown) => [`€${Number(v).toLocaleString()}`, "MRR"]}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke={BLUE}
                  strokeWidth={2.5}
                  fill="url(#mrrGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: BLUE }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard
          title="Revenue by Country"
          description="MRR distribution"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={mockRevenueData.revenueByCountry}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `€${v}`}
              />
              <YAxis
                type="category"
                dataKey="country"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                formatter={(v: unknown) => [`€${v}`, "MRR"]}
              />
              <Bar dataKey="mrr" radius={[0, 4, 4, 0]}>
                {mockRevenueData.revenueByCountry.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === 0 ? BLUE : `rgba(3,88,241,${0.7 - i * 0.1})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* MRR Breakdown */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">New MRR</p>
          <p className="mt-2 text-2xl font-bold text-green-600">+€{mockRevenueData.newMRR}</p>
          <p className="mt-1 text-xs text-gray-400">This month</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Churned MRR</p>
          <p className="mt-2 text-2xl font-bold text-red-500">-€{mockRevenueData.churnedMRR}</p>
          <p className="mt-1 text-xs text-gray-400">This month</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expansion MRR</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">+€{mockRevenueData.expansionMRR}</p>
          <p className="mt-1 text-xs text-gray-400">This month</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Churn Rate</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{mockRevenueData.churn}%</p>
          <p className="mt-1 text-xs text-gray-400">Monthly</p>
        </div>
      </div>

      {/* Clients Table */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Active Clients</h2>
          <a href="/revenue" className="text-sm font-medium" style={{ color: BLUE }}>
            View all →
          </a>
        </div>
        <DataTable columns={clientColumns} data={activeClients} />
      </div>
    </div>
  );
}
