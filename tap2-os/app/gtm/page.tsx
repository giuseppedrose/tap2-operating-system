"use client";

import { calcGTMSources } from "@/lib/operating-model/calculations";
import { OperatingBrief } from "@/components/operating/OperatingBrief";
import { InsightCard } from "@/components/shared/insight-card";
import { ChartFrame } from "@/components/charts/ChartFrame";
import { HorizontalBarRankChart } from "@/components/charts/HorizontalBarRankChart";
import { ScatterQuadrantChart } from "@/components/charts/ScatterQuadrantChart";
import { DataStatusBadge } from "@/components/shared/data-status-badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { axisStyle, tooltipStyle } from "@/components/charts/chart-theme";
import type { GTMRecommendation } from "@/lib/operating-model/types";

const sources = calcGTMSources().filter(s => s.leads > 0);

const bestByMRR = [...sources].sort((a, b) => b.closed_mrr - a.closed_mrr)[0];
const bestByCloseRate = [...sources].filter(s => s.closed_won >= 2).sort((a, b) => b.overall_close_rate - a.overall_close_rate)[0];
const doubleDown = sources.filter(s => s.recommendation === "Double Down");
const pause = sources.filter(s => s.recommendation === "Pause");
const needsData = sources.filter(s => s.recommendation === "Needs Data");

const mrrRankData = sources
  .filter(s => s.closed_mrr > 0)
  .sort((a, b) => b.closed_mrr - a.closed_mrr)
  .map(s => ({ label: s.source, value: s.closed_mrr, formatted: `€${s.closed_mrr}/mo` }));

const meetingRankData = sources
  .filter(s => s.meetings > 0)
  .sort((a, b) => b.lead_to_meeting_rate - a.lead_to_meeting_rate)
  .map(s => ({ label: s.source, value: s.lead_to_meeting_rate, formatted: `${s.lead_to_meeting_rate}%` }));

// Quadrant: quality score vs lead volume
const quadrantData = sources
  .filter(s => s.leads > 0)
  .map(s => ({
    name: s.source,
    x: s.leads,
    y: s.quality_score,
    color: s.recommendation === "Double Down" ? "#0358F1" : s.recommendation === "Pause" ? "#ef4444" : "#94a3b8",
  }));

// Source conversion funnel — top 6 by closed_mrr
const top6Sources = [...sources]
  .sort((a, b) => b.closed_mrr - a.closed_mrr)
  .slice(0, 6)
  .map(s => ({
    source: s.source.slice(0, 12),
    leads: s.leads,
    meetings: s.meetings,
    wins: s.closed_won,
  }));

const REC_CONFIG: Record<GTMRecommendation, { bg: string; text: string; border: string }> = {
  "Double Down": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "Test More":   { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "Improve Follow-up": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "Pause":       { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  "Needs Data":  { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-200" },
};

export default function GTMPage() {
  return (
    <div className="space-y-5">
      <OperatingBrief
        status="behind"
        headline={`${doubleDown.length} channel${doubleDown.length !== 1 ? "s" : ""} producing qualified revenue. Best: ${bestByMRR?.source ?? "—"} (€${bestByMRR?.closed_mrr ?? 0}/mo). Identify repeatable GTM before scaling spend.`}
        signals={[
          `${sources.filter(s => s.closed_mrr > 0).length} of ${sources.length} channels have closed revenue`,
          `Best close rate: ${bestByCloseRate?.source ?? "—"} at ${bestByCloseRate?.overall_close_rate ?? 0}%`,
          `${needsData.length} channel${needsData.length !== 1 ? "s" : ""} need more data to evaluate`,
        ]}
        dataLabel="Seed data — HubSpot + Instantly Pending"
      />

      {/* GTM conclusions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {bestByMRR && (
          <InsightCard
            type="positive"
            title={`Best by revenue: ${bestByMRR.source}`}
            description={`€${bestByMRR.closed_mrr}/mo closed MRR. ${bestByMRR.closed_won} customers. ${bestByMRR.overall_close_rate}% close rate. Quality score: ${bestByMRR.quality_score}.`}
          />
        )}
        {bestByCloseRate && bestByCloseRate.source !== bestByMRR?.source && (
          <InsightCard
            type="positive"
            title={`Best close rate: ${bestByCloseRate.source}`}
            description={`${bestByCloseRate.overall_close_rate}% overall close rate. Low volume but high quality signal. Scale this channel.`}
          />
        )}
        {doubleDown.length > 0 && (
          <InsightCard
            type="action"
            title={`Double down: ${doubleDown.map(s => s.source).join(", ")}`}
            description={`${doubleDown.length} channel${doubleDown.length !== 1 ? "s" : ""} show strong revenue and quality. Increase activity and investment here.`}
          />
        )}
        {pause.length > 0 && (
          <InsightCard
            type="warning"
            title={`Consider pausing: ${pause.map(s => s.source).join(", ")}`}
            description={`Volume without closes. Reassess ICP targeting or messaging before adding spend.`}
          />
        )}
      </div>

      {/* ── Section A: Quality vs Volume Quadrant ── */}
      <ChartFrame
        title="Channel Quality vs Volume Analysis"
        question="Which channels are high-volume AND high-quality? Which are noisy?"
        source="HubSpot + Instantly"
        sourceStatus="seed"
        footnote="Quality score = composite of close rate, ARPA, deal quality, and pipeline generated per lead. Quadrant midpoint = median. Blue = Double Down, Red = Pause, Gray = Evaluate."
      >
        <ScatterQuadrantChart
          data={quadrantData}
          xLabel="Lead Volume"
          yLabel="Quality Score"
          xFormatter={v => String(v)}
          yFormatter={v => `${v}`}
          quadrantLabels={{ tl: "High Quality Low Volume", tr: "Scale This", bl: "Noisy", br: "Needs Improvement" }}
          height={260}
        />
      </ChartFrame>

      {/* ── Section B: Source Conversion Funnel ── */}
      <ChartFrame
        title="Source-to-Win Funnel"
        question="Where in the sales funnel does each channel drop off?"
        source="HubSpot + Instantly"
        sourceStatus="seed"
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={top6Sources}
            layout="vertical"
            margin={{ top: 4, right: 24, bottom: 4, left: 0 }}
          >
            <XAxis type="number" {...axisStyle} />
            <YAxis type="category" dataKey="source" width={110} {...axisStyle} />
            <Tooltip
              {...tooltipStyle}
              formatter={(v: unknown) => [String(v), ""]}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
            <Bar dataKey="leads" name="Leads" fill="#e2e8f0" barSize={8} radius={[0, 3, 3, 0]} />
            <Bar dataKey="meetings" name="Meetings" fill="#94a3b8" barSize={8} radius={[0, 3, 3, 0]} />
            <Bar dataKey="wins" name="Wins" fill="#0358F1" barSize={8} radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>

      {/* ── Two ranked charts — wrapped in ChartFrame ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartFrame
          title="Closed MRR by Source"
          question="Which channel is creating revenue?"
          source="HubSpot"
          sourceStatus="seed"
        >
          <HorizontalBarRankChart
            data={mrrRankData}
            valueFormatter={v => `€${v}`}
            height={mrrRankData.length * 36 + 16}
          />
        </ChartFrame>

        <ChartFrame
          title="Lead → Meeting Rate by Source"
          question="Which channel has the highest meeting efficiency?"
          source="HubSpot"
          sourceStatus="seed"
        >
          <HorizontalBarRankChart
            data={meetingRankData}
            valueFormatter={v => `${v}%`}
            height={meetingRankData.length * 36 + 16}
          />
        </ChartFrame>
      </div>

      {/* Full attribution table */}
      <div className="border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-900">Channel Attribution — Full View</p>
            <p className="text-xs text-gray-400 mt-0.5">Seed data — connect HubSpot + Instantly for live attribution</p>
          </div>
          <DataStatusBadge status="seed" integration="HubSpot + Instantly Pending" />
        </div>
        <div className="overflow-x-auto">
          <table className="board-table min-w-[900px]">
            <thead>
              <tr>
                <th className="text-left">Source</th>
                <th className="text-left">Category</th>
                <th>Leads</th>
                <th>Meetings</th>
                <th>Close Rate</th>
                <th>Closed MRR</th>
                <th>Weighted Pipeline</th>
                <th>Quality</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {sources.sort((a, b) => b.closed_mrr - a.closed_mrr).map(s => {
                const rec = REC_CONFIG[s.recommendation];
                return (
                  <tr key={s.source}>
                    <td className="text-left font-semibold text-gray-900">{s.source}</td>
                    <td className="text-left text-gray-400 text-xs">{s.category}</td>
                    <td className="text-gray-600">{s.leads}</td>
                    <td className="text-gray-600">{s.meetings}</td>
                    <td className="font-medium text-gray-700">{s.overall_close_rate}%</td>
                    <td className="font-semibold text-[#0358F1]">{s.closed_mrr > 0 ? `€${s.closed_mrr}` : "—"}</td>
                    <td className="text-gray-600">{s.weighted_pipeline > 0 ? `€${s.weighted_pipeline.toLocaleString()}` : "—"}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 rounded-full bg-gray-100">
                          <div className="h-1.5 rounded-full bg-[#0358F1]" style={{ width: `${s.quality_score}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{s.quality_score}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex text-xs font-medium border rounded px-2 py-0.5 ${rec.bg} ${rec.text} ${rec.border}`}>
                        {s.recommendation}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
