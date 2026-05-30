"use client";

import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataSourceBadge } from "@/components/shared/data-source-badge";
import { mockRevenueData } from "@/lib/mock-data/revenue";
import { CURRENT_MRR, ARR, ACTIVE_CLIENT_COUNT, ARPA, ACTIVE_CUSTOMERS } from "@/lib/mock-data/connected";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";
import { DollarSign, TrendingUp, Users, TrendingDown, Percent } from "lucide-react";

const BLUE = "#0358F1";

// Compute revenue by partner from CUSTOMERS data
const partnerRevMap: Record<string, number> = {};
for (const c of ACTIVE_CUSTOMERS) {
  partnerRevMap[c.partner] = (partnerRevMap[c.partner] ?? 0) + c.mrr;
}
const revenueByPartner = Object.entries(partnerRevMap)
  .map(([name, mrr]) => ({ name, mrr }))
  .sort((a, b) => b.mrr - a.mrr);

const RISK_BADGE: Record<string, string> = {
  low:     'bg-green-100 text-green-700',
  medium:  'bg-amber-100 text-amber-700',
  high:    'bg-red-100 text-red-700',
  churned: 'bg-gray-100 text-gray-500',
};

interface ClientRow {
  id: string;
  name: string;
  country: string;
  mrr: number;
  status: string;
  startDate: string;
  source: string;
  partnerOwner: string;
  riskLevel?: string;
}

const clientColumns: Column<ClientRow>[] = [
  { header: "Client", accessor: "name", cell: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
  { header: "Country", accessor: "country" },
  { header: "MRR", accessor: "mrr", cell: (r) => <span className="font-semibold">€{r.mrr}</span> },
  { header: "Status", accessor: "status", cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Risk", accessor: "riskLevel", cell: (r) => (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${RISK_BADGE[r.riskLevel ?? 'low'] ?? ''}`}>
      {r.riskLevel ?? 'low'}
    </span>
  )},
  { header: "Start Date", accessor: "startDate" },
  { header: "Source", accessor: "source" },
  { header: "Owner", accessor: "partnerOwner" },
];

// Enrich revenue clients with riskLevel from CUSTOMERS
const enrichedClients: ClientRow[] = mockRevenueData.clients.map(c => {
  const riskMap: Record<string, string> = {
    'De Groenhoek': 'low', 'Vega Kitchen Amsterdam': 'low', 'El Vergel Madrid': 'low',
    'Roots & Co': 'low', 'Green Elephant': 'medium', 'La Floresta Barcelona': 'low',
    'Plantiful Haarlem': 'low', 'Bio Bistro Utrecht': 'low', 'Madre Tierra Bogotá': 'medium',
    'Naturverde Milan': 'low', 'The Sprout Rotterdam': 'low', 'Vegano Valencia': 'churned',
    'Conscious Kitchen Den Haag': 'low', 'Pura Vida Medellín': 'medium', 'Qubico Demo Client': 'medium',
  };
  return { ...c, riskLevel: riskMap[c.name] ?? 'low' };
});

const COLORS = [BLUE, "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

export default function RevenuePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Revenue Intelligence</h1>
        <DataSourceBadge status="mock" />
      </div>

      {/* KPIs — 6 cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard title="MRR" value={`€${CURRENT_MRR.toLocaleString()}`} trend={mockRevenueData.growth} trendLabel="MoM" icon={<DollarSign className="h-5 w-5" />} />
        <KpiCard title="ARR" value={`€${ARR.toLocaleString()}`} subvalue="projected" icon={<TrendingUp className="h-5 w-5" />} />
        <KpiCard title="Active Clients" value={ACTIVE_CLIENT_COUNT} trend={8.3} trendLabel="vs last month" icon={<Users className="h-5 w-5" />} />
        <KpiCard title="ARPA" value={`€${ARPA}`} subvalue="avg revenue/client" icon={<Percent className="h-5 w-5" />} />
        <KpiCard title="NRR" value="~102%" subvalue="net revenue retention" icon={<TrendingUp className="h-5 w-5" />} />
        <KpiCard title="GRR" value="~98%" subvalue="gross revenue retention" icon={<TrendingDown className="h-5 w-5" />} />
      </div>

      {/* MRR Waterfall Row */}
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
        {[
          { label: "Previous MRR", value: `€${(mockRevenueData.currentMRR - mockRevenueData.newMRR - mockRevenueData.expansionMRR + mockRevenueData.churnedMRR).toLocaleString()}`, color: "text-gray-900" },
          { label: "+ New MRR", value: `+€${mockRevenueData.newMRR}`, color: "text-green-600" },
          { label: "+ Expansion MRR", value: `+€${mockRevenueData.expansionMRR}`, color: "text-blue-600" },
          { label: "- Churned MRR", value: `-€${mockRevenueData.churnedMRR}`, color: "text-red-500" },
          { label: "= Net MRR", value: `€${CURRENT_MRR.toLocaleString()}`, color: "text-gray-900" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="MRR Trend" description="Monthly recurring revenue — last 12 months">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={mockRevenueData.mrrHistory} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="mrrGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BLUE} stopOpacity={0.12} />
                    <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => v.split(" ")[0]} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`€${Number(v).toLocaleString()}`, "MRR"]} />
                <Area type="monotone" dataKey="mrr" stroke={BLUE} strokeWidth={2.5} fill="url(#mrrGrad2)" dot={false} activeDot={{ r: 4, fill: BLUE }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="Revenue by Country" description="MRR split by market">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={mockRevenueData.revenueByCountry}
                cx="50%"
                cy="45%"
                outerRadius={80}
                dataKey="mrr"
                nameKey="country"
                label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {mockRevenueData.revenueByCountry.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`€${v}`, "MRR"]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Revenue by Partner */}
      <ChartCard title="Revenue by Partner Owner" description="MRR attributed to each partner (from CUSTOMERS data)">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenueByPartner} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`€${v}`, "MRR"]} />
            <Bar dataKey="mrr" fill={BLUE} radius={[4, 4, 0, 0]}>
              {revenueByPartner.map((_, i) => (
                <Cell key={i} fill={`rgba(3,88,241,${1 - i * 0.1})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Revenue by Segment */}
      <ChartCard title="Revenue by Segment" description="MRR broken down by customer segment">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={mockRevenueData.revenueBySegment} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="segment" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`€${v}`, "MRR"]} />
            <Bar dataKey="mrr" fill={BLUE} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Clients Table */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">All Clients</h2>
          <DataSourceBadge status="mock" />
        </div>
        <DataTable columns={clientColumns} data={enrichedClients} />
      </div>
    </div>
  );
}
