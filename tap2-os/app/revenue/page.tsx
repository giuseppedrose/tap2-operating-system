"use client";

import { REVENUE, getRevenueQualitySignals, getMilestoneProgress } from "@/lib/operating-model/calculations";
import { CLOSED_WON } from "@/lib/operating-model/seed";
import { OperatingBrief } from "@/components/operating/OperatingBrief";
import { MilestoneTracker } from "@/components/operating/MilestoneTracker";
import { RevenueSignal } from "@/components/operating/RevenueSignal";
import { DataStatusBadge } from "@/components/shared/data-status-badge";
import { MRRAreaChart } from "@/components/charts/MRRAreaChart";
import { WaterfallMRR } from "@/components/charts/WaterfallMRR";
import { HorizontalRankChart } from "@/components/charts/HorizontalRankChart";
import { ChartFrame } from "@/components/charts/ChartFrame";
import { StackedAreaChart } from "@/components/charts/StackedAreaChart";
import { SegmentedProgressBars } from "@/components/charts/SegmentedProgressBars";
import { mockRevenueData } from "@/lib/mock-data/revenue";

const revenue = getRevenueQualitySignals();
const milestone = getMilestoneProgress();

// Build country and segment breakdowns from closed won
const byCountry = Object.entries(
  CLOSED_WON.reduce<Record<string, number>>((acc, d) => {
    acc[d.country] = (acc[d.country] ?? 0) + d.expected_mrr;
    return acc;
  }, {})
)
  .map(([label, value]) => ({ label, value, formatted: `€${value}` }))
  .sort((a, b) => b.value - a.value);

const bySegment = Object.entries(
  CLOSED_WON.reduce<Record<string, number>>((acc, d) => {
    acc[d.segment] = (acc[d.segment] ?? 0) + d.expected_mrr;
    return acc;
  }, {})
)
  .map(([label, value]) => ({ label, value, formatted: `€${value}` }))
  .sort((a, b) => b.value - a.value);

// Build stacked area data from mrrHistory — estimated market splits
const mrrHistory = mockRevenueData.mrrHistory;
const stackedMarketData = mrrHistory.map(({ month, mrr }) => ({
  month,
  nl: Math.round(mrr * 0.636),
  es: Math.round(mrr * 0.175),
  co: Math.round(mrr * 0.083),
  it: Math.round(mrr * 0.07),
}));

const marketSeries = [
  { key: "nl", label: "Netherlands", color: "#0358F1" },
  { key: "es", label: "Spain",       color: "#3b82f6" },
  { key: "co", label: "Colombia",    color: "#94a3b8" },
  { key: "it", label: "Italy",       color: "#cbd5e1" },
];

// Customer concentration: top 5 by MRR
const top5 = [...CLOSED_WON].sort((a, b) => b.expected_mrr - a.expected_mrr).slice(0, 5);
const topPct = REVENUE.currentMRR > 0
  ? ((top5.reduce((s, d) => s + d.expected_mrr, 0) / REVENUE.currentMRR) * 100).toFixed(0)
  : "0";

const concentrationItems = top5.map(d => ({
  label: d.company_name.slice(0, 24),
  value: d.expected_mrr,
  maxValue: REVENUE.currentMRR,
  formatted: `€${d.expected_mrr}/mo (${REVENUE.currentMRR > 0 ? ((d.expected_mrr / REVENUE.currentMRR) * 100).toFixed(0) : 0}%)`,
  subLabel: d.country,
  color: "#0358F1",
}));

export default function RevenuePage() {
  const netNew = revenue.monthlyNewMRR + revenue.expansionMRR - revenue.churnedMRR;

  return (
    <div className="space-y-5">
      <OperatingBrief
        status={netNew > 0 ? "on_track" : "behind"}
        headline={`€${REVENUE.currentMRR.toLocaleString()} MRR — growing at ${revenue.growthRate}% MoM. ${milestone.pct.toFixed(0)}% of the way to €100k ARR. Stripe connection makes this live.`}
        signals={[
          `+€${revenue.monthlyNewMRR} new MRR this month`,
          `€${revenue.churnedMRR} churned (${revenue.churnRate}% rate)`,
          `€${netNew} net new — ${milestone.monthsAtCurrentPace} months to €100k ARR target at this pace`,
        ]}
        dataLabel="Seed data — Stripe Pending"
      />

      {/* MRR Waterfall */}
      <ChartFrame
        title="MRR Movements This Month"
        question="Where did revenue come from and go?"
        source="Stripe"
        sourceStatus="seed"
      >
        <WaterfallMRR
          previousMRR={REVENUE.currentMRR - netNew}
          newMRR={revenue.monthlyNewMRR}
          expansionMRR={revenue.expansionMRR}
          churnedMRR={revenue.churnedMRR}
          currentMRR={REVENUE.currentMRR}
        />
      </ChartFrame>

      {/* Revenue signal + milestone */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RevenueSignal
          mrr={REVENUE.currentMRR}
          newMRR={revenue.monthlyNewMRR}
          expansionMRR={revenue.expansionMRR}
          churnedMRR={revenue.churnedMRR}
          growthRate={revenue.growthRate}
          arpa={REVENUE.arpa}
          churnRate={revenue.churnRate}
          activeClients={REVENUE.activeClients}
        />
        <MilestoneTracker milestone={milestone} />
      </div>

      {/* MRR trajectory */}
      <ChartFrame
        title="MRR Trajectory"
        question="Are we growing fast enough to hit €100k ARR?"
        source="Stripe"
        sourceStatus="seed"
      >
        <MRRAreaChart
          data={mockRevenueData.mrrHistory}
          height={200}
          referenceValue={8300}
          referenceLabel="€100k ARR target"
        />
      </ChartFrame>

      {/* Revenue quality */}
      <div className="border border-gray-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Revenue Quality Signals</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: "ARPA",
              value: `€${REVENUE.arpa}/mo`,
              signal: REVENUE.arpa >= 50 ? "Good" : "Below target",
              ok: REVENUE.arpa >= 50,
              note: "Target: €50+",
            },
            {
              label: "Monthly Churn",
              value: `${revenue.churnRate}%`,
              signal: revenue.churnRate <= 2 ? "Healthy" : "Elevated",
              ok: revenue.churnRate <= 2,
              note: `${revenue.closedLostCount} lost to date`,
            },
            {
              label: "Expansion MRR",
              value: `€${revenue.expansionMRR}/mo`,
              signal: revenue.expansionMRR > 100 ? "Active" : "Low",
              ok: revenue.expansionMRR > 100,
              note: "Upsell potential untapped",
            },
            {
              label: "New MRR/mo",
              value: `€${revenue.monthlyNewMRR}`,
              signal: revenue.monthlyNewMRR >= 300 ? "On pace" : "Needs acceleration",
              ok: revenue.monthlyNewMRR >= 300,
              note: "Need €450+ for 12-mo target",
            },
          ].map(q => (
            <div key={q.label} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-400 mb-1">{q.label}</p>
              <p className="text-lg font-semibold text-gray-900">{q.value}</p>
              <p className={`text-xs font-medium mt-0.5 ${q.ok ? "text-emerald-600" : "text-amber-600"}`}>
                {q.signal}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{q.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue breakdown — wrapped in ChartFrame */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartFrame
          title="MRR by Market"
          question="Which markets are contributing most to recurring revenue?"
          source="Stripe"
          sourceStatus="seed"
        >
          <HorizontalRankChart
            data={byCountry}
            valueFormatter={v => `€${v}`}
            height={byCountry.length * 36 + 20}
          />
        </ChartFrame>
        <ChartFrame
          title="MRR by Segment"
          question="Which customer segments drive the most MRR?"
          source="Stripe"
          sourceStatus="seed"
        >
          <HorizontalRankChart
            data={bySegment}
            valueFormatter={v => `€${v}`}
            height={bySegment.length * 36 + 20}
          />
        </ChartFrame>
      </div>

      {/* ── Revenue Composition: MRR by Market Trend ── */}
      <ChartFrame
        title="MRR by Market — Trend"
        question="Is revenue diversifying across markets or concentrating?"
        source="Stripe Pending"
        sourceStatus="seed"
        footnote="Split estimated from closed-won deal proportions. Stripe sync will replace with actuals."
      >
        <StackedAreaChart
          data={stackedMarketData}
          xKey="month"
          series={marketSeries}
          height={200}
          stacked={true}
          valueFormatter={v => `€${v}`}
          tickFormatter={v => v.split(" ")[0]}
        />
      </ChartFrame>

      {/* ── Customer Concentration ── */}
      <ChartFrame
        title="Revenue Concentration"
        question="How dependent is MRR on the top 5 customers?"
        source="Stripe Pending"
        sourceStatus="seed"
        footnote={`Top 5 customers = ${topPct}% of total MRR. Target: <40% concentration for revenue resilience.`}
      >
        <SegmentedProgressBars items={concentrationItems} />
      </ChartFrame>

      {/* Customer revenue table */}
      <div className="border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-900">Active Revenue Base — {REVENUE.activeClients} Customers</p>
            <p className="text-xs text-gray-400 mt-0.5">Stripe subscription data will replace this when connected</p>
          </div>
          <DataStatusBadge status="seed" integration="Stripe Pending" />
        </div>
        <div className="overflow-x-auto">
          <table className="board-table min-w-[600px]">
            <thead>
              <tr>
                <th className="text-left">Customer</th>
                <th className="text-left">Country</th>
                <th className="text-left">Segment</th>
                <th>MRR</th>
                <th className="text-left">Partner</th>
                <th className="text-left">Source</th>
                <th>Since</th>
              </tr>
            </thead>
            <tbody>
              {CLOSED_WON.sort((a, b) => b.expected_mrr - a.expected_mrr).map(d => (
                <tr key={d.deal_id}>
                  <td className="text-left font-medium text-gray-900">{d.company_name}</td>
                  <td className="text-left text-gray-500">{d.country}</td>
                  <td className="text-left text-gray-500 text-xs">{d.segment}</td>
                  <td className="font-semibold text-[#0358F1]">€{d.expected_mrr}/mo</td>
                  <td className="text-left text-gray-500">{d.owner}</td>
                  <td className="text-left text-gray-400 text-xs">{d.source}</td>
                  <td className="text-gray-400 text-xs">{d.close_date.slice(0, 7)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
