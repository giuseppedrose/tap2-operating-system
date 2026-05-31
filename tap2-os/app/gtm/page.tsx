"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, Calendar, DollarSign, Star } from "lucide-react";
import { calcGTMSources } from "@/lib/operating-model/calculations";
import { ExecutiveInsight } from "@/components/shared/executive-insight";
import { DataStatusBadge } from "@/components/shared/data-status-badge";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { TAP2_COLORS, axisStyle, tooltipStyle, gridStyle } from "@/components/charts/chart-theme";
import { InsightCard } from "@/components/shared/insight-card";

const REC_COLORS: Record<string, string> = {
  "Double Down": "bg-blue-100 text-blue-700 border border-blue-200",
  "Test More": "bg-green-100 text-green-700 border border-green-200",
  "Improve Follow-up": "bg-amber-100 text-amber-700 border border-amber-200",
  "Pause": "bg-red-100 text-red-700 border border-red-200",
  "Needs Data": "bg-gray-100 text-gray-600 border border-gray-200",
};

export default function GTMPage() {
  const sources = calcGTMSources();

  const totalLeads = sources.reduce((s, x) => s + x.leads, 0);
  const totalMeetings = sources.reduce((s, x) => s + x.meetings, 0);
  const totalClosedMRR = sources.reduce((s, x) => s + x.closed_mrr, 0);
  const bestSource = sources[0]?.source ?? "—";

  const mrrChartData = [...sources]
    .sort((a, b) => b.closed_mrr - a.closed_mrr)
    .map(s => ({ source: s.source, mrr: s.closed_mrr }));

  const meetingRateData = sources
    .filter(s => s.leads >= 2)
    .map(s => ({ source: s.source, rate: s.lead_to_meeting_rate }))
    .sort((a, b) => b.rate - a.rate);

  const bestByMRR = sources[0];
  const bestByMeetingRate = [...sources].sort((a, b) => b.lead_to_meeting_rate - a.lead_to_meeting_rate)[0];
  const pauseSources = sources.filter(s => s.recommendation === "Pause");

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">GTM Source Attribution</h1>
          <p className="text-sm text-gray-500 mt-0.5">Which sources are generating closed revenue?</p>
        </div>
        <DataStatusBadge status="seed" />
      </div>

      {/* Executive Insight */}
      <ExecutiveInsight
        insight={`${bestSource} is the top revenue source with €${bestByMRR?.closed_mrr ?? 0}/mo MRR closed. ${pauseSources.length > 0 ? `${pauseSources.map(s => s.source).join(", ")} ${pauseSources.length === 1 ? "has" : "have"} generated no revenue with sufficient volume — consider pausing.` : "All active sources have shown some revenue signal."}`}
        nextStep="Double down on top performing sources before scaling spend on unproven ones."
      />

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Leads", value: String(totalLeads), icon: Users, color: "text-blue-600" },
          { label: "Total Meetings", value: String(totalMeetings), icon: Calendar, color: "text-green-600" },
          { label: "Closed MRR", value: `€${totalClosedMRR}`, icon: DollarSign, color: "text-purple-600" },
          { label: "Best Source", value: bestSource, icon: Star, color: "text-amber-600" },
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

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartContainer
          title="Closed MRR by Source"
          question="Which acquisition source creates the most closed revenue?"
          status="seed"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mrrChartData} margin={{ top: 4, right: 8, left: 0, bottom: 44 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="source" {...axisStyle} angle={-30} textAnchor="end" interval={0} />
              <YAxis {...axisStyle} tickFormatter={(v: unknown) => `€${String(v)}`} />
              <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`€${String(v)}`, "Closed MRR"]} />
              <Bar dataKey="mrr" fill={TAP2_COLORS.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer
          title="Lead-to-Meeting Rate by Source"
          question="Which source has the highest meeting efficiency?"
          status="seed"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={meetingRateData} margin={{ top: 4, right: 8, left: 0, bottom: 44 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="source" {...axisStyle} angle={-30} textAnchor="end" interval={0} />
              <YAxis {...axisStyle} tickFormatter={(v: unknown) => `${String(v)}%`} />
              <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`${String(v)}%`, "L→Meeting Rate"]} />
              <Bar dataKey="rate" fill={TAP2_COLORS.secondary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Attribution Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Attribution Summary</p>
          <DataStatusBadge status="seed" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["Source", "Category", "Leads", "Meetings", "Close Rate", "Closed MRR", "Wtd Pipeline", "Quality", "Recommendation"].map(h => (
                  <th key={h} className="px-3 py-2 font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sources.map(s => (
                <tr key={s.source} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">{s.source}</td>
                  <td className="px-3 py-2 text-gray-500">{s.category}</td>
                  <td className="px-3 py-2 text-gray-700">{s.leads}</td>
                  <td className="px-3 py-2 text-gray-700">{s.meetings}</td>
                  <td className="px-3 py-2 text-gray-700">{s.overall_close_rate}%</td>
                  <td className="px-3 py-2 font-semibold text-gray-900">€{s.closed_mrr}</td>
                  <td className="px-3 py-2 text-gray-700">€{s.weighted_pipeline}</td>
                  <td className="px-3 py-2 text-gray-700">{s.quality_score}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${REC_COLORS[s.recommendation] ?? REC_COLORS["Needs Data"]}`}>
                      {s.recommendation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GTM Conclusions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">GTM Conclusions</h2>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {bestByMRR && (
            <InsightCard
              type="positive"
              title={`Top Revenue Source: ${bestByMRR.source}`}
              description={`€${bestByMRR.closed_mrr}/mo MRR closed. Quality score ${bestByMRR.quality_score}. Recommendation: ${bestByMRR.recommendation}.`}
            />
          )}
          {bestByMeetingRate && (
            <InsightCard
              type="info"
              title={`Best Meeting Efficiency: ${bestByMeetingRate.source}`}
              description={`${bestByMeetingRate.lead_to_meeting_rate}% lead-to-meeting rate. ${bestByMeetingRate.meetings} meetings from ${bestByMeetingRate.leads} leads.`}
            />
          )}
          {pauseSources.length > 0 ? (
            <InsightCard
              type="warning"
              title={`Consider Pausing: ${pauseSources.map(s => s.source).join(", ")}`}
              description={`${pauseSources.length === 1 ? "This source has" : "These sources have"} sufficient volume but no closed revenue. Reassess ICP or messaging.`}
            />
          ) : (
            <InsightCard
              type="action"
              title="All Sources Show Revenue Signal"
              description="No sources are recommended for pause. Focus on scaling the top performers."
            />
          )}
        </div>
      </div>
    </div>
  );
}
