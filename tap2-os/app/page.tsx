"use client";

import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataSourceBadge } from "@/components/shared/data-source-badge";
import { ActionItem } from "@/components/shared/action-item";
import { mockRevenueData } from "@/lib/mock-data/revenue";
import { mockPipelineData } from "@/lib/mock-data/pipeline";
import { mockCashData } from "@/lib/mock-data/cash";
import { mockProductData } from "@/lib/mock-data/product";
import { mockForecastData } from "@/lib/mock-data/forecast";
import {
  CURRENT_MRR, ARR, ACTIVE_CLIENT_COUNT, ARPA,
  WEEKLY_CHANGES, FOUNDER_ACTIONS,
} from "@/lib/mock-data/connected";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, Users, GitBranch, Wallet, Cpu, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ExecutiveInsight } from "@/components/shared/executive-insight";
import { DataStatusBadge } from "@/components/shared/data-status-badge";

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

export default function CommandCenter() {
  const revenueChartData = mockRevenueData.mrrHistory;
  const activeClients = mockRevenueData.clients.filter((c) => c.status === "active").slice(0, 8);

  // Forecast 12-month ARR from expected scenario
  const expectedScenario = mockForecastData.scenarios.find((s) => s.name === "Expected")!;
  const forecastArr12mo = expectedScenario.months[11].expectedArr;

  const weeklyItems = [
    { label: "MRR Change", value: WEEKLY_CHANGES.mrrChange, prefix: "€", suffix: "" },
    { label: "New Customers", value: WEEKLY_CHANGES.newCustomers, prefix: "+", suffix: "" },
    { label: "Lost Customers", value: WEEKLY_CHANGES.lostCustomers, prefix: "", suffix: "" },
    { label: "Pipeline Change", value: WEEKLY_CHANGES.pipelineChange, prefix: "€", suffix: "" },
    { label: "Best Partner", value: null, label2: WEEKLY_CHANGES.bestPartner },
    { label: "Best GTM Source", value: null, label2: WEEKLY_CHANGES.bestGtmSource },
    { label: "Best Campaign", value: null, label2: WEEKLY_CHANGES.bestCampaign },
  ];

  return (
    <div className="space-y-6">
      <ExecutiveInsight
        insight="The operating system is ready. Live integrations will turn seed data into real-time intelligence. All KPIs below are structured seed data — connect Stripe, HubSpot, Rabobank, and the other integrations to activate live tracking."
        nextStep="Connect Stripe to make MRR live, then HubSpot for pipeline."
      />
      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="MRR"
          value={`€${CURRENT_MRR.toLocaleString()}`}
          trend={14.5}
          trendLabel="MoM"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KpiCard
          title="ARR"
          value={`€${ARR.toLocaleString()}`}
          subvalue="annualized"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KpiCard
          title="Active Clients"
          value={ACTIVE_CLIENT_COUNT}
          trend={8.3}
          trendLabel="MoM"
          icon={<Users className="h-5 w-5" />}
        />
        <KpiCard
          title="Weighted Pipeline"
          value={`€${mockPipelineData.weightedPipeline.toLocaleString()}`}
          subvalue="prob-adjusted"
          icon={<GitBranch className="h-5 w-5" />}
        />
        <KpiCard
          title="Bank Balance"
          value={`€${mockCashData.bankBalance.toLocaleString()}`}
          subvalue={`${mockCashData.runway} mo runway`}
          icon={<Wallet className="h-5 w-5" />}
        />
        <KpiCard
          title="Forecast ARR 12mo"
          value={`€${forecastArr12mo.toLocaleString()}`}
          subvalue="expected scenario"
          icon={<Cpu className="h-5 w-5" />}
        />
      </div>

      {/* MRR Waterfall */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">MRR Movement</h2>
          <DataSourceBadge status="mock" />
        </div>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
          {[
            { label: "Previous MRR", value: `€${(mockRevenueData.currentMRR - mockRevenueData.newMRR - mockRevenueData.expansionMRR + mockRevenueData.churnedMRR).toLocaleString()}`, color: "text-gray-900" },
            { label: "+ New MRR", value: `+€${mockRevenueData.newMRR}`, color: "text-green-600" },
            { label: "+ Expansion", value: `+€${mockRevenueData.expansionMRR}`, color: "text-blue-600" },
            { label: "- Churned", value: `-€${mockRevenueData.churnedMRR}`, color: "text-red-500" },
            { label: "= Net MRR", value: `€${CURRENT_MRR.toLocaleString()}`, color: "text-gray-900" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What Changed This Week */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">What Changed This Week?</h2>
          <DataSourceBadge status="mock" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {weeklyItems.map((item, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-2">{item.label}</p>
              {item.value !== null && item.value !== undefined ? (
                <div className="flex items-center gap-1">
                  {item.value > 0 ? (
                    <ArrowUp className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  ) : item.value < 0 ? (
                    <ArrowDown className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                  ) : (
                    <Minus className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-base font-bold ${item.value > 0 ? "text-green-600" : item.value < 0 ? "text-red-500" : "text-gray-500"}`}>
                    {item.prefix}{item.value > 0 ? "+" : ""}{item.value}{item.suffix}
                  </span>
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-900 truncate">{item.label2}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Founder Actions */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">Founder Actions</h2>
          <span className="rounded-full bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5">
            {FOUNDER_ACTIONS.filter(a => a.priority === 'high').length} urgent
          </span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          {FOUNDER_ACTIONS.map((action, i) => (
            <ActionItem
              key={i}
              type={action.type}
              priority={action.priority}
              text={action.text}
              owner={action.owner}
            />
          ))}
        </div>
      </div>

      {/* MRR Trend Chart */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">MRR Trend</h2>
          <DataSourceBadge status="mock" />
        </div>
        <ChartCard title="" description="">
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

      {/* Clients Table */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Active Clients</h2>
          <a href="/revenue" className="text-sm font-medium" style={{ color: BLUE }}>
            View all →
          </a>
        </div>
        <DataTable columns={clientColumns} data={activeClients} />
      </div>
    </div>
  );
}
