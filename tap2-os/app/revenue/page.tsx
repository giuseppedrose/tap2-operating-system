"use client";

import { useState, useEffect } from "react";
import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { mockRevenueData } from "@/lib/mock-data/revenue";
import { fetchCustomers, type DbCustomer } from "@/lib/supabase/queries";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie,
} from "recharts";
import { DollarSign, TrendingUp, Users, TrendingDown } from "lucide-react";

const BLUE = "#0358F1";

interface Client {
  id: string;
  name: string;
  country: string;
  mrr: number;
  status: string;
  startDate: string;
  source: string;
  partnerOwner: string;
}

const clientColumns: Column<Client>[] = [
  { header: "Client", accessor: "name", cell: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
  { header: "Country", accessor: "country" },
  { header: "MRR", accessor: "mrr", cell: (r) => <span className="font-semibold">€{r.mrr}</span> },
  { header: "Status", accessor: "status", cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Start Date", accessor: "startDate" },
  { header: "Source", accessor: "source" },
  { header: "Owner", accessor: "partnerOwner" },
];

const COLORS = [BLUE, "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

export default function RevenuePage() {
  const [liveCustomers, setLiveCustomers] = useState<DbCustomer[] | null>(null);

  useEffect(() => {
    fetchCustomers().then(data => { if (data) setLiveCustomers(data) });
  }, []);

  const clientsData: Client[] = liveCustomers
    ? liveCustomers.map(c => ({
        id: c.id,
        name: c.name,
        country: c.country ?? '',
        mrr: Number(c.current_mrr),
        status: c.status,
        startDate: c.start_date ?? '',
        source: c.source ?? '',
        partnerOwner: c.partner_owner ?? '',
      }))
    : mockRevenueData.clients;

  const activeClients = liveCustomers
    ? liveCustomers.filter(c => c.status === 'active').length
    : mockRevenueData.activeClients;

  const totalMrr = liveCustomers
    ? liveCustomers.filter(c => c.status === 'active').reduce((s, c) => s + Number(c.current_mrr), 0)
    : mockRevenueData.currentMRR;

  const arr = totalMrr * 12;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="MRR" value={`€${totalMrr.toLocaleString()}`} trend={mockRevenueData.growth} trendLabel="MoM" icon={<DollarSign className="h-5 w-5" />} />
        <KpiCard title="ARR" value={`€${arr.toLocaleString()}`} subvalue="projected" icon={<TrendingUp className="h-5 w-5" />} />
        <KpiCard title="Active Clients" value={activeClients} trend={8.3} trendLabel="vs last month" icon={<Users className="h-5 w-5" />} />
        <KpiCard title="Monthly Churn" value={`${mockRevenueData.churn}%`} trend={-0.3} trendLabel="vs last month" icon={<TrendingDown className="h-5 w-5" />} />
      </div>

      {/* MRR Waterfall Row */}
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
        {[
          { label: "Previous MRR", value: `€${(mockRevenueData.currentMRR - mockRevenueData.newMRR - mockRevenueData.expansionMRR + mockRevenueData.churnedMRR).toLocaleString()}`, color: "text-gray-900" },
          { label: "+ New MRR", value: `+€${mockRevenueData.newMRR}`, color: "text-green-600" },
          { label: "+ Expansion MRR", value: `+€${mockRevenueData.expansionMRR}`, color: "text-blue-600" },
          { label: "- Churned MRR", value: `-€${mockRevenueData.churnedMRR}`, color: "text-red-500" },
          { label: "= Net MRR", value: `€${totalMrr.toLocaleString()}`, color: "text-gray-900" },
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
        <h2 className="mb-3 text-base font-semibold text-gray-900">All Clients</h2>
        <DataTable columns={clientColumns} data={clientsData} />
      </div>
    </div>
  );
}
