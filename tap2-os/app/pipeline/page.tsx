"use client";

import { useState, useEffect } from "react";
import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { mockPipelineData } from "@/lib/mock-data/pipeline";
import { fetchDeals, type DbDeal } from "@/lib/supabase/queries";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { GitBranch, DollarSign, TrendingUp, CheckCircle } from "lucide-react";

const BLUE = "#0358F1";

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
  const [liveDeals, setLiveDeals] = useState<DbDeal[] | null>(null);

  useEffect(() => {
    fetchDeals().then(data => { if (data) setLiveDeals(data) });
  }, []);

  const dealsData: Deal[] = liveDeals
    ? liveDeals.map(d => ({
        id: d.id,
        companyName: d.company_name,
        dealName: d.deal_name ?? '',
        stage: d.stage,
        value: Number(d.value ?? 0),
        expectedMrr: Number(d.expected_mrr ?? 0),
        probability: Number(d.probability ?? 0),
        source: d.source ?? '',
        partnerOwner: d.partner_owner ?? '',
        closeDate: d.close_date ?? '',
      }))
    : mockPipelineData.deals;

  const activeDeals = dealsData.filter((d) => !["Closed Won", "Closed Lost"].includes(d.stage));
  const closedWon = dealsData.filter((d) => d.stage === "Closed Won").length;
  const closedLost = dealsData.filter((d) => d.stage === "Closed Lost").length;
  const winRate = closedWon + closedLost > 0
    ? Math.round((closedWon / (closedWon + closedLost)) * 100)
    : 0;

  const totalPipeline = liveDeals
    ? liveDeals.reduce((s, d) => s + Number(d.value ?? 0), 0)
    : mockPipelineData.totalPipeline;

  const weightedPipeline = liveDeals
    ? liveDeals.reduce((s, d) => s + Number(d.value ?? 0) * (Number(d.probability ?? 0) / 100), 0)
    : mockPipelineData.weightedPipeline;

  const stagesData = liveDeals
    ? Object.entries(
        liveDeals.reduce<Record<string, { count: number; value: number }>>((acc, d) => {
          const s = d.stage;
          if (!acc[s]) acc[s] = { count: 0, value: 0 };
          acc[s].count += 1;
          acc[s].value += Number(d.value ?? 0);
          return acc;
        }, {})
      ).map(([stage, { count, value }]) => ({ stage, count, value }))
    : mockPipelineData.stages;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Total Pipeline" value={`€${totalPipeline.toLocaleString()}`} subvalue="gross value" icon={<GitBranch className="h-5 w-5" />} />
        <KpiCard title="Weighted Pipeline" value={`€${Math.round(weightedPipeline).toLocaleString()}`} subvalue="prob-adjusted" icon={<DollarSign className="h-5 w-5" />} />
        <KpiCard title="Active Deals" value={activeDeals.length} subvalue="in pipeline" icon={<TrendingUp className="h-5 w-5" />} />
        <KpiCard title="Win Rate" value={`${winRate}%`} subvalue={`${closedWon} won / ${closedLost} lost`} icon={<CheckCircle className="h-5 w-5" />} />
      </div>

      {/* Funnel */}
      <ChartCard title="Pipeline by Stage" description="Deal count and value across each sales stage">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stagesData} margin={{ top: 4, right: 4, bottom: 60, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`€${Number(v).toLocaleString()}`, "Value"]} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {stagesData.map((s) => (
                  <Cell key={s.stage} fill={STAGE_COLORS[s.stage] ?? BLUE} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="space-y-2">
            {stagesData.map((stage) => (
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
        <h2 className="mb-3 text-base font-semibold text-gray-900">All Deals ({dealsData.length})</h2>
        <DataTable columns={dealColumns} data={dealsData} />
      </div>
    </div>
  );
}
