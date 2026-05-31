"use client";

import { useState } from "react";
import { ExecutiveInsight } from "@/components/shared/executive-insight";
import { DataStatusBadge } from "@/components/shared/data-status-badge";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { calcPipeline } from "@/lib/operating-model/calculations";
import { ACTIVE_PIPELINE, CLOSED_LOST } from "@/lib/operating-model/seed";
import type { Deal, DealHealth } from "@/lib/operating-model/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TAP2_COLORS, axisStyle, tooltipStyle, gridStyle } from "@/components/charts/chart-theme";
import { AlertTriangle, TrendingUp, GitBranch, DollarSign, Zap } from "lucide-react";

const PIPELINE = calcPipeline();

const HEALTH_CONFIG: Record<DealHealth, { color: string; bg: string; border: string; dot: string }> = {
  "Healthy":         { color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200",  dot: "#16a34a" },
  "High Intent":     { color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200",   dot: "#0358F1" },
  "Needs Follow-up": { color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200",  dot: "#d97706" },
  "Stale":           { color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", dot: "#ea580c" },
  "At Risk":         { color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200",    dot: "#dc2626" },
  "Low Quality":     { color: "text-gray-600",   bg: "bg-gray-50",   border: "border-gray-200",   dot: "#878787" },
};

function HealthBadge({ health }: { health: DealHealth }) {
  const cfg = HEALTH_CONFIG[health] ?? HEALTH_CONFIG["Needs Follow-up"];
  return (
    <span className={`inline-flex text-xs font-medium border rounded px-2 py-0.5 whitespace-nowrap ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      {health}
    </span>
  );
}

function QualityDot({ score }: { score: number }) {
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#0358F1" : score >= 40 ? "#d97706" : "#dc2626";
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-xs font-semibold text-gray-700">{score}</span>
    </span>
  );
}

type TableTab = "pipeline" | "attention" | "closing" | "lost";

export default function PipelinePage() {
  const [activeTab, setActiveTab] = useState<TableTab>("pipeline");
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);

  const tabs: { id: TableTab; label: string; count: number }[] = [
    { id: "pipeline",  label: "All Pipeline",    count: ACTIVE_PIPELINE.filter(d => d.deal_stage !== "Nurture").length },
    { id: "attention", label: "Needs Attention", count: PIPELINE.needsAttention.length },
    { id: "closing",   label: "Closing Soon",    count: PIPELINE.closingThisMonth.length },
    { id: "lost",      label: "Closed Lost",     count: CLOSED_LOST.length },
  ];

  const tableDeals: Deal[] =
    activeTab === "pipeline"  ? ACTIVE_PIPELINE.filter(d => d.deal_stage !== "Nurture").sort((a,b) => b.expected_mrr - a.expected_mrr) :
    activeTab === "attention" ? PIPELINE.needsAttention :
    activeTab === "closing"   ? PIPELINE.closingThisMonth :
    CLOSED_LOST;

  const stageBarData = PIPELINE.byStage.map(s => ({
    stage: s.stage
      .replace("Discovery Completed", "Discovery")
      .replace("Demo Completed", "Demo")
      .replace("Trial / Pilot", "Trial")
      .replace("Positive Reply", "+Reply")
      .replace("Meeting Booked", "Meeting"),
    mrr: s.mrr,
    weighted: s.weighted_mrr,
  }));

  const lostEntries = Object.entries(PIPELINE.lostReasons).sort((a,b) => b[1].count - a[1].count);

  return (
    <div className="space-y-6">
      <ExecutiveInsight
        insight="HubSpot connection will make all pipeline data live. This cockpit surfaces stale deals, close-risk, source quality, and lost reasons — once HubSpot syncs, every number updates automatically."
        nextStep="Configure HUBSPOT_ACCESS_TOKEN — all pipeline fields, custom properties, and deal stages are mapped and ready."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Gross Pipeline",    value: `€${(PIPELINE.totalGross/1000).toFixed(0)}k`,    sub: `${PIPELINE.dealCount} open deals`,     icon: <GitBranch className="h-4 w-4" /> },
          { label: "Weighted Pipeline", value: `€${(PIPELINE.totalWeighted/1000).toFixed(0)}k`, sub: "prob-adjusted ARR",                    icon: <TrendingUp className="h-4 w-4" /> },
          { label: "Expected MRR",      value: `€${PIPELINE.expectedMRR}`,                      sub: "from open deals",                      icon: <DollarSign className="h-4 w-4" /> },
          { label: "Weighted MRR",      value: `€${PIPELINE.weightedMRR}`,                      sub: "risk-adjusted",                        icon: <DollarSign className="h-4 w-4" /> },
          { label: "Stale Pipeline",    value: `€${(PIPELINE.stalePipeline/1000).toFixed(1)}k`, sub: `${PIPELINE.staleCount} deals flagged`,  icon: <AlertTriangle className="h-4 w-4" /> },
          { label: "Closing Soon",      value: String(PIPELINE.closingThisMonth.length),         sub: "in close window",                      icon: <Zap className="h-4 w-4" /> },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide leading-tight">{kpi.label}</p>
              <span className="text-gray-300">{kpi.icon}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {PIPELINE.staleCount > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800">
              {PIPELINE.staleCount} stale deal{PIPELINE.staleCount > 1 ? "s" : ""} — €{(PIPELINE.stalePipeline/1000).toFixed(1)}k pipeline at risk
            </p>
            <p className="text-xs text-orange-700 mt-0.5">
              These deals have exceeded the no-activity threshold for their stage. See the &quot;Needs Attention&quot; tab.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer title="Pipeline by Stage" question="Where does pipeline get stuck?" status="seed" statusIntegration="HubSpot Pending">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stageBarData} margin={{ top: 4, right: 4, bottom: 48, left: 0 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="stage" {...axisStyle} angle={-35} textAnchor="end" interval={0} />
              <YAxis {...axisStyle} tickFormatter={(v: number) => `€${v}`} />
              <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`€${String(v)}`, "MRR"]} />
              <Bar dataKey="mrr" fill={TAP2_COLORS.primary} radius={[4,4,0,0]} name="Expected MRR" />
              <Bar dataKey="weighted" fill={TAP2_COLORS.muted} radius={[4,4,0,0]} name="Weighted MRR" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-1">Deal Health Distribution</p>
          <p className="text-xs text-blue-600 mb-4">Is pipeline quality improving or degrading?</p>
          <div className="space-y-2.5">
            {PIPELINE.byHealth.map(h => {
              const cfg = HEALTH_CONFIG[h.health as DealHealth] ?? { dot: "#878787", color: "text-gray-600" };
              return (
                <div key={h.health} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                  <span className={`w-36 text-xs font-medium ${cfg.color}`}>{h.health}</span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-gray-100">
                      <div className="h-2 rounded-full" style={{
                        width: `${Math.min(100, (h.count / Math.max(1, PIPELINE.dealCount)) * 100)}%`,
                        background: cfg.dot,
                      }} />
                    </div>
                  </div>
                  <span className="w-6 text-right text-xs font-bold text-gray-700">{h.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-1">Pipeline by Source</p>
          <p className="text-xs text-blue-600 mb-4">Which channel creates the most qualified pipeline?</p>
          <div className="space-y-2.5">
            {PIPELINE.bySource.slice(0, 8).map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="w-32 text-xs text-gray-600 truncate">{s.label}</span>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-2 rounded-full" style={{
                      width: `${Math.min(100, (s.mrr / Math.max(1, PIPELINE.expectedMRR)) * 100)}%`,
                      background: TAP2_COLORS.primary,
                    }} />
                  </div>
                </div>
                <span className="w-12 text-right text-xs font-semibold text-gray-800">€{s.mrr}</span>
                <span className="w-8 text-right text-xs text-gray-400">{s.count}d</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-1">Lost Reasons & Competitors</p>
          <p className="text-xs text-blue-600 mb-4">Which patterns should the sales playbook address?</p>
          {lostEntries.length > 0 ? (
            <div className="space-y-2">
              {lostEntries.map(([reason, data]) => (
                <div key={reason} className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  <span className="flex-1 text-xs text-gray-700">{reason}</span>
                  <span className="text-xs font-semibold text-gray-500">{data.count}×</span>
                  <span className="text-xs text-red-600">€{data.mrr}/mo</span>
                </div>
              ))}
              {Object.keys(PIPELINE.competitors).length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {Object.entries(PIPELINE.competitors).map(([c, n]) => (
                    <span key={c} className="text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded px-2 py-0.5">{c} ({n}×)</span>
                  ))}
                </div>
              )}
            </div>
          ) : <p className="text-xs text-gray-400">No closed lost deals yet.</p>}
        </div>
      </div>

      {/* Deal Cockpit */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Sales Cockpit</h3>
            <p className="text-xs text-gray-400 mt-0.5">Health, quality score, and next actions — click any row to expand</p>
          </div>
          <DataStatusBadge status="seed" integration="HubSpot Pending" />
        </div>

        <div className="flex gap-0 px-5 pt-3 border-b border-gray-100 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-gray-100 text-gray-600 text-xs">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[960px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Company", "Stage", "Owner", "Source", "Use Case", "MRR", "Prob", "W.MRR", "Health", "Quality", "Days", "Close", "Next Step"].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tableDeals.map(deal => (
                <>
                  <tr
                    key={deal.deal_id}
                    className="hover:bg-gray-50/60 cursor-pointer"
                    onClick={() => setExpandedDeal(expandedDeal === deal.deal_id ? null : deal.deal_id)}
                  >
                    <td className="px-3 py-2.5">
                      <p className="text-xs font-semibold text-gray-900 whitespace-nowrap">{deal.company_name}</p>
                      <p className="text-xs text-gray-400">{deal.city}, {deal.country}</p>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-700 whitespace-nowrap">{deal.deal_stage}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">{deal.owner}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 max-w-[100px] truncate">{deal.source}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 max-w-[100px] truncate">{deal.use_case}</td>
                    <td className="px-3 py-2.5 text-right text-xs font-semibold text-gray-800">€{deal.expected_mrr}</td>
                    <td className="px-3 py-2.5 text-right text-xs text-gray-500">{deal.probability}%</td>
                    <td className="px-3 py-2.5 text-right text-xs font-medium" style={{ color: TAP2_COLORS.primary }}>€{deal.weighted_mrr}</td>
                    <td className="px-3 py-2.5"><HealthBadge health={deal.deal_health} /></td>
                    <td className="px-3 py-2.5"><QualityDot score={deal.quality_score} /></td>
                    <td className="px-3 py-2.5 text-right text-xs text-gray-500">{deal.days_in_stage}d</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{deal.expected_close_month}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 max-w-[160px] truncate">{deal.next_step}</td>
                  </tr>
                  {expandedDeal === deal.deal_id && (
                    <tr key={`${deal.deal_id}-exp`}>
                      <td colSpan={13} className="px-4 py-3 bg-blue-50/40 border-b border-blue-100">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                          <div><span className="text-gray-400">Segment: </span><span className="text-gray-700">{deal.segment}</span></div>
                          <div><span className="text-gray-400">Industry: </span><span className="text-gray-700">{deal.industry}</span></div>
                          <div><span className="text-gray-400">Sales cycle: </span><span className="text-gray-700">{deal.sales_cycle_days}d total</span></div>
                          <div><span className="text-gray-400">Campaign: </span><span className="text-gray-700">{deal.campaign_name ?? "—"}</span></div>
                          {deal.objections.length > 0 && (
                            <div className="sm:col-span-2"><span className="text-gray-400">Objections: </span><span className="text-amber-700">{deal.objections.join(" · ")}</span></div>
                          )}
                          {deal.competitor && <div><span className="text-gray-400">Competitor: </span><span className="text-red-600">{deal.competitor}</span></div>}
                          {deal.lost_reason && <div><span className="text-gray-400">Lost reason: </span><span className="text-red-600">{deal.lost_reason}</span></div>}
                          <div className="sm:col-span-4"><span className="text-gray-400">Notes: </span><span className="text-gray-600 italic">{deal.notes}</span></div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-400">Seed data only — connect HubSpot to replace with live CRM. Quality: 80+ green · 60–79 blue · 40–59 amber · &lt;40 red.</p>
        </div>
      </div>
    </div>
  );
}
