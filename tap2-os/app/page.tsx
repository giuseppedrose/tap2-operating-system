"use client";

import {
  REVENUE,
  calcPipeline,
  getOperatingState,
  getActionQueue,
  getMilestoneProgress,
  getPipelineThisMonth,
  getRevenueQualitySignals,
} from "@/lib/operating-model/calculations";
import { OperatingBrief } from "@/components/operating/OperatingBrief";
import { ActionQueue } from "@/components/operating/ActionQueue";
import { MilestoneTracker } from "@/components/operating/MilestoneTracker";
import { RevenueSignal } from "@/components/operating/RevenueSignal";
import { DataStatusBadge } from "@/components/shared/data-status-badge";
import { ChartFrame } from "@/components/charts/ChartFrame";
import { AreaTrendChart } from "@/components/charts/AreaTrendChart";
import { SmallMultipleTrends } from "@/components/charts/SmallMultipleTrends";
import { MetricTrend } from "@/components/charts/MetricTrend";
import { mockRevenueData } from "@/lib/mock-data/revenue";
import { mockCashData } from "@/lib/mock-data/cash";
import { MONTHLY_BURN_ESTIMATE, CASH_ESTIMATE } from "@/lib/operating-model/constants";
import { AlertTriangle, Zap, Activity, CheckSquare } from "lucide-react";

const state     = getOperatingState();
const actions   = getActionQueue();
const milestone = getMilestoneProgress();
const pipeline  = calcPipeline();
const closingNow = getPipelineThisMonth();
const revenue   = getRevenueQualitySignals();
const runway    = CASH_ESTIMATE / Math.max(1, MONTHLY_BURN_ESTIMATE - REVENUE.currentMRR);

// Sparkline data from MRR history
const mrrSparkline = mockRevenueData.mrrHistory.map(d => d.mrr);
const burnSparkline = mockCashData.burnHistory.map(d => d.burn);
const pipelineSparkline = [28000, 30000, 33000, 37000, 40000, 42000]; // seed trend

// Weekly operating movement (seed estimates)
const weeklyMovement = [
  { label: "New MRR",         value: "+€280",   color: "text-emerald-600", note: "This month" },
  { label: "Churned MRR",     value: "−€80",    color: "text-red-500",     note: "This month" },
  { label: "Pipeline Added",  value: "+€3.2k",  color: "text-blue-600",    note: "Gross ARR" },
  { label: "Meetings Booked", value: "14",       color: "text-gray-800",    note: "This month" },
  { label: "Positive Replies", value: "22",      color: "text-gray-800",    note: "Campaigns" },
  { label: "Cash Movement",   value: "−€6.8k",  color: "text-amber-600",   note: "Net burn est." },
];

// Integration readiness
const INTEGRATIONS = [
  { name: "Stripe",            status: "pending", impact: "MRR, ARR, churn → live" },
  { name: "HubSpot",           status: "pending", impact: "Pipeline, deals → live" },
  { name: "Instantly",         status: "pending", impact: "Campaign attribution → live" },
  { name: "Rabobank CSV",      status: "pending", impact: "Cash, runway → real" },
  { name: "Calendar + Fathom", status: "pending", impact: "Meetings, objections → live" },
];

export default function CommandCenter() {
  return (
    <div className="space-y-5">

      {/* 1. Operating state */}
      <OperatingBrief
        status={state.status}
        headline={state.headline}
        signals={state.signals}
        dataLabel="Seed data"
      />

      {/* 2. Four small multiple sparkline trends */}
      <SmallMultipleTrends
        cols={4}
        items={[
          {
            label: "MRR",
            value: `€${REVENUE.currentMRR.toLocaleString()}`,
            change: "+12.5%",
            positive: true,
            data: mrrSparkline.map(v => ({ v })),
            color: "#0358F1",
          },
          {
            label: "Weighted Pipeline",
            value: `€${pipeline.weightedMRR}/mo`,
            change: `${pipeline.dealCount} deals`,
            positive: true,
            data: pipelineSparkline.map(v => ({ v })),
            color: "#3b82f6",
          },
          {
            label: "Runway",
            value: `${runway.toFixed(1)} mo`,
            change: runway < 6 ? "⚠ Low" : "OK",
            positive: runway >= 6,
            data: [5.8, 5.5, 5.2, 5.0, 4.8, 4.7].map(v => ({ v })),
            color: runway < 6 ? "#f59e0b" : "#10b981",
          },
          {
            label: "Active Clients",
            value: String(REVENUE.activeClients),
            change: "+2 this month",
            positive: true,
            data: [24, 26, 27, 28, 30, 32].map(v => ({ v })),
            color: "#0358F1",
          },
        ]}
      />

      {/* 3. Weekly operating movement */}
      <div className="border border-gray-200 bg-white">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-400" />
            <p className="text-sm font-semibold text-gray-900">Operating Movement — This Month</p>
          </div>
          <DataStatusBadge status="seed" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-gray-100">
          {weeklyMovement.map(item => (
            <div key={item.label} className="px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{item.label}</p>
              <p className={`text-lg font-semibold tabular-nums ${item.color}`}>{item.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{item.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Action queue */}
      <ActionQueue
        actions={actions}
        title="This Week — Deal Actions"
      />

      {/* 5. MRR trajectory + milestone side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartFrame
          title="MRR Trajectory — Last 17 Months"
          question="Is MRR growing consistently toward the €100k ARR milestone?"
          source="Stripe Pending"
          sourceStatus="seed"
          footnote="Reference line at €8,300/mo = €100k ARR. Stripe sync replaces seed data with actuals."
        >
          <AreaTrendChart
            data={mockRevenueData.mrrHistory}
            xKey="month"
            yKey="mrr"
            height={200}
            valueFormatter={(v) => `€${v.toLocaleString()}`}
            referenceValue={8300}
            referenceLabel="€100k ARR"
            tickFormatter={(v) => v.split(" ")[0]}
          />
        </ChartFrame>

        <MilestoneTracker milestone={milestone} />
      </div>

      {/* 6. Revenue signal */}
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

      {/* 7. Pipeline closing this month */}
      {closingNow.length > 0 && (
        <div className="border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold text-gray-900">Closing This Month</p>
            <span className="ml-auto text-xs text-gray-400">
              €{closingNow.reduce((s, d) => s + d.expected_mrr, 0)}/mo if all close
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {closingNow.map(deal => (
              <div key={deal.deal_id} className="flex items-center gap-4 px-5 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{deal.company_name}</p>
                  <p className="text-xs text-gray-400 truncate">{deal.next_step}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{deal.deal_stage}</span>
                <span className="text-xs text-gray-500 flex-shrink-0">{deal.owner}</span>
                <span className="text-sm font-semibold text-[#0358F1] flex-shrink-0">€{deal.expected_mrr}/mo</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Data health panel */}
      <div className="border border-gray-200 bg-white">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-gray-400" />
          <p className="text-sm font-semibold text-gray-900">Data Health — Integration Readiness</p>
        </div>
        <div className="divide-y divide-gray-50">
          {INTEGRATIONS.map(int => (
            <div key={int.name} className="flex items-center gap-4 px-5 py-2.5">
              <span className="h-2 w-2 rounded-full bg-gray-300 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 w-40">{int.name}</span>
              <span className="text-xs text-gray-400 flex-1">{int.impact}</span>
              <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                Pending
              </span>
            </div>
          ))}
          <div className="flex items-center gap-4 px-5 py-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 w-40">Supabase</span>
            <span className="text-xs text-gray-400 flex-1">Database schema → live</span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
              Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
