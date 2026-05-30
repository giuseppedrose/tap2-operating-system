"use client";

import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DataSourceBadge } from "@/components/shared/data-source-badge";
import { LIFECYCLE_STAGES, CUSTOMERS, ACTIVE_CUSTOMERS } from "@/lib/mock-data/connected";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Users, RefreshCw, Clock, Target } from "lucide-react";

const BLUE = "#0358F1";

// Compute source attribution from CUSTOMERS
const sourceCounts: Record<string, { count: number; mrr: number }> = {};
for (const c of ACTIVE_CUSTOMERS) {
  if (!sourceCounts[c.source]) sourceCounts[c.source] = { count: 0, mrr: 0 };
  sourceCounts[c.source].count++;
  sourceCounts[c.source].mrr += c.mrr;
}
const sourceData = Object.entries(sourceCounts)
  .map(([name, v]) => ({ name, count: v.count, mrr: v.mrr }))
  .sort((a, b) => b.mrr - a.mrr);

// Compute partner attribution from CUSTOMERS
const partnerCounts: Record<string, { count: number; mrr: number }> = {};
for (const c of ACTIVE_CUSTOMERS) {
  if (!partnerCounts[c.partner]) partnerCounts[c.partner] = { count: 0, mrr: 0 };
  partnerCounts[c.partner].count++;
  partnerCounts[c.partner].mrr += c.mrr;
}
const partnerData = Object.entries(partnerCounts)
  .map(([name, v]) => ({ name, count: v.count, mrr: v.mrr }))
  .sort((a, b) => b.mrr - a.mrr);

// Conversion between consecutive stages
const conversionRows = LIFECYCLE_STAGES.slice(0, 8).map((stage, i) => {
  const prev = i > 0 ? LIFECYCLE_STAGES[i - 1] : null;
  const convRate = prev ? Math.round((stage.count / prev.count) * 100) : 100;
  return {
    from: prev?.stage ?? '—',
    to: stage.stage,
    count: stage.count,
    conversion: convRate,
    avgDays: stage.avgDaysInStage,
    isDropoff: convRate < 40,
  };
}).filter((_, i) => i > 0);

export default function LifecyclePage() {
  const maxCount = LIFECYCLE_STAGES[0].count;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Customer Lifecycle</h1>
          <p className="text-sm text-gray-500 mt-0.5">Full funnel from lead to active customer</p>
        </div>
        <DataSourceBadge status="mock" />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Lead-to-Customer Rate"
          value="4.2%"
          subvalue="13 / 312 leads"
          icon={<Target className="h-5 w-5" />}
        />
        <KpiCard
          title="Avg Sales Cycle"
          value="47 days"
          subvalue="lead to close"
          icon={<Clock className="h-5 w-5" />}
        />
        <KpiCard
          title="Biggest Drop-off"
          value="40%"
          subvalue="Lead → Contacted"
          icon={<Users className="h-5 w-5" />}
        />
        <KpiCard
          title="Trial-to-Customer"
          value="93%"
          subvalue="13 / 14 trials"
          icon={<RefreshCw className="h-5 w-5" />}
        />
      </div>

      {/* Funnel Visualization */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-base font-semibold text-gray-900">Lifecycle Funnel</h2>
          <DataSourceBadge status="mock" />
        </div>
        <div className="space-y-2">
          {LIFECYCLE_STAGES.map((stage, i) => {
            const pct = Math.round((stage.count / maxCount) * 100);
            const prev = i > 0 ? LIFECYCLE_STAGES[i - 1] : null;
            const convRate = prev ? Math.round((stage.count / prev.count) * 100) : 100;
            const isDropoff = prev && convRate < 40;
            const isAtRisk = stage.stage === 'At-Risk' || stage.stage === 'Churned';
            const barColor = isAtRisk ? '#ef4444' : isDropoff ? '#f59e0b' : BLUE;

            return (
              <div key={stage.stage} className="flex items-center gap-3">
                <div className="w-32 text-xs text-gray-600 font-medium text-right flex-shrink-0 truncate">
                  {stage.stage}
                </div>
                <div className="flex-1 h-7 bg-gray-50 rounded-lg overflow-hidden relative">
                  <div
                    className="h-7 rounded-lg flex items-center pl-3 transition-all"
                    style={{ width: `${Math.max(pct, 3)}%`, background: barColor, opacity: 0.85 }}
                  >
                    <span className="text-white text-xs font-bold">{stage.count}</span>
                  </div>
                </div>
                <div className="w-16 text-right flex-shrink-0">
                  {i > 0 && (
                    <span className={`text-xs font-semibold ${isDropoff ? 'text-amber-600' : 'text-gray-500'}`}>
                      {convRate}%
                    </span>
                  )}
                </div>
                <div className="w-16 text-right flex-shrink-0 text-xs text-gray-400">
                  {stage.avgDaysInStage > 0 ? `${stage.avgDaysInStage}d` : '—'}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-6 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />Drop-off (&lt;40% conv.)</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: BLUE }} />Active stages</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400" />At-risk / Churned</span>
          <span className="ml-auto">Last col: conversion rate | Rightmost: avg days in stage</span>
        </div>
      </div>

      {/* Conversion Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">Stage Conversion Detail</h2>
          <DataSourceBadge status="mock" />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-6 py-3 text-left font-medium">From Stage</th>
              <th className="px-6 py-3 text-left font-medium">To Stage</th>
              <th className="px-6 py-3 text-right font-medium">Count</th>
              <th className="px-6 py-3 text-right font-medium">Conversion</th>
              <th className="px-6 py-3 text-right font-medium">Avg Days</th>
            </tr>
          </thead>
          <tbody>
            {conversionRows.map((row, i) => (
              <tr key={i} className={`border-t border-gray-50 ${row.isDropoff ? 'bg-amber-50/50' : ''}`}>
                <td className="px-6 py-3 text-gray-500">{row.from}</td>
                <td className="px-6 py-3 font-medium text-gray-900">{row.to}</td>
                <td className="px-6 py-3 text-right font-semibold text-gray-900">{row.count}</td>
                <td className="px-6 py-3 text-right">
                  <span className={`font-semibold ${row.isDropoff ? 'text-amber-600' : 'text-green-600'}`}>
                    {row.conversion}%
                  </span>
                </td>
                <td className="px-6 py-3 text-right text-gray-500">{row.avgDays > 0 ? `${row.avgDays} days` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Attribution Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Source Attribution" description="Which channels produce the most customers (from CUSTOMERS data)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sourceData} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={110} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                formatter={(v: unknown, name: unknown) => name === 'mrr' ? [`€${v}`, "MRR"] : [`${v}`, "Clients"]}
              />
              <Bar dataKey="mrr" fill={BLUE} radius={[0, 4, 4, 0]} name="mrr">
                {sourceData.map((_, i) => (
                  <Cell key={i} fill={`rgba(3,88,241,${1 - i * 0.1})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Partner Attribution" description="Which partners close the most customers">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={partnerData} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={90} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                formatter={(v: unknown, name: unknown) => name === 'mrr' ? [`€${v}`, "MRR"] : [`${v}`, "Clients"]}
              />
              <Bar dataKey="mrr" fill="#16a34a" radius={[0, 4, 4, 0]} name="mrr">
                {partnerData.map((_, i) => (
                  <Cell key={i} fill={`rgba(22,163,74,${1 - i * 0.1})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
