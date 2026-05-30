"use client";

import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { mockPipelineData } from "@/lib/mock-data/pipeline";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { GitBranch, DollarSign, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { ExecutiveInsight } from "@/components/shared/executive-insight";
import { DataStatusBadge } from "@/components/shared/data-status-badge";

const BLUE = "#0358F1";

// Compute deal health
function getDealHealth(closeDate: string, stage: string): { label: string; color: string } {
  const today = new Date('2025-12-07');
  const close = new Date(closeDate);
  const daysToClose = Math.round((close.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysToClose <= 7 || stage === 'Negotiation') {
    return { label: 'urgent', color: 'bg-red-100 text-red-700' };
  }
  if (daysToClose <= 30) {
    return { label: 'stale', color: 'bg-amber-100 text-amber-700' };
  }
  return { label: 'healthy', color: 'bg-green-100 text-green-700' };
}

interface Deal {
  id: string;
  companyName: string;
  dealName: string;
  stage: string;
  value: number;
  expectedMrr: number;
  probability: number;
  source: string;
  partnerOwner: string;
  closeDate: string;
}

const dealColumns: Column<Deal>[] = [
  { header: "Company", accessor: "companyName", cell: (r) => <span className="font-medium text-gray-900">{r.companyName}</span> },
  { header: "Deal", accessor: "dealName" },
  { header: "Stage", accessor: "stage", cell: (r) => <StatusBadge status={r.stage} /> },
  { header: "Health", accessor: "stage", cell: (r) => {
    const h = getDealHealth(r.closeDate, r.stage);
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${h.color}`}>{h.label}</span>;
  }},
  { header: "Value (ARR)", accessor: "value", cell: (r) => <span className="font-semibold">€{r.value.toLocaleString()}</span> },
  { header: "MRR", accessor: "expectedMrr", cell: (r) => <span>€{r.expectedMrr}</span> },
  { header: "Prob %", accessor: "probability", cell: (r) => (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-gray-100">
        <div className="h-1.5 rounded-full" style={{ width: `${r.probability}%`, background: BLUE }} />
      </div>
      <span className="text-xs text-gray-500">{r.probability}%</span>
    </div>
  )},
  { header: "Owner", accessor: "partnerOwner" },
  { header: "Close Date", accessor: "closeDate" },
  { header: "Source", accessor: "source" },
];

const STAGE_COLORS: Record<string, string> = {
  "Lead": "#94a3b8",
  "Contacted": "#64748b",
  "Meeting Booked": "#f59e0b",
  "Demo Completed": "#f97316",
  "Proposal Sent": "#3b82f6",
  "Trial Started": "#0358F1",
  "Negotiation": "#7c3aed",
  "Closed Won": "#16a34a",
  "Closed Lost": "#dc2626",
};

export default function PipelinePage() {
  const activeDeals = mockPipelineData.deals.filter((d) => !["Closed Won", "Closed Lost"].includes(d.stage));
  const closedWon = mockPipelineData.deals.filter((d) => d.stage === "Closed Won").length;
  const closedLost = mockPipelineData.deals.filter((d) => d.stage === "Closed Lost").length;
  const winRate = Math.round((closedWon / (closedWon + closedLost + 1)) * 100);

  const avgDealSize = Math.round(
    activeDeals.reduce((s, d) => s + d.value, 0) / (activeDeals.length || 1)
  );

  return (
    <div className="space-y-6">
      <ExecutiveInsight
        insight="HubSpot connection is required to validate pipeline quality and make deal stage data live. All pipeline deals shown are structured seed data."
        nextStep="Configure HUBSPOT_ACCESS_TOKEN to activate live deal tracking."
      />
      <DataStatusBadge status="seed" integration="HubSpot Pending" />
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard title="Total Pipeline" value={`€${mockPipelineData.totalPipeline.toLocaleString()}`} subvalue="gross value" icon={<GitBranch className="h-5 w-5" />} />
        <KpiCard title="Weighted Pipeline" value={`€${mockPipelineData.weightedPipeline.toLocaleString()}`} subvalue="prob-adjusted" icon={<DollarSign className="h-5 w-5" />} />
        <KpiCard title="Active Deals" value={activeDeals.length} subvalue="in pipeline" icon={<TrendingUp className="h-5 w-5" />} />
        <KpiCard title="Win Rate" value="18%" subvalue="mock estimate" icon={<CheckCircle className="h-5 w-5" />} />
        <KpiCard title="Avg Sales Cycle" value="34 days" subvalue="lead to close" icon={<Clock className="h-5 w-5" />} />
      </div>

      {/* Avg deal size note */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Avg Deal Size (active deals)</span>
          <span className="text-lg font-bold text-gray-900">€{avgDealSize.toLocaleString()}</span>
        </div>
      </div>

      {/* Funnel */}
      <ChartCard title="Pipeline by Stage" description="Deal count and value across each sales stage">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mockPipelineData.stages} margin={{ top: 4, right: 4, bottom: 60, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`€${Number(v).toLocaleString()}`, "Value"]} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {mockPipelineData.stages.map((s) => (
                  <Cell key={s.stage} fill={STAGE_COLORS[s.stage] ?? BLUE} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="space-y-2">
            {mockPipelineData.stages.map((stage) => (
              <div key={stage.stage} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
                <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: STAGE_COLORS[stage.stage] ?? BLUE }} />
                <span className="flex-1 text-sm text-gray-700 font-medium">{stage.stage}</span>
                <span className="text-sm font-semibold text-gray-900">{stage.count} deals</span>
                <span className="text-sm text-gray-500 w-20 text-right">€{stage.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      {/* Deals Table */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">All Deals ({mockPipelineData.deals.length})</h2>
        <DataTable columns={dealColumns} data={mockPipelineData.deals} />
      </div>
    </div>
  );
}
