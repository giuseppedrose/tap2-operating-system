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
import { MRRAreaChart } from "@/components/charts/MRRAreaChart";
import { mockRevenueData } from "@/lib/mock-data/revenue";
import { MONTHLY_BURN_ESTIMATE, CASH_ESTIMATE } from "@/lib/operating-model/constants";
import { AlertTriangle, Zap } from "lucide-react";

// Computed once at module level — deterministic from seed
const state = getOperatingState();
const actions = getActionQueue();
const milestone = getMilestoneProgress();
const pipeline = calcPipeline();
const closingNow = getPipelineThisMonth();
const revenue = getRevenueQualitySignals();
const runway = CASH_ESTIMATE / Math.max(1, MONTHLY_BURN_ESTIMATE - REVENUE.currentMRR);

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

      {/* 2. Three business signals */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Revenue */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Revenue</p>
          <p className="text-3xl font-semibold tracking-tight text-gray-900">€{REVENUE.currentMRR.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-0.5">MRR · €{REVENUE.arr.toLocaleString()} ARR</p>
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Active clients</span>
              <span className="font-medium text-gray-700">{REVENUE.activeClients}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">ARPA</span>
              <span className="font-medium text-gray-700">€{REVENUE.arpa}/mo</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">MoM growth</span>
              <span className="font-medium text-emerald-600">+12.5%</span>
            </div>
          </div>
          <div className="mt-3">
            <DataStatusBadge status="seed" integration="Stripe Pending" />
          </div>
        </div>

        {/* Pipeline */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Pipeline</p>
          <p className="text-3xl font-semibold tracking-tight text-gray-900">€{pipeline.weightedMRR.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-0.5">Weighted MRR · €{(pipeline.totalGross / 1000).toFixed(0)}k gross</p>
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Closing this month</span>
              <span className="font-medium text-gray-700">{closingNow.length} deals</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Open deals</span>
              <span className="font-medium text-gray-700">{pipeline.dealCount}</span>
            </div>
            {pipeline.staleCount > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-amber-600">Stale / at risk</span>
                <span className="font-medium text-amber-700">{pipeline.staleCount} deals</span>
              </div>
            )}
          </div>
          <div className="mt-3">
            <DataStatusBadge status="seed" integration="HubSpot Pending" />
          </div>
        </div>

        {/* Cash */}
        <div className={`rounded-xl border bg-white p-5 ${runway < 4 ? "border-red-200" : runway < 6 ? "border-amber-200" : "border-gray-200"}`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Cash & Runway</p>
          <p className={`text-3xl font-semibold tracking-tight ${runway < 4 ? "text-red-600" : runway < 6 ? "text-amber-600" : "text-gray-900"}`}>
            {runway.toFixed(1)} mo
          </p>
          <p className="text-sm text-gray-400 mt-0.5">€{CASH_ESTIMATE.toLocaleString()} cash · €{MONTHLY_BURN_ESTIMATE.toLocaleString()} burn</p>
          {runway < 6 && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              Below 6-month threshold
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Net burn</span>
              <span className="font-medium text-gray-700">€{(MONTHLY_BURN_ESTIMATE - REVENUE.currentMRR).toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">MRR covering burn</span>
              <span className="font-medium text-gray-700">{((REVENUE.currentMRR / MONTHLY_BURN_ESTIMATE) * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div className="mt-3">
            <DataStatusBadge status="manual" integration="Rabobank CSV Pending" />
          </div>
        </div>
      </div>

      {/* 3. Action queue */}
      <ActionQueue
        actions={actions}
        title="This Week — Deal Actions"
      />

      {/* 4. Milestone + MRR chart side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MilestoneTracker milestone={milestone} />

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">MRR Trajectory</p>
            <DataStatusBadge status="seed" integration="Stripe Pending" />
          </div>
          <MRRAreaChart
            data={mockRevenueData.mrrHistory}
            height={180}
            referenceValue={8300}
            referenceLabel="€100k ARR"
          />
        </div>
      </div>

      {/* 5. Revenue signal */}
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

      {/* 6. Pipeline closing this month */}
      {closingNow.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold text-gray-900">Closing This Month</p>
            <span className="ml-auto text-xs text-gray-400">
              €{closingNow.reduce((s, d) => s + d.expected_mrr, 0)}/mo if all close
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {closingNow.map(deal => (
              <div key={deal.deal_id} className="flex items-center gap-4 px-5 py-3">
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
    </div>
  );
}
