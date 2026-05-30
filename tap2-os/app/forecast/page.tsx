"use client";

import { useState } from "react";
import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { mockForecastData, type ForecastMonth } from "@/lib/mock-data/forecast";
import { ARR } from "@/lib/mock-data/connected";
import { MilestoneCard } from "@/components/shared/milestone-card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { BarChart3, TrendingUp, Wallet, Users } from "lucide-react";

const BLUE = "#0358F1";

const forecastColumns: Column<ForecastMonth & { id: number }>[] = [
  { header: "Month", accessor: "month" },
  { header: "New Customers", accessor: "newCustomers" },
  { header: "Churned", accessor: "churnedCustomers" },
  { header: "Total Customers", accessor: "totalCustomers", cell: (r) => <span className="font-semibold">{r.totalCustomers}</span> },
  { header: "MRR", accessor: "expectedMrr", cell: (r) => <span className="font-semibold text-blue-600">€{r.expectedMrr.toLocaleString()}</span> },
  { header: "ARR", accessor: "expectedArr", cell: (r) => <span>€{r.expectedArr.toLocaleString()}</span> },
  { header: "Cash", accessor: "expectedCash", cell: (r) => <span className={r.expectedCash < 5000 ? "font-semibold text-red-500" : "font-semibold text-green-600"}>€{r.expectedCash.toLocaleString()}</span> },
];

export default function ForecastPage() {
  const [activeScenario, setActiveScenario] = useState("Expected");

  const selectedScenario = mockForecastData.scenarios.find((s) => s.name === activeScenario)!;

  // Build combined chart data for all 3 scenarios
  const combinedData = mockForecastData.scenarios[0].months.map((_, i) => {
    const point: Record<string, number | string> = {
      month: mockForecastData.scenarios[0].months[i].month,
    };
    mockForecastData.scenarios.forEach((s) => {
      point[s.name] = s.months[i].expectedMrr;
    });
    return point;
  });

  const cashData = mockForecastData.scenarios[0].months.map((_, i) => {
    const point: Record<string, number | string> = {
      month: mockForecastData.scenarios[0].months[i].month,
    };
    mockForecastData.scenarios.forEach((s) => {
      point[s.name] = s.months[i].expectedCash;
    });
    return point;
  });

  const lastMonth = selectedScenario.months[selectedScenario.months.length - 1];
  const month12 = selectedScenario.months[11];

  // Find month when ARR reaches 100k
  const expectedScenario2 = mockForecastData.scenarios.find((s) => s.name === "Expected")!;
  const month100k = expectedScenario2.months.find(m => m.expectedArr >= 100000);
  const customersNeeded = Math.ceil(100000 / (12 * 89)); // €89/mo average

  return (
    <div className="space-y-6">
      {/* Milestone Tracker */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-gray-900">Milestone Tracker</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MilestoneCard label="Path to €100k ARR" current={ARR} target={100000} />
          <MilestoneCard label="Path to €1M ARR" current={ARR} target={1000000} />
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-2">Estimated €100k ARR Month</p>
            <p className="text-xl font-bold text-blue-600">{month100k ? month100k.month : 'Beyond 24mo'}</p>
            <p className="text-xs text-gray-400 mt-1">Expected scenario</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-2">Customers Needed</p>
            <p className="text-xl font-bold text-gray-900">{customersNeeded}</p>
            <p className="text-xs text-gray-400 mt-1">at €89/mo avg for €100k ARR</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Current MRR" value={`€${mockForecastData.currentMrr.toLocaleString()}`} subvalue="starting point" icon={<TrendingUp className="h-5 w-5" />} />
        <KpiCard title="Month 12 MRR" value={`€${month12.expectedMrr.toLocaleString()}`} subvalue={activeScenario} icon={<BarChart3 className="h-5 w-5" />} />
        <KpiCard title="Month 24 MRR" value={`€${lastMonth.expectedMrr.toLocaleString()}`} subvalue={activeScenario} icon={<TrendingUp className="h-5 w-5" />} />
        <KpiCard
          title="Cash at Month 24"
          value={`€${lastMonth.expectedCash.toLocaleString()}`}
          subvalue={activeScenario}
          icon={<Wallet className="h-5 w-5" />}
        />
      </div>

      {/* Scenario selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Scenario:</span>
        {mockForecastData.scenarios.map((s) => (
          <button
            key={s.name}
            onClick={() => setActiveScenario(s.name)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border`}
            style={
              activeScenario === s.name
                ? { background: s.color, color: "white", borderColor: s.color }
                : { background: "white", color: "#374151", borderColor: "#e5e7eb" }
            }
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="MRR Forecast — All Scenarios" description="24-month projection">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={combinedData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => v.split(" ")[0]} interval={3} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`€${Number(v).toLocaleString()}`]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {mockForecastData.scenarios.map((s) => (
                <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cash Runway — All Scenarios" description="Projected cash balance over 24 months">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={cashData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => v.split(" ")[0]} interval={3} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`€${Number(v).toLocaleString()}`]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {mockForecastData.scenarios.map((s) => (
                <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Assumptions */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {mockForecastData.scenarios.map((s) => (
          <div key={s.name} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ background: s.color }} />
              <span className="text-sm font-semibold text-gray-900">{s.name}</span>
            </div>
            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex justify-between"><span>New/month:</span><span className="font-medium text-gray-700">{s.assumptions.monthlyNewCustomers}</span></div>
              <div className="flex justify-between"><span>Churn:</span><span className="font-medium text-gray-700">{s.assumptions.monthlyChurnPct}%</span></div>
              <div className="flex justify-between"><span>Monthly burn:</span><span className="font-medium text-gray-700">€{s.assumptions.monthlyBurn.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Avg MRR/client:</span><span className="font-medium text-gray-700">€{s.assumptions.avgMrrPerCustomer}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly detail table */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          Monthly Detail — {activeScenario} Scenario
        </h2>
        <DataTable
          columns={forecastColumns}
          data={selectedScenario.months.map((m, i) => ({ ...m, id: i }))}
        />
      </div>
    </div>
  );
}
