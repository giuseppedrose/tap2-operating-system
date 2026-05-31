"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, TrendingDown, AlertTriangle, Clock } from "lucide-react";
import { calcLifecycleFunnel, calcGTMSources } from "@/lib/operating-model/calculations";
import { ExecutiveInsight } from "@/components/shared/executive-insight";
import { DataStatusBadge } from "@/components/shared/data-status-badge";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { TAP2_COLORS, axisStyle, tooltipStyle, gridStyle } from "@/components/charts/chart-theme";

const COHORT_DATA = [
  { month: "Dec 2025", leads: 42, meetings: 18, demos: 10, closed: 3, conv: "7.1%" },
  { month: "Jan 2026", leads: 48, meetings: 21, demos: 12, closed: 4, conv: "8.3%" },
  { month: "Feb 2026", leads: 55, meetings: 26, demos: 14, closed: 5, conv: "9.1%" },
  { month: "Mar 2026", leads: 61, meetings: 30, demos: 18, closed: 6, conv: "9.8%" },
  { month: "Apr 2026", leads: 67, meetings: 34, demos: 20, closed: 7, conv: "10.4%" },
  { month: "May 2026", leads: 72, meetings: 38, demos: 22, closed: 8, conv: "11.1%" },
];

export default function LifecyclePage() {
  const funnel = calcLifecycleFunnel();
  const sources = calcGTMSources();

  const topStage = funnel[0];
  const bottomStage = funnel[funnel.length - 1];
  const totalInFunnel = topStage?.count ?? 0;
  const totalClosed = bottomStage?.count ?? 0;
  const overallConv = totalInFunnel > 0 ? Math.round((totalClosed / totalInFunnel) * 100 * 10) / 10 : 0;

  // Find biggest drop-off
  const withDropoff = funnel.filter(s => s.dropoff_rate !== null && s.absolute_dropped !== null);
  const biggestDropoff = withDropoff.reduce((worst, s) => {
    if (!worst) return s;
    return (s.dropoff_rate ?? 0) > (worst.dropoff_rate ?? 0) ? s : worst;
  }, withDropoff[0]);

  // Slowest stage
  const withDays = funnel.filter(s => s.avg_days_in_stage > 0);
  const slowestStage = withDays.reduce((s, c) => c.avg_days_in_stage > s.avg_days_in_stage ? c : s, withDays[0] ?? funnel[0]);

  const maxCount = topStage?.count ?? 1;

  const sourceChartData = sources
    .filter(s => s.leads >= 2)
    .map(s => ({ source: s.source, rate: s.lead_to_meeting_rate }))
    .sort((a, b) => b.rate - a.rate);

  const revenueLeakage = withDropoff.reduce((s, f) => s + f.revenue_at_risk, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Lifecycle Funnel</h1>
          <p className="text-sm text-gray-500 mt-0.5">Where deals drop off and what revenue is at risk</p>
        </div>
        <DataStatusBadge status="seed" />
      </div>

      {/* Executive Insight */}
      <ExecutiveInsight
        insight={`The biggest funnel drop-off is at ${biggestDropoff?.stage ?? "—"} (${biggestDropoff?.dropoff_rate ?? 0}% drop-off, ${biggestDropoff?.absolute_dropped ?? 0} deals lost). Estimated revenue at risk across the funnel: €${revenueLeakage}/month.`}
        nextStep={`Prioritize improving conversion at the ${biggestDropoff?.stage ?? "bottleneck"} stage to recover pipeline revenue.`}
      />

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total in Funnel", value: String(totalInFunnel), icon: Users, color: "text-blue-600" },
          { label: "Top→Bottom Conv.", value: `${overallConv}%`, icon: TrendingDown, color: "text-green-600" },
          { label: "Biggest Drop-off", value: biggestDropoff?.stage ?? "—", icon: AlertTriangle, color: "text-red-500" },
          { label: "Slowest Stage (avg)", value: `${slowestStage?.avg_days_in_stage ?? 0}d`, icon: Clock, color: "text-amber-600" },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              <span className="text-xs text-gray-500">{kpi.label}</span>
            </div>
            <p className="text-lg font-bold text-gray-900 leading-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Funnel Visualization (div-based) */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-900">Funnel Stages</p>
          <DataStatusBadge status="seed" />
        </div>
        <div className="space-y-2">
          {funnel.map((stage, i) => {
            const pct = Math.round((stage.count / maxCount) * 100);
            const isWorst = biggestDropoff?.stage === stage.stage;
            return (
              <div key={stage.stage} className="flex items-center gap-3">
                <div className="w-36 text-right">
                  <span className={`text-xs font-medium ${isWorst ? "text-red-600" : "text-gray-600"}`}>
                    {stage.stage}
                  </span>
                </div>
                <div className="flex-1 relative">
                  <div className="h-7 rounded-md bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-md transition-all ${isWorst ? "bg-red-400" : i === 0 ? "bg-blue-500" : "bg-blue-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-xs text-gray-500 text-right">{stage.count} deals</div>
                {stage.dropoff_rate !== null && (
                  <div className={`w-16 text-xs text-right font-medium ${(stage.dropoff_rate ?? 0) > 30 ? "text-red-500" : "text-gray-400"}`}>
                    -{stage.dropoff_rate}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Drop-off Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Drop-off Analysis</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["From Stage", "To Stage", "Conv %", "Drop-off %", "Deals Lost", "Revenue at Risk"].map(h => (
                  <th key={h} className="px-3 py-2 font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {funnel.map((stage, i) => {
                if (stage.conversion_to_next === null) return null;
                const nextStage = funnel[i + 1];
                return (
                  <tr key={stage.stage} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-900">{stage.stage}</td>
                    <td className="px-3 py-2 text-gray-600">{nextStage?.stage ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-700">{stage.conversion_to_next}%</td>
                    <td className={`px-3 py-2 font-medium ${(stage.dropoff_rate ?? 0) > 30 ? "text-red-600" : "text-gray-600"}`}>
                      {stage.dropoff_rate}%
                    </td>
                    <td className="px-3 py-2 text-gray-700">{stage.absolute_dropped}</td>
                    <td className="px-3 py-2 font-semibold text-gray-900">€{stage.revenue_at_risk}/mo</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Source Attribution */}
      <ChartContainer
        title="Lead-to-Meeting Rate by Source"
        question="Which acquisition source converts leads to meetings most effectively?"
        status="seed"
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sourceChartData} margin={{ top: 4, right: 8, left: 0, bottom: 44 }}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="source" {...axisStyle} angle={-30} textAnchor="end" interval={0} />
            <YAxis {...axisStyle} tickFormatter={(v: unknown) => `${String(v)}%`} />
            <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`${String(v)}%`, "L→Meeting Rate"]} />
            <Bar dataKey="rate" fill={TAP2_COLORS.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Monthly Cohort Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900">Monthly Cohort Trend (improving)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["Month", "Leads", "Meetings", "Demos", "Closed", "Conv Rate"].map(h => (
                  <th key={h} className="px-3 py-2 font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COHORT_DATA.map(row => (
                <tr key={row.month} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-900">{row.month}</td>
                  <td className="px-3 py-2 text-gray-700">{row.leads}</td>
                  <td className="px-3 py-2 text-gray-700">{row.meetings}</td>
                  <td className="px-3 py-2 text-gray-700">{row.demos}</td>
                  <td className="px-3 py-2 text-gray-700">{row.closed}</td>
                  <td className="px-3 py-2 font-semibold text-green-700">{row.conv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Leakage */}
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
        <p className="text-sm font-semibold text-red-800 mb-1">Revenue Leakage Insight</p>
        <p className="text-sm text-red-700">
          The biggest leak is between <span className="font-semibold">{biggestDropoff?.stage ?? "—"}</span> and the next stage
          ({biggestDropoff?.dropoff_rate ?? 0}% drop-off, {biggestDropoff?.absolute_dropped ?? 0} deals lost).
          Estimated <span className="font-semibold">€{revenueLeakage}/month</span> at risk across all funnel stages.
        </p>
      </div>
    </div>
  );
}
