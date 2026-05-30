"use client";

import { useState } from "react";
import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { mockGtmData, gtmSummary, channelCategories, type GtmChannelMetrics } from "@/lib/mock-data/gtm";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis,
} from "recharts";
import { Megaphone, Users, DollarSign, Target } from "lucide-react";
import { InsightCard } from "@/components/shared/insight-card";

const BLUE = "#0358F1";

const channelColumns: Column<GtmChannelMetrics>[] = [
  { header: "Channel", accessor: "name", cell: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
  { header: "Category", accessor: "category", cell: (r) => <Badge variant="neutral">{r.category}</Badge> },
  { header: "Leads", accessor: "leads" },
  { header: "Meetings", accessor: "meetings" },
  { header: "Demos", accessor: "demos" },
  { header: "Clients", accessor: "clients", cell: (r) => <span className="font-semibold text-green-600">{r.clients}</span> },
  { header: "Pipeline", accessor: "pipeline", cell: (r) => <span className="font-semibold">€{r.pipeline.toLocaleString()}</span> },
  { header: "MRR Closed", accessor: "closedMrr", cell: (r) => <span className="font-semibold">€{r.closedMrr}</span> },
  { header: "Conv. Rate", accessor: "conversionRate", cell: (r) => (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-gray-100">
        <div className="h-1.5 rounded-full" style={{ width: `${Math.min(r.conversionRate * 4, 100)}%`, background: BLUE }} />
      </div>
      <span className="text-xs text-gray-600">{r.conversionRate}%</span>
    </div>
  )},
  { header: "CAC", accessor: "cac", cell: (r) => <span>{r.cac ? `€${r.cac}` : "—"}</span> },
];

export default function GtmPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? mockGtmData
    : mockGtmData.filter((c) => c.category === activeCategory);

  const topByMrr = [...mockGtmData].sort((a, b) => b.closedMrr - a.closedMrr).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Total Leads" value={gtmSummary.totalLeads} icon={<Target className="h-5 w-5" />} />
        <KpiCard title="Total Meetings" value={gtmSummary.totalMeetings} icon={<Users className="h-5 w-5" />} />
        <KpiCard title="Clients Acquired" value={gtmSummary.totalClients} icon={<Megaphone className="h-5 w-5" />} />
        <KpiCard title="Total MRR" value={`€${gtmSummary.totalMrr}`} icon={<DollarSign className="h-5 w-5" />} />
      </div>

      {/* Channel Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="MRR by Channel" description="Revenue closed per GTM channel">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topByMrr} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={100} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`€${v}`, "MRR"]} />
              <Bar dataKey="closedMrr" fill={BLUE} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Leads vs Clients by Channel" description="Lead volume and conversion per channel">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filtered} margin={{ top: 4, right: 4, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Bar dataKey="leads" fill="#e0e7ff" radius={[4, 4, 0, 0]} name="Leads" />
              <Bar dataKey="clients" fill={BLUE} radius={[4, 4, 0, 0]} name="Clients" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Filter + Table */}
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {channelCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={activeCategory === cat ? { background: BLUE } : undefined}
            >
              {cat}
            </button>
          ))}
        </div>
        <DataTable columns={channelColumns} data={filtered} />
      </div>

      {/* GTM Conclusions */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">GTM Conclusions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InsightCard type="positive" title="Best by Pipeline: Horecava" description="Top pipeline-generating channel. €14,800 pipeline attributed. 3 clients won." />
          <InsightCard type="positive" title="Best by MRR Closed: Cold Email" description="Highest MRR closed per lead. Carlo and Dorian driving results. €534 MRR closed." />
          <InsightCard type="warning" title="Needs review: LinkedIn" description="9.6% reply rate but only 6 meetings booked. Booking process may be breaking conversion." />
          <InsightCard type="action" title="Recommendation: Double down on Horecava + Cold Email" description="These two channels produce the best pipeline and MRR/lead. Increase investment in Q1 2026." />
        </div>
      </div>
    </div>
  );
}
