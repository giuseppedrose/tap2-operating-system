"use client";

import { useState } from "react";
import { Mail, Calendar, DollarSign, BarChart2, MessageSquare, Send } from "lucide-react";
import { getCampaignSummary } from "@/lib/operating-model/calculations";
import { SEED_CAMPAIGNS } from "@/lib/operating-model/seed";
import { ExecutiveInsight } from "@/components/shared/executive-insight";
import { DataStatusBadge } from "@/components/shared/data-status-badge";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { HorizontalRankChart } from "@/components/charts/HorizontalRankChart";
import { TAP2_COLORS } from "@/components/charts/chart-theme";

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Paused: "bg-amber-100 text-amber-700",
  Completed: "bg-gray-100 text-gray-600",
  Draft: "bg-blue-100 text-blue-700",
};

interface EngagementRow {
  name: string;
  open: number;
  reply: number;
  positive: number;
}

function EngagementRatesTable({ rows }: { rows: EngagementRow[] }) {
  const metrics = [
    { key: "open" as const, label: "Open rate", color: TAP2_COLORS.primary },
    { key: "reply" as const, label: "Reply rate", color: TAP2_COLORS.success },
    { key: "positive" as const, label: "Positive reply", color: TAP2_COLORS.warning },
  ];

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        {metrics.map(m => (
          <div key={m.key} className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: m.color }} />
            <span className="text-xs text-gray-500">{m.label}</span>
          </div>
        ))}
      </div>
      {/* Rows */}
      <div className="space-y-4">
        {rows.map(row => (
          <div key={row.name} className="space-y-1.5">
            <p className="text-xs font-medium text-gray-700">{row.name}</p>
            <div className="grid grid-cols-3 gap-2">
              {metrics.map(m => (
                <div key={m.key}>
                  <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                    <span>{m.label}</span>
                    <span className="font-medium text-gray-600">{row[m.key]}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, row[m.key])}%`, background: m.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const summary = getCampaignSummary();

  const engagementData: EngagementRow[] = SEED_CAMPAIGNS.map(c => ({
    name: c.campaign_name.replace(" Q4 2025", "").replace(" Q1 2026", ""),
    open: c.open_rate,
    reply: c.reply_rate,
    positive: c.positive_reply_rate,
  }));

  const revenueRankData = [...SEED_CAMPAIGNS]
    .sort((a, b) => b.closed_mrr - a.closed_mrr)
    .map(c => ({
      label: c.campaign_name.replace(" Q4 2025", "").replace(" Q1 2026", ""),
      value: c.closed_mrr,
      formatted: `€${c.closed_mrr}`,
    }));

  const bestCampaign = [...SEED_CAMPAIGNS].sort((a, b) => b.closed_mrr - a.closed_mrr)[0];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Campaign Intelligence</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cold email performance and revenue attribution</p>
        </div>
        <DataStatusBadge status="seed" />
      </div>

      {/* Executive Insight */}
      <ExecutiveInsight
        insight={`${bestCampaign?.campaign_name ?? "—"} is the top campaign with €${bestCampaign?.closed_mrr ?? 0}/mo MRR and ${bestCampaign?.meetings_booked ?? 0} meetings booked. Avg open rate across campaigns: ${summary.avgOpenRate}%.`}
        nextStep="Replicate the messaging and targeting of top campaigns in new markets."
      />

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Campaigns", value: String(summary.totalCampaigns), icon: BarChart2, color: "text-blue-600" },
          { label: "Emails Sent", value: summary.totalEmailsSent.toLocaleString(), icon: Send, color: "text-gray-600" },
          { label: "Avg Open Rate", value: `${summary.avgOpenRate}%`, icon: Mail, color: "text-green-600" },
          { label: "Avg Reply Rate", value: `${summary.avgReplyRate}%`, icon: MessageSquare, color: "text-purple-600" },
          { label: "Meetings Booked", value: String(summary.totalMeetingsBooked), icon: Calendar, color: "text-amber-600" },
          { label: "Closed MRR", value: `€${summary.totalClosedMRR}`, icon: DollarSign, color: "text-green-700" },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              <span className="text-xs text-gray-500">{kpi.label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Attribution Path */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-900 mb-4">Attribution Path</p>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "Cold Email", sub: `${summary.totalEmailsSent.toLocaleString()} sent`, color: "bg-blue-50 border-blue-200 text-blue-700" },
            { label: "Positive Reply", sub: `${summary.avgPositiveReplyRate}% avg`, color: "bg-blue-50 border-blue-200 text-blue-700" },
            { label: "Meeting", sub: `${summary.totalMeetingsBooked} booked`, color: "bg-blue-50 border-blue-200 text-blue-700" },
            { label: "Deal Created", sub: `${summary.totalDealsCreated} deals`, color: "bg-blue-50 border-blue-200 text-blue-700" },
            { label: "Stripe MRR", sub: `€${summary.totalClosedMRR}/mo`, color: "bg-green-50 border-green-200 text-green-700" },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className={`rounded-lg border px-3 py-2 text-center min-w-[100px] ${step.color}`}>
                <p className="text-xs font-semibold">{step.label}</p>
                <p className="text-xs opacity-70 mt-0.5">{step.sub}</p>
              </div>
              {i < arr.length - 1 && (
                <span className="text-gray-400 font-bold text-sm">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartContainer
          title="Engagement Rates by Campaign"
          question="Which campaign generates the highest engagement quality?"
          status="seed"
        >
          <EngagementRatesTable rows={engagementData} />
        </ChartContainer>

        <ChartContainer
          title="Closed MRR by Campaign"
          question="Which campaign is generating revenue efficiently?"
          status="seed"
        >
          <HorizontalRankChart data={revenueRankData} />
        </ChartContainer>
      </div>

      {/* Campaign Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Campaign Detail</p>
          <DataStatusBadge status="seed" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["Name", "Market", "Owner", "Status", "Sent", "Open%", "Reply%", "+Reply%", "Meetings", "Deals", "Pipeline", "Closed MRR", "Cost/Meeting", "Quality", "Insights"].map(h => (
                  <th key={h} className="px-3 py-2 font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SEED_CAMPAIGNS.map(c => (
                <>
                  <tr key={c.campaign_id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">{c.campaign_name}</td>
                    <td className="px-3 py-2 text-gray-500">{c.market}</td>
                    <td className="px-3 py-2 text-gray-500">{c.owner}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{c.emails_sent.toLocaleString()}</td>
                    <td className="px-3 py-2 text-gray-700">{c.open_rate}%</td>
                    <td className="px-3 py-2 text-gray-700">{c.reply_rate}%</td>
                    <td className="px-3 py-2 text-gray-700">{c.positive_reply_rate}%</td>
                    <td className="px-3 py-2 text-gray-700">{c.meetings_booked}</td>
                    <td className="px-3 py-2 text-gray-700">{c.deals_created}</td>
                    <td className="px-3 py-2 text-gray-700">€{c.pipeline_generated.toLocaleString()}</td>
                    <td className="px-3 py-2 font-semibold text-gray-900">€{c.closed_mrr}</td>
                    <td className="px-3 py-2 text-gray-700">{c.cost_per_meeting != null ? `€${c.cost_per_meeting}` : "—"}</td>
                    <td className="px-3 py-2 text-gray-700">{c.quality_score}</td>
                    <td className="px-3 py-2">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => setExpanded(expanded === c.campaign_id ? null : c.campaign_id)}
                      >
                        {expanded === c.campaign_id ? "Hide" : "Show"}
                      </button>
                    </td>
                  </tr>
                  {expanded === c.campaign_id && (
                    <tr key={`${c.campaign_id}-insights`} className="bg-blue-50 border-t border-blue-100">
                      <td colSpan={15} className="px-5 py-3">
                        <ul className="space-y-1">
                          {c.insights.map((insight, i) => (
                            <li key={i} className="text-xs text-blue-800">• {insight}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
