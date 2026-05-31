"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, DollarSign, TrendingUp, Star, AlertTriangle } from "lucide-react";
import { calcPartnerPerformance } from "@/lib/operating-model/calculations";
import { ExecutiveInsight } from "@/components/shared/executive-insight";
import { DataStatusBadge } from "@/components/shared/data-status-badge";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { TAP2_COLORS, axisStyle, tooltipStyle, gridStyle } from "@/components/charts/chart-theme";

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-700 bg-green-50 border-green-200",
  B: "text-blue-700 bg-blue-50 border-blue-200",
  C: "text-amber-700 bg-amber-50 border-amber-200",
  D: "text-red-700 bg-red-50 border-red-200",
  "Needs Review": "text-gray-600 bg-gray-50 border-gray-200",
};

const GRADE_BAR_COLORS: Record<string, string> = {
  A: "bg-green-500",
  B: "bg-blue-500",
  C: "bg-amber-500",
  D: "bg-red-500",
  "Needs Review": "bg-gray-400",
};

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100">
      <div
        className={`h-1.5 rounded-full ${color}`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export default function PartnersPage() {
  const partners = calcPartnerPerformance();

  const totalClosedMRR = partners.reduce((s, p) => s + p.closed_mrr, 0);
  const totalPipeline = partners.reduce((s, p) => s + p.pipeline_generated, 0);
  const avgQuality = partners.length
    ? Math.round(partners.reduce((s, p) => s + p.avg_deal_quality_score, 0) / partners.length)
    : 0;

  const gradeCounts = { A: 0, B: 0, C: 0, D: 0, "Needs Review": 0 };
  partners.forEach(p => { gradeCounts[p.grade]++; });

  const topPartner = partners[0];
  const staleAlert = partners.filter(p => p.stale_deals > 0);

  const scoreChartData = partners.map(p => ({
    name: p.name,
    activity: p.activity_score,
    revenue: p.revenue_impact_score,
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Partner Performance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Revenue and conversion by partner/owner</p>
        </div>
        <DataStatusBadge status="seed" />
      </div>

      {/* Executive Insight */}
      <ExecutiveInsight
        insight={`${topPartner?.name ?? "—"} leads with €${topPartner?.closed_mrr ?? 0}/mo MRR and a ${topPartner?.grade ?? "—"} grade. ${staleAlert.length > 0 ? `${staleAlert.map(p => p.name).join(", ")} ${staleAlert.length === 1 ? "has" : "have"} stale deals that need immediate follow-up.` : "No stale deals detected across partners."}`}
        nextStep="Focus coaching on C/D-grade partners and clean stale deals from the pipeline."
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Partners", value: String(partners.length), icon: Users, color: "text-blue-600" },
          { label: "Closed MRR", value: `€${totalClosedMRR}`, icon: DollarSign, color: "text-green-600" },
          { label: "Total Pipeline", value: `€${totalPipeline}`, icon: TrendingUp, color: "text-purple-600" },
          { label: "Avg Quality Score", value: String(avgQuality), icon: Star, color: "text-amber-600" },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              <span className="text-xs text-gray-500">{kpi.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Grade Overview */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Grade Overview:</span>
        {(["A", "B", "C", "D", "Needs Review"] as const).map(g => (
          gradeCounts[g] > 0 ? (
            <span key={g} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${GRADE_COLORS[g]}`}>
              {g}: {gradeCounts[g]}
            </span>
          ) : null
        ))}
      </div>

      {/* Stale Deal Alert */}
      {staleAlert.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Stale Deal Alert:</span>{" "}
            {staleAlert.map(p => `${p.name} (${p.stale_deals} stale)`).join(", ")} — review and follow up immediately.
          </p>
        </div>
      )}

      {/* Partner Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {partners.map(p => (
          <div key={p.name} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.grade_rationale}</p>
              </div>
              <span className={`inline-flex items-center justify-center h-10 w-10 rounded-full border-2 text-lg font-bold ${GRADE_COLORS[p.grade]}`}>
                {p.grade === "Needs Review" ? "?" : p.grade}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div>
                <p className="text-gray-400">Closed MRR</p>
                <p className="font-semibold text-gray-900">€{p.closed_mrr}</p>
              </div>
              <div>
                <p className="text-gray-400">Pipeline</p>
                <p className="font-semibold text-gray-900">€{p.pipeline_generated}</p>
              </div>
              <div>
                <p className="text-gray-400">Overall Close Rate</p>
                <p className="font-semibold text-gray-900">{p.overall_close_rate}%</p>
              </div>
              <div>
                <p className="text-gray-400">Avg Cycle</p>
                <p className="font-semibold text-gray-900">{p.avg_sales_cycle_days}d</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: "Activity", value: p.activity_score },
                { label: "Conversion", value: p.conversion_score },
                { label: "Revenue", value: p.revenue_impact_score },
                { label: "Quality", value: p.pipeline_quality_score },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                  <ProgressBar value={value} color={GRADE_BAR_COLORS[p.grade]} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Activity vs Revenue Chart */}
      <ChartContainer
        title="Activity Score vs Revenue Impact"
        question="Which partners are high activity but low revenue — and vice versa?"
        status="seed"
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={scoreChartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="name" {...axisStyle} />
            <YAxis {...axisStyle} domain={[0, 100]} />
            <Tooltip {...tooltipStyle} formatter={(v: unknown) => [String(v), ""]} />
            <Bar dataKey="activity" name="Activity Score" fill={TAP2_COLORS.primary} radius={[4, 4, 0, 0]} />
            <Bar dataKey="revenue" name="Revenue Impact" fill={TAP2_COLORS.secondary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Partner Detail Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Partner Detail</p>
          <DataStatusBadge status="seed" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["Name", "Grade", "Leads", "Meetings", "Demos", "Proposals", "Closed", "MRR", "Conv Rate", "Avg Cycle", "Best Source", "Stale"].map(h => (
                  <th key={h} className="px-3 py-2 font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {partners.map(p => (
                <tr key={p.name} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-900">{p.name}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${GRADE_COLORS[p.grade]}`}>
                      {p.grade}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-700">{p.leads_owned}</td>
                  <td className="px-3 py-2 text-gray-700">{p.meetings_booked}</td>
                  <td className="px-3 py-2 text-gray-700">{p.demos_completed}</td>
                  <td className="px-3 py-2 text-gray-700">{p.proposals_sent}</td>
                  <td className="px-3 py-2 text-gray-700">{p.closed_won}</td>
                  <td className="px-3 py-2 font-semibold text-gray-900">€{p.closed_mrr}</td>
                  <td className="px-3 py-2 text-gray-700">{p.overall_close_rate}%</td>
                  <td className="px-3 py-2 text-gray-700">{p.avg_sales_cycle_days}d</td>
                  <td className="px-3 py-2 text-gray-700">{p.best_source}</td>
                  <td className="px-3 py-2">
                    {p.stale_deals > 0 ? (
                      <span className="text-red-600 font-semibold">{p.stale_deals}</span>
                    ) : (
                      <span className="text-green-600">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
