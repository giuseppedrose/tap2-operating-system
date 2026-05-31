"use client";

import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import { TrendingUp, DollarSign, Users, Clock, Target } from "lucide-react";
import { calcForecastScenarios, REVENUE } from "@/lib/operating-model/calculations";
import { ExecutiveInsight } from "@/components/shared/executive-insight";
import { DataStatusBadge } from "@/components/shared/data-status-badge";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { axisStyle, tooltipStyle, gridStyle } from "@/components/charts/chart-theme";

const SCENARIO_NAMES = ["Conservative", "Expected", "Aggressive", "Investor"] as const;
type ScenarioName = typeof SCENARIO_NAMES[number];

const SCENARIO_BUTTON_COLORS: Record<ScenarioName, string> = {
  Conservative: "border-gray-400 text-gray-600",
  Expected: "border-blue-500 text-blue-700",
  Aggressive: "border-green-500 text-green-700",
  Investor: "border-amber-500 text-amber-700",
};

const SCENARIO_ACTIVE_COLORS: Record<ScenarioName, string> = {
  Conservative: "bg-gray-100 border-gray-400 text-gray-700",
  Expected: "bg-blue-50 border-blue-500 text-blue-700",
  Aggressive: "bg-green-50 border-green-500 text-green-700",
  Investor: "bg-amber-50 border-amber-500 text-amber-700",
};

export default function ForecastPage() {
  const [selected, setSelected] = useState<ScenarioName>("Expected");
  const scenarios = calcForecastScenarios();

  const selectedScenario = scenarios.find(s => s.name === selected)!;
  const month12 = selectedScenario.months[11];
  const month24 = selectedScenario.months[23];

  // Build multi-line chart data
  const chartData = scenarios[0].months.map((_, i) => {
    const row: Record<string, string | number> = { month: scenarios[0].months[i].month };
    scenarios.forEach(sc => {
      row[sc.name] = sc.months[i].ending_mrr;
    });
    return row;
  });

  // First 12 months of selected scenario for requirements table
  const first12 = selectedScenario.months.slice(0, 12);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Revenue Forecast</h1>
          <p className="text-sm text-gray-500 mt-0.5">24-month scenarios from current baseline</p>
        </div>
        <DataStatusBadge status="seed" />
      </div>

      {/* Executive Insight */}
      <ExecutiveInsight
        insight={`Starting from €${REVENUE.currentMRR}/mo MRR with ${REVENUE.activeClients} clients. Under the Expected scenario, Tap2 reaches €100k ARR in ${selectedScenario.months_to_100k_arr ?? "—"} months and €1M ARR in ${selectedScenario.months_to_1m_arr ?? "—"} months.`}
        nextStep="Validate growth assumptions by tracking monthly new client closes against the forecast."
      />

      {/* Scenario Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500 font-medium">Scenario:</span>
        {SCENARIO_NAMES.map(name => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            className={`rounded-lg border px-4 py-1.5 text-xs font-semibold transition-all ${
              selected === name
                ? SCENARIO_ACTIVE_COLORS[name]
                : `${SCENARIO_BUTTON_COLORS[name]} bg-white hover:bg-gray-50`
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* KPI Tiles for selected scenario */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "Current MRR", value: `€${REVENUE.currentMRR}`, icon: DollarSign, color: "text-blue-600" },
          { label: "Month 12 MRR", value: `€${month12?.ending_mrr ?? 0}`, icon: TrendingUp, color: "text-green-600" },
          { label: "Month 24 MRR", value: `€${month24?.ending_mrr ?? 0}`, icon: TrendingUp, color: "text-purple-600" },
          { label: "Cash Month 24", value: `€${(month24?.cash ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-amber-600" },
          {
            label: "Months to €100k ARR",
            value: selectedScenario.months_to_100k_arr != null ? `${selectedScenario.months_to_100k_arr}mo` : "24+mo",
            icon: Target,
            color: "text-red-500",
          },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              <span className="text-xs text-gray-500">{kpi.label}</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Multi-line Chart */}
      <ChartContainer
        title="MRR Forecast — All Scenarios (24 months)"
        question="When do we reach €100k ARR and €1M ARR?"
        status="seed"
      >
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="month" {...axisStyle} interval={3} />
            <YAxis {...axisStyle} tickFormatter={(v: unknown) => `€${String(v)}`} />
            <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`€${String(v)}`, ""]} />
            <Legend />
            <ReferenceLine y={8300} stroke="#d97706" strokeDasharray="4 4" label={{ value: "€100k ARR", fill: "#d97706", fontSize: 10 }} />
            <ReferenceLine y={83300} stroke="#dc2626" strokeDasharray="4 4" label={{ value: "€1M ARR", fill: "#dc2626", fontSize: 10 }} />
            {scenarios.map(sc => (
              <Line
                key={sc.name}
                type="monotone"
                dataKey={sc.name}
                stroke={sc.color}
                strokeWidth={sc.name === selected ? 3 : 1.5}
                dot={false}
                strokeOpacity={sc.name === selected ? 1 : 0.5}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Requirements Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">
            {selected} Scenario — First 12 Months Requirements
          </p>
          <DataStatusBadge status="seed" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["Month", "Ending MRR", "New Clients", "Closes Needed", "Meetings Needed", "Leads Needed", "Cash", "Runway"].map(h => (
                  <th key={h} className="px-3 py-2 font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {first12.map(m => (
                <tr key={m.month} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-gray-900">{m.month}</td>
                  <td className="px-3 py-2 font-semibold text-gray-900">€{m.ending_mrr}</td>
                  <td className="px-3 py-2 text-gray-700">{m.customers}</td>
                  <td className="px-3 py-2 text-gray-700">{m.closes_needed}</td>
                  <td className="px-3 py-2 text-gray-700">{m.meetings_needed}</td>
                  <td className="px-3 py-2 text-gray-700">{m.leads_needed}</td>
                  <td className="px-3 py-2 text-gray-700">€{m.cash.toLocaleString()}</td>
                  <td className="px-3 py-2 text-gray-700">{m.runway_months}mo</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assumption Cards + Milestones */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Assumptions */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-3">Assumptions — {selected}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "ARPA", value: `€${selectedScenario.arpa}/mo` },
              { label: "Churn Rate", value: `${selectedScenario.churn_rate}%/mo` },
              { label: "Monthly Growth", value: `${Math.round(selectedScenario.monthly_growth_rate * 100)}%` },
              { label: "Closes/Mo Needed", value: String(selectedScenario.new_clients_per_month) },
            ].map(a => (
              <div key={a.label} className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">{a.label}</p>
                <p className="text-base font-semibold text-gray-900 mt-0.5">{a.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-3">Milestone Timeline</p>
          <div className="space-y-3">
            {scenarios.map(sc => (
              <div key={sc.name} className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700 w-28">{sc.name}</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-amber-500" />
                    <span className="text-gray-600">€100k ARR:</span>
                    <span className="font-semibold text-gray-900">
                      {sc.months_to_100k_arr != null ? `${sc.months_to_100k_arr}mo` : "24+mo"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-blue-500" />
                    <span className="text-gray-600">€1M ARR:</span>
                    <span className="font-semibold text-gray-900">
                      {sc.months_to_1m_arr != null ? `${sc.months_to_1m_arr}mo` : "24+mo"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
