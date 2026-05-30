"use client";

import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { mockPartnersData, partnerSummary, type PartnerMetrics } from "@/lib/mock-data/partners";
import { ACTIVE_CUSTOMERS } from "@/lib/mock-data/connected";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Users, TrendingUp, DollarSign, Target } from "lucide-react";

// Compute revenue impact per partner from CUSTOMERS
const partnerRevMap: Record<string, number> = {};
for (const c of ACTIVE_CUSTOMERS) {
  partnerRevMap[c.partner] = (partnerRevMap[c.partner] ?? 0) + c.mrr;
}

// Partner scorecards mock scores for active partners
const PARTNER_SCORECARDS = [
  { name: 'Giuseppe', revenue: partnerRevMap['Giuseppe'] ?? 0, pipelineQuality: 88, activityScore: 92, conversionScore: 79 },
  { name: 'Dorian',   revenue: partnerRevMap['Dorian'] ?? 0,   pipelineQuality: 74, activityScore: 81, conversionScore: 67 },
  { name: 'Joaquin',  revenue: partnerRevMap['Joaquin'] ?? 0,  pipelineQuality: 71, activityScore: 76, conversionScore: 63 },
  { name: 'Carlo',    revenue: partnerRevMap['Carlo'] ?? 0,    pipelineQuality: 69, activityScore: 72, conversionScore: 61 },
  { name: 'Niels',    revenue: partnerRevMap['Niels'] ?? 0,    pipelineQuality: 58, activityScore: 65, conversionScore: 44 },
];

const BLUE = "#0358F1";

const partnerColumns: Column<PartnerMetrics>[] = [
  { header: "Partner", accessor: "name", cell: (r) => (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0" style={{ background: BLUE }}>
        {r.name[0]}
      </div>
      <span className="font-medium text-gray-900">{r.name}</span>
    </div>
  )},
  { header: "Leads", accessor: "leadsGenerated" },
  { header: "Meetings", accessor: "meetingsBooked" },
  { header: "Demos", accessor: "demosCompleted" },
  { header: "Trials", accessor: "trialsStarted" },
  { header: "Won", accessor: "closedWon", cell: (r) => <span className="font-semibold text-green-600">{r.closedWon}</span> },
  { header: "Lost", accessor: "closedLost", cell: (r) => <span className="font-semibold text-red-500">{r.closedLost}</span> },
  { header: "MRR Closed", accessor: "mrrClosed", cell: (r) => <span className="font-semibold">€{r.mrrClosed}</span> },
  { header: "Lead→Meeting", accessor: "conversionLeadToMeeting", cell: (r) => <span>{r.conversionLeadToMeeting}%</span> },
  { header: "Meeting→Close", accessor: "conversionMeetingToClose", cell: (r) => <span>{r.conversionMeetingToClose}%</span> },
  { header: "Avg Deal", accessor: "averageDealSize", cell: (r) => <span>€{r.averageDealSize}</span> },
];

export default function PartnersPage() {
  const topByMrr = [...mockPartnersData].sort((a, b) => b.mrrClosed - a.mrrClosed).slice(0, 5);
  const conversionData = mockPartnersData.map((p) => ({
    name: p.name,
    "Lead→Meeting": p.conversionLeadToMeeting,
    "Meeting→Close": p.conversionMeetingToClose,
  }));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Total Leads" value={partnerSummary.totalLeads} subvalue="all partners" icon={<Target className="h-5 w-5" />} />
        <KpiCard title="Total Meetings" value={partnerSummary.totalMeetings} subvalue="all partners" icon={<Users className="h-5 w-5" />} />
        <KpiCard title="Closed Won" value={partnerSummary.totalClosedWon} subvalue="total deals" icon={<TrendingUp className="h-5 w-5" />} />
        <KpiCard title="MRR Closed" value={`€${partnerSummary.totalMrrClosed}`} subvalue="all partners" icon={<DollarSign className="h-5 w-5" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="MRR Closed by Partner" description="Revenue generated per partner">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topByMrr} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`€${v}`, "MRR"]} />
              <Bar dataKey="mrrClosed" fill={BLUE} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Conversion Rates by Partner" description="Lead-to-meeting and meeting-to-close rates">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={conversionData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`${v}%`]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Lead→Meeting" fill={BLUE} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Meeting→Close" fill="#93c5fd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Pipeline per Partner */}
      <ChartCard title="Pipeline Generated by Partner" description="Total pipeline value attributed per partner">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={mockPartnersData} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={90} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`€${Number(v).toLocaleString()}`, "Pipeline"]} />
            <Bar dataKey="pipelineGenerated" fill={BLUE} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Table */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">Partner Performance Detail</h2>
        <DataTable columns={partnerColumns} data={mockPartnersData} />
      </div>

      {/* Partner Scorecards */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-gray-900">Partner Scorecards</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PARTNER_SCORECARDS.map((p) => {
            const scores = [
              { label: 'Revenue', value: Math.min(100, Math.round((p.revenue / 400) * 100)), color: '#0358F1' },
              { label: 'Pipeline', value: p.pipelineQuality, color: '#16a34a' },
              { label: 'Activity', value: p.activityScore, color: '#f59e0b' },
              { label: 'Conversion', value: p.conversionScore, color: '#7c3aed' },
            ];
            const overall = Math.round(scores.reduce((s, sc) => s + sc.value, 0) / scores.length);
            return (
              <div key={p.name} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0" style={{ background: '#0358F1' }}>
                    {p.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">Score: {overall}/100</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {scores.map(sc => (
                    <div key={sc.label}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-gray-500">{sc.label}</span>
                        <span className="font-medium text-gray-700">{sc.value}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div className="h-1.5 rounded-full" style={{ width: `${sc.value}%`, background: sc.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Revenue: €{p.revenue}/mo MRR</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
