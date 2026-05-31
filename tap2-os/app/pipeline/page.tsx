"use client";

import { useState } from "react";
import {
  calcPipeline, REVENUE,
  getOperatingState, getActionQueue,
} from "@/lib/operating-model/calculations";
import { ACTIVE_PIPELINE, CLOSED_LOST } from "@/lib/operating-model/seed";
import { STAGE_PROBABILITY, STALE_THRESHOLDS } from "@/lib/operating-model/constants";
import type { Deal, DealHealth } from "@/lib/operating-model/types";
import { OperatingBrief } from "@/components/operating/OperatingBrief";
import { BoardMetricCard, BoardMetricRow } from "@/components/analytics/BoardMetricCard";
import { BridgeChart } from "@/components/analytics/BridgeChart";
import { FunnelTable } from "@/components/analytics/FunnelTable";
import { ActionRegister } from "@/components/analytics/ActionRegister";
import type { ActionEntry } from "@/components/analytics/ActionRegister";
import { ExecutiveSection } from "@/components/analytics/ExecutiveSection";
import { OperatingInsight } from "@/components/analytics/OperatingInsight";
import { SourceOfTruthBadge } from "@/components/analytics/SourceOfTruthBadge";
import { ChartFrame } from "@/components/charts/ChartFrame";
import { HorizontalBarRankChart } from "@/components/charts/HorizontalBarRankChart";
import { SegmentedProgressBars } from "@/components/charts/SegmentedProgressBars";

// ── Computed pipeline state ─────────────────────────────────────────────────────
const PIPELINE = calcPipeline();
const TARGET_MRR = 8300;
const GAP = TARGET_MRR - REVENUE.currentMRR;
const COVERAGE = Math.round((PIPELINE.weightedMRR / Math.max(1, GAP)) * 100) / 100;

// ── Funnel table rows ────────────────────────────────────────────────────────────
function buildFunnelRows() {
  const stageOrder = [
    "New Lead","Contacted","Positive Reply","Meeting Booked","Discovery Completed",
    "Demo Completed","Proposal Sent","Trial / Pilot","Negotiation","Nurture",
  ];
  const groups: Record<string, Deal[]> = {};
  ACTIVE_PIPELINE.forEach(d => {
    if (!groups[d.deal_stage]) groups[d.deal_stage] = [];
    groups[d.deal_stage].push(d);
  });

  return stageOrder.filter(s => groups[s]?.length).map((stage, i, arr) => {
    const deals = groups[stage] ?? [];
    const count = deals.length;
    const value = deals.reduce((s, d) => s + d.amount, 0);
    const expMRR = deals.reduce((s, d) => s + d.expected_mrr, 0);
    const wMRR = deals.reduce((s, d) => s + d.weighted_mrr, 0);
    const staleDeals = deals.filter(d => d.deal_health === "Stale" || d.deal_health === "At Risk");
    const stalePct = count > 0 ? Math.round((staleDeals.length / count) * 100) : 0;
    const withDays = deals.filter(d => d.days_in_stage > 0);
    const avgDays = withDays.length ? Math.round(withDays.reduce((s, d) => s + d.days_in_stage, 0) / withDays.length) : null;

    const nextStage = arr[i + 1];
    const nextCount = nextStage ? (groups[nextStage]?.length ?? 0) : 0;
    const conversionToNext = nextStage && count > 0 ? Math.round((nextCount / count) * 100) : null;

    return { stage, deals: count, value, expectedMRR: expMRR, weightedMRR: wMRR, conversionToNext, avgDays, stalePct };
  });
}

// ── Action register entries ──────────────────────────────────────────────────────
function buildActionRegister(): ActionEntry[] {
  const actions = getActionQueue();
  return actions.slice(0, 10).map(a => ({
    id: a.deal_id,
    company: a.company,
    owner: a.owner,
    stage: a.stage,
    mrr: a.mrr,
    risk: (a.urgency === "now" ? "high" : a.urgency === "this_week" ? "medium" : "low") as "high" | "medium" | "low",
    nextStep: a.action,
    dueDate: a.due,
    urgency: a.urgency,
  }));
}

// ── Health badge ────────────────────────────────────────────────────────────────
const HEALTH_CFG: Record<DealHealth, { color: string; bg: string }> = {
  "Healthy":         { color: "text-emerald-700", bg: "bg-emerald-50" },
  "High Intent":     { color: "text-blue-700",    bg: "bg-blue-50" },
  "Needs Follow-up": { color: "text-amber-700",   bg: "bg-amber-50" },
  "Stale":           { color: "text-orange-700",  bg: "bg-orange-50" },
  "At Risk":         { color: "text-red-700",      bg: "bg-red-50" },
  "Low Quality":     { color: "text-gray-500",     bg: "bg-gray-100" },
};

// ── Deal quality buckets ────────────────────────────────────────────────────────
function buildQualityBuckets() {
  const totalDeals = ACTIVE_PIPELINE.length;
  const buckets = {
    A: { count: 0, mrr: 0 },
    B: { count: 0, mrr: 0 },
    C: { count: 0, mrr: 0 },
    D: { count: 0, mrr: 0 },
  };
  ACTIVE_PIPELINE.forEach(d => {
    if (d.quality_score >= 80) { buckets.A.count++; buckets.A.mrr += d.expected_mrr; }
    else if (d.quality_score >= 60) { buckets.B.count++; buckets.B.mrr += d.expected_mrr; }
    else if (d.quality_score >= 40) { buckets.C.count++; buckets.C.mrr += d.expected_mrr; }
    else { buckets.D.count++; buckets.D.mrr += d.expected_mrr; }
  });
  return { buckets, totalDeals };
}

// ── Close month distribution ────────────────────────────────────────────────────
function buildCloseMonthData() {
  const monthMap: Record<string, number> = {};
  ACTIVE_PIPELINE.forEach(d => {
    if (!d.expected_close_month) return;
    monthMap[d.expected_close_month] = (monthMap[d.expected_close_month] ?? 0) + d.expected_mrr;
  });
  return Object.entries(monthMap)
    .sort(([a], [b]) => {
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const [aM, aY] = a.split(" ");
      const [bM, bY] = b.split(" ");
      if (aY !== bY) return Number(aY) - Number(bY);
      return months.indexOf(aM) - months.indexOf(bM);
    })
    .slice(0, 5)
    .map(([label, value]) => ({ label, value, formatted: `€${value}/mo` }));
}

type DealTab = "active" | "attention" | "closing" | "lost";

export default function PipelinePage() {
  const [tab, setTab] = useState<DealTab>("active");
  const [expanded, setExpanded] = useState<string | null>(null);

  const funnelRows = buildFunnelRows();
  const actionEntries = buildActionRegister();
  const { buckets, totalDeals } = buildQualityBuckets();
  const closeMonthData = buildCloseMonthData();

  const stageChartData = PIPELINE.byStage.map(s => ({
    label: s.stage.slice(0, 12),
    value: s.mrr,
    highlight: s.stage === "Negotiation" || s.stage === "Trial / Pilot",
  }));

  const ownerChartData = PIPELINE.byOwner.map(o => ({
    label: o.label,
    value: o.mrr,
  }));

  const qualityItems = [
    {
      label: "A (≥80) — High conviction",
      value: buckets.A.count,
      maxValue: totalDeals,
      formatted: `${buckets.A.count} deals · €${buckets.A.mrr}/mo`,
      color: "#10b981",
    },
    {
      label: "B (60–79) — Solid",
      value: buckets.B.count,
      maxValue: totalDeals,
      formatted: `${buckets.B.count} deals · €${buckets.B.mrr}/mo`,
      color: "#0358F1",
    },
    {
      label: "C (40–59) — Needs work",
      value: buckets.C.count,
      maxValue: totalDeals,
      formatted: `${buckets.C.count} deals · €${buckets.C.mrr}/mo`,
      color: "#f59e0b",
    },
    {
      label: "D (<40) — Low quality",
      value: buckets.D.count,
      maxValue: totalDeals,
      formatted: `${buckets.D.count} deals · €${buckets.D.mrr}/mo`,
      color: "#ef4444",
    },
  ];

  const tabDeals: Deal[] =
    tab === "active"    ? ACTIVE_PIPELINE.filter(d => d.deal_stage !== "Nurture" && d.deal_stage !== "New Lead").sort((a,b) => b.expected_mrr - a.expected_mrr) :
    tab === "attention" ? PIPELINE.needsAttention.sort((a,b) => b.expected_mrr - a.expected_mrr) :
    tab === "closing"   ? PIPELINE.closingThisMonth.sort((a,b) => b.expected_mrr - a.expected_mrr) :
    CLOSED_LOST;

  const lostReasons = Object.entries(PIPELINE.lostReasons).sort((a,b) => b[1].count - a[1].count);

  const bridgeRows = [
    { label: "Required MRR gap (€100k ARR target)", value: GAP, type: "opening" as const, running: GAP },
    { label: "Gross pipeline MRR", value: PIPELINE.expectedMRR, type: "subtract" as const, running: GAP - PIPELINE.expectedMRR },
    { label: "Risk adjustment (probability discount)", value: PIPELINE.expectedMRR - PIPELINE.weightedMRR, type: "add" as const, running: GAP - PIPELINE.weightedMRR },
    { label: "Weighted pipeline MRR", value: PIPELINE.weightedMRR, type: "closing" as const, running: GAP - PIPELINE.weightedMRR },
  ];

  return (
    <div className="space-y-6">
      <OperatingBrief
        status={COVERAGE >= 1 ? "on_track" : COVERAGE >= 0.5 ? "behind" : "critical"}
        headline={`Pipeline coverage: ${COVERAGE.toFixed(1)}× weighted MRR vs €100k ARR gap. ${PIPELINE.closingThisMonth.length} deal${PIPELINE.closingThisMonth.length !== 1 ? "s" : ""} in close window. ${PIPELINE.staleCount} stale.`}
        signals={[
          `Weighted MRR: €${PIPELINE.weightedMRR}/mo vs €${GAP.toLocaleString()} needed`,
          `${PIPELINE.dealCount} open deals · €${(PIPELINE.totalGross/1000).toFixed(0)}k gross · €${PIPELINE.weightedMRR}/mo weighted`,
          PIPELINE.staleCount > 0 ? `${PIPELINE.staleCount} stale deals — €${(PIPELINE.stalePipeline/1000).toFixed(1)}k at risk` : "Pipeline health is clean",
        ]}
        dataLabel="Seed data — HubSpot Pending"
      />

      {/* Key metrics */}
      <BoardMetricRow>
        <BoardMetricCard label="Gross Pipeline" value={`€${(PIPELINE.totalGross/1000).toFixed(0)}k`} sub={`${PIPELINE.dealCount} open deals`} dataStatus="seed" source="HubSpot Pending" />
        <BoardMetricCard label="Weighted Pipeline" value={`€${(PIPELINE.totalWeighted/1000).toFixed(0)}k ARR`} sub={`€${PIPELINE.weightedMRR}/mo`} dataStatus="derived" />
        <BoardMetricCard label="Pipeline Coverage" value={`${COVERAGE.toFixed(1)}×`} sub="vs €100k ARR gap" dataStatus="derived" flag={COVERAGE < 1 ? "Below 1× — insufficient" : undefined} />
        <BoardMetricCard label="Stale Pipeline" value={`€${(PIPELINE.stalePipeline/1000).toFixed(1)}k`} sub={`${PIPELINE.staleCount} deals flagged`} dataStatus="derived" flag={PIPELINE.staleCount > 0 ? "Requires action" : undefined} />
      </BoardMetricRow>

      {/* ── Visual row: Stage distribution + Owner breakdown ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <ChartFrame
            title="Pipeline Distribution by Stage"
            question="Where is pipeline concentrated and which stages are stale?"
            source="HubSpot"
            sourceStatus="seed"
          >
            <HorizontalBarRankChart
              data={stageChartData}
              height={240}
              valueFormatter={v => `€${v}/mo`}
            />
          </ChartFrame>
        </div>
        <div className="col-span-1">
          <ChartFrame
            title="Pipeline by Owner"
            question="Who owns the most MRR in pipeline?"
            source="HubSpot"
            sourceStatus="seed"
          >
            <HorizontalBarRankChart
              data={ownerChartData}
              height={240}
              valueFormatter={v => `€${v}/mo`}
            />
          </ChartFrame>
        </div>
      </div>

      {/* Operating insights */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <OperatingInsight
          type={COVERAGE >= 1 ? "opportunity" : "risk"}
          label="Pipeline Coverage"
          body={`Weighted pipeline MRR (€${PIPELINE.weightedMRR}/mo) covers ${(COVERAGE * 100).toFixed(0)}% of the €${GAP.toLocaleString()} MRR gap to €100k ARR. ${COVERAGE < 1 ? "Pipeline is insufficient at current conversion rates — top-of-funnel must increase." : "Coverage is adequate if conversion rates hold."}`}
          action={COVERAGE < 1 ? "Add deals: need €" + Math.round(GAP / 0.35) + "k gross pipeline at 35% conversion to close the gap." : undefined}
        />
        {PIPELINE.staleCount > 0 && (
          <OperatingInsight
            type="risk"
            label="Stale Pipeline Risk"
            body={`${PIPELINE.staleCount} deals have exceeded activity thresholds. €${(PIPELINE.stalePipeline/1000).toFixed(1)}k in gross pipeline is at risk of being lost deals that are not yet marked lost. Inflate gross pipeline figure artificially.`}
            action="Action stale deals this week. Mark as Nurture or Closed Lost if no response."
          />
        )}
        <OperatingInsight
          type="finding"
          label="Win Rate Signal"
          body={`${PIPELINE.closingThisMonth.length} deals in close window this month. If all close, adds €${PIPELINE.closingThisMonth.reduce((s,d) => s+d.expected_mrr, 0)}/mo MRR. Seed win rate is elevated (historical referral/warm leads) — expect normalization at scale.`}
        />
        {Object.keys(PIPELINE.competitors).length > 0 && (
          <OperatingInsight
            type="finding"
            label="Competitive Signal"
            body={`Competitor mentions in lost deals: ${Object.entries(PIPELINE.competitors).map(([c,n]) => `${c} (${n}×)`).join(", ")}. Stamp It is the primary competitive threat. Integration narrative and faster notification delivery are key differentiators.`}
          />
        )}
      </div>

      {/* Pipeline stage funnel table */}
      <ExecutiveSection
        title="Pipeline Stage Analysis"
        subtitle="Deal count, value, and weighted MRR by stage"
        right={<SourceOfTruthBadge source="HubSpot" status="seed" />}
        note="Weighted MRR = expected_mrr × stage probability. Coverage ratio = weighted pipeline MRR / MRR gap to €100k ARR."
      >
        <FunnelTable
          rows={funnelRows}
          footerNote={`Pipeline coverage ratio: ${COVERAGE.toFixed(2)}× weighted MRR vs required. Target: ≥3× for comfortable coverage.`}
        />
      </ExecutiveSection>

      {/* ── Deal Quality Distribution ── */}
      <ChartFrame
        title="Deal Quality Distribution"
        question="What proportion of pipeline scores A-B vs C-D quality?"
        source="Derived"
        sourceStatus="derived"
        footnote="Quality score composite: ICP fit, source quality, meeting completed, decision maker, clear next step."
      >
        <SegmentedProgressBars items={qualityItems} />
      </ChartFrame>

      {/* Pipeline coverage bridge */}
      <ExecutiveSection
        title="Pipeline Coverage Bridge"
        subtitle="How current pipeline maps to the €100k ARR milestone"
        right={<SourceOfTruthBadge source="Derived" status="derived" />}
      >
        <BridgeChart
          title="MRR GAP → PIPELINE COVERAGE ANALYSIS"
          rows={bridgeRows}
          note="Coverage < 1× means weighted pipeline is insufficient even if all deals close. Industry standard: maintain ≥3× pipeline coverage at top of funnel."
        />
      </ExecutiveSection>

      {/* Founder attention register */}
      <ExecutiveSection
        title="Founder Attention Register"
        subtitle="Deals requiring action, ranked by urgency and MRR at stake"
        right={<SourceOfTruthBadge source="HubSpot" status="seed" />}
      >
        <ActionRegister entries={actionEntries} title="" />
      </ExecutiveSection>

      {/* ── Expected Closes by Month ── */}
      <ChartFrame
        title="Expected Closes by Month"
        question="What pipeline should close in the next 3 months?"
        source="HubSpot"
        sourceStatus="seed"
      >
        <HorizontalBarRankChart
          data={closeMonthData}
          height={140}
          valueFormatter={v => `€${v}/mo`}
        />
      </ChartFrame>

      {/* Deal table */}
      <div className="board-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex gap-0">
            {([
              ["active", "Active Pipeline", ACTIVE_PIPELINE.filter(d => d.deal_stage !== "Nurture" && d.deal_stage !== "New Lead").length],
              ["attention", "At Risk / Stale", PIPELINE.needsAttention.length],
              ["closing", "Close Window", PIPELINE.closingThisMonth.length],
              ["lost", "Closed Lost", CLOSED_LOST.length],
            ] as const).map(([id, label, count]) => (
              <button
                key={id}
                onClick={() => setTab(id as DealTab)}
                className={`px-3 py-1.5 text-[11px] font-semibold transition-colors border-b-2 ${
                  tab === id
                    ? "border-[#0358F1] text-[#0358F1]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {label} <span className="ml-1 text-[10px]">{count}</span>
              </button>
            ))}
          </div>
          <SourceOfTruthBadge source="HubSpot" status="seed" />
        </div>
        <div className="overflow-x-auto">
          <table className="board-table min-w-[900px]">
            <thead>
              <tr>
                <th className="text-left">Company</th>
                <th className="text-left">Stage</th>
                <th className="text-left">Owner</th>
                <th className="text-left">Source</th>
                <th>MRR</th>
                <th>Prob.</th>
                <th>W. MRR</th>
                <th>Quality</th>
                <th>Health</th>
                <th>Days</th>
                <th>Close</th>
                <th className="text-left">Next Step</th>
              </tr>
            </thead>
            <tbody>
              {tabDeals.map(deal => {
                const hcfg = HEALTH_CFG[deal.deal_health] ?? HEALTH_CFG["Needs Follow-up"];
                return (
                  <>
                    <tr
                      key={deal.deal_id}
                      className="cursor-pointer hover:bg-gray-50/60"
                      onClick={() => setExpanded(expanded === deal.deal_id ? null : deal.deal_id)}
                    >
                      <td className="text-left">
                        <p className="text-xs font-semibold text-gray-900">{deal.company_name}</p>
                        <p className="text-[10px] text-gray-400">{deal.city}, {deal.country}</p>
                      </td>
                      <td className="text-left text-xs text-gray-600 whitespace-nowrap">{deal.deal_stage}</td>
                      <td className="text-left text-xs text-gray-500">{deal.owner}</td>
                      <td className="text-left text-xs text-gray-400 max-w-[90px] truncate">{deal.source}</td>
                      <td className="font-semibold text-[#0358F1]">€{deal.expected_mrr}</td>
                      <td className="text-gray-500">{deal.probability}%</td>
                      <td className="font-semibold text-gray-700">€{deal.weighted_mrr}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="h-1 w-8 rounded-full bg-gray-100">
                            <div className="h-1 rounded-full bg-[#0358F1]" style={{ width: `${deal.quality_score}%` }} />
                          </div>
                          <span className="text-[11px] text-gray-500">{deal.quality_score}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${hcfg.color} ${hcfg.bg}`}>
                          {deal.deal_health}
                        </span>
                      </td>
                      <td className="text-gray-500">{deal.days_in_stage}d</td>
                      <td className="text-gray-500 whitespace-nowrap text-[11px]">{deal.expected_close_month}</td>
                      <td className="text-left text-xs text-gray-500 max-w-[140px] truncate">{deal.next_step}</td>
                    </tr>
                    {expanded === deal.deal_id && (
                      <tr key={`${deal.deal_id}-x`}>
                        <td colSpan={12} className="px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                          <div className="grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-4 text-[11px]">
                            <span><span className="text-gray-400">Segment: </span>{deal.segment}</span>
                            <span><span className="text-gray-400">Use case: </span>{deal.use_case}</span>
                            <span><span className="text-gray-400">Cycle: </span>{deal.sales_cycle_days}d total</span>
                            <span><span className="text-gray-400">Campaign: </span>{deal.campaign_name ?? "—"}</span>
                            {deal.objections.length > 0 && <span className="col-span-2"><span className="text-gray-400">Objections: </span><span className="text-amber-700">{deal.objections.join(" · ")}</span></span>}
                            {deal.competitor && <span><span className="text-gray-400">Competitor: </span><span className="text-red-600">{deal.competitor}</span></span>}
                            {deal.lost_reason && <span><span className="text-gray-400">Lost reason: </span><span className="text-red-600">{deal.lost_reason}</span></span>}
                            <span className="col-span-4 text-gray-500 italic">{deal.notes}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 italic">Quality score: A ≥80 · B 60–79 · C 40–59 · D &lt;40. Stale thresholds: Contacted &gt;7d · Proposal &gt;10d · Trial &gt;14d · Negotiation &gt;7d.</p>
        </div>
      </div>

      {/* Lost reasons + competitors */}
      {lostReasons.length > 0 && (
        <ExecutiveSection
          title="Loss Analysis"
          subtitle="Win/loss post-mortem — patterns to address in sales playbook"
          right={<SourceOfTruthBadge source="HubSpot" status="seed" />}
        >
          <div className="board-card overflow-hidden">
            <table className="board-table">
              <thead><tr>
                <th className="text-left">Lost Reason</th>
                <th>Deals</th>
                <th>MRR Lost/mo</th>
                <th className="text-left">Competitors Mentioned</th>
              </tr></thead>
              <tbody>
                {lostReasons.map(([reason, data]) => (
                  <tr key={reason}>
                    <td className="text-left">{reason}</td>
                    <td>{data.count}</td>
                    <td className="text-red-600 font-semibold">€{data.mrr}</td>
                    <td className="text-left">
                      {Object.entries(PIPELINE.competitors)
                        .filter(([c]) => CLOSED_LOST.some(d => d.lost_reason === reason && d.competitor === c))
                        .map(([c]) => <span key={c} className="text-[11px] text-red-500 mr-2">{c}</span>)
                        || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ExecutiveSection>
      )}
    </div>
  );
}
