"use client";

import { ChartContainer } from "@/components/charts/ChartContainer";
import { DataStatusBadge } from "@/components/shared/data-status-badge";
import { ExecutiveInsight } from "@/components/shared/executive-insight";
import { mockCashData, type BankTransaction } from "@/lib/mock-data/cash";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from "recharts";
import { TAP2_COLORS, axisStyle, tooltipStyle, gridStyle } from "@/components/charts/chart-theme";
import { formatCurrency } from "@/components/charts/formatters";
import { Wallet, TrendingDown, AlertTriangle, CreditCard, Upload, CheckCircle, Clock } from "lucide-react";
import { HorizontalRankChart } from "@/components/charts/HorizontalRankChart";

function ConfidenceBadge({ confidence }: { confidence: BankTransaction["confidence"] }) {
  if (confidence === "auto") return (
    <span className="inline-flex items-center gap-1 rounded text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5">
      <CheckCircle className="h-3 w-3" /> Auto
    </span>
  );
  if (confidence === "review") return (
    <span className="inline-flex items-center gap-1 rounded text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5">
      <Clock className="h-3 w-3" /> Review
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5">
      Manual
    </span>
  );
}

export default function CashPage() {
  const runwayStatus = mockCashData.runway < 3 ? "danger" : mockCashData.runway < 6 ? "warning" : "ok";
  const grossBurn = mockCashData.monthlyBurn;
  const netBurn = grossBurn - 1401; // MRR offsets burn

  return (
    <div className="space-y-6">
      {/* Seed Data Warning */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Seed Data Mode — Not Real Bank Data</p>
          <p className="mt-0.5 text-sm text-amber-700">
            This page currently uses seed data. Upload Rabobank CSV files or connect a bank API to activate real cash tracking. Numbers shown do not reflect Tap2&apos;s actual bank balance or transactions.
          </p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <DataStatusBadge status="manual" integration="Rabobank CSV Pending" />
          </div>
        </div>
      </div>

      <ExecutiveInsight
        insight="Rabobank CSV upload is required before runway and burn data can be treated as real. Until then, all cash metrics are seed-data estimates based on typical early-stage SaaS burn profiles."
        nextStep="Upload monthly Rabobank CSV exports to replace seed data with real transactions."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bank Balance</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">€38,500</p>
              <p className="mt-1 text-xs text-amber-600 font-medium">Seed estimate</p>
            </div>
            <Wallet className="h-5 w-5 text-gray-300" />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Monthly Burn</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">€8,200</p>
              <p className="mt-1 text-xs text-amber-600 font-medium">Seed estimate</p>
            </div>
            <TrendingDown className="h-5 w-5 text-gray-300" />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Runway</p>
              <p className={`mt-2 text-2xl font-bold ${runwayStatus === "danger" ? "text-red-600" : runwayStatus === "warning" ? "text-amber-600" : "text-gray-900"}`}>
                {mockCashData.runway} mo
              </p>
              <p className="mt-1 text-xs text-amber-600 font-medium">
                {runwayStatus === "danger" ? "⚠ Critical (seed)" : runwayStatus === "warning" ? "↓ Low (seed)" : "Seed estimate"}
              </p>
            </div>
            <AlertTriangle className={`h-5 w-5 ${runwayStatus !== "ok" ? "text-amber-400" : "text-gray-300"}`} />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">MRR (Seed)</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">€1,400</p>
              <p className="mt-1 text-xs text-amber-600 font-medium">~€6,800 net burn</p>
            </div>
            <CreditCard className="h-5 w-5 text-gray-300" />
          </div>
        </div>
      </div>

      {/* Data Source Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Data Source Status</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">Current mode</p>
            <div className="flex items-center gap-2">
              <DataStatusBadge status="seed" />
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">Required input</p>
            <p className="text-xs font-medium text-gray-700">Rabobank CSV export (monthly)</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500 mb-1">Live API</p>
            <p className="text-xs font-medium text-gray-700">Not connected</p>
          </div>
        </div>
      </div>

      {/* Planned upload workflow */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Upload className="h-4 w-4 text-blue-500" />
          Planned CSV Upload Workflow
        </h3>
        <div className="flex flex-wrap gap-2 items-center">
          {[
            "1. Upload Rabobank CSV",
            "2. Parse transactions",
            "3. Auto-categorize",
            "4. Review flagged items",
            "5. Confirm monthly burn",
            "6. Update runway",
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-300">→</span>}
              <span className="rounded-full bg-white border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700">
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartContainer
            title="Burn vs Revenue"
            question="Is net burn improving as MRR grows?"
            status="seed"
            statusIntegration="Rabobank CSV Pending"
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={mockCashData.burnHistory} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TAP2_COLORS.primary} stopOpacity={0.1} />
                    <stop offset="95%" stopColor={TAP2_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="month" {...axisStyle} tickFormatter={(v) => v.split(" ")[0]} />
                <YAxis {...axisStyle} tickFormatter={(v) => `€${v}`} />
                <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`€${Number(v).toLocaleString()}`]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="burn" stroke="#ef4444" strokeWidth={2} fill="url(#burnGrad)" dot={false} name="Burn" />
                <Area type="monotone" dataKey="revenue" stroke={TAP2_COLORS.primary} strokeWidth={2} fill="url(#revGrad)" dot={false} name="MRR" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <ChartContainer
          title="Expenses by Category"
          question="Where is cash being spent?"
          status="seed"
        >
          <HorizontalRankChart
            data={mockCashData.expensesByCategory.map(e => ({
              label: e.category,
              value: e.amount,
              formatted: `€${e.amount}`,
            }))}
            height={260}
          />
        </ChartContainer>
      </div>

      {/* Expense breakdown bars */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Expense Breakdown — Monthly Seed Estimate</p>
          <DataStatusBadge status="seed" />
        </div>
        <div className="space-y-3">
          {mockCashData.expensesByCategory.map((cat) => (
            <div key={cat.category} className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-sm flex-shrink-0" style={{ background: TAP2_COLORS.primary }} />
              <span className="flex-1 text-sm text-gray-700">{cat.category}</span>
              <div className="flex-1 max-w-xs">
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full" style={{ width: `${cat.percentage}%`, background: TAP2_COLORS.primary }} />
                </div>
              </div>
              <span className="w-16 text-right text-sm font-semibold text-gray-900">{formatCurrency(cat.amount)}</span>
              <span className="w-10 text-right text-xs text-gray-400">{cat.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Sample Transaction Classification</h2>
            <p className="text-xs text-gray-400 mt-0.5">Seed data only — not real bank transactions. Upload Rabobank CSV to replace.</p>
          </div>
          <DataStatusBadge status="seed" integration="Rabobank CSV Pending" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Description</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockCashData.transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-500 text-xs">{tx.date}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800 text-xs">{tx.description}</div>
                    <div className="text-gray-400 text-xs">{tx.counterparty}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700">{tx.category}</div>
                    <div className="text-xs text-gray-400">{tx.subcategory}</div>
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold text-xs ${tx.amount >= 0 ? "text-green-600" : "text-gray-800"}`}>
                    {tx.amount >= 0 ? "+" : ""}€{Math.abs(tx.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ConfidenceBadge confidence={tx.confidence} />
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
