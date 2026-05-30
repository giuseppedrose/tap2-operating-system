"use client";

import { ChartContainer } from "@/components/charts/ChartContainer";
import { DataStatusBadge } from "@/components/shared/data-status-badge";
import { ExecutiveInsight } from "@/components/shared/executive-insight";
import { mockLifecycleData } from "@/lib/mock-data/lifecycle";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList, Cell, type LabelProps,
} from "recharts";
import { TAP2_COLORS, axisStyle, tooltipStyle, gridStyle } from "@/components/charts/chart-theme";
import { TrendingDown } from "lucide-react";

const FUNNEL_COLORS = [
  TAP2_COLORS.primary,
  "#3b6ff5",
  "#5B8BF5",
  "#7EA3F7",
  "#A0B4F9",
  "#C2CBFB",
];

function KpiTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default function LifecyclePage() {
  const firstStage = mockLifecycleData.funnelStages[0];
  const lastStage = mockLifecycleData.funnelStages[mockLifecycleData.funnelStages.length - 1];
  const overallRate = ((lastStage.count / firstStage.count) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <ExecutiveInsight
        insight="Lifecycle data shows where prospects drop off between reply, meeting, proposal, and close. The biggest drop today is Contact → Reply (60% fall-off), which is an outbound messaging challenge."
        nextStep="Connect HubSpot to replace seed funnel data with real pipeline stage conversions."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiTile label="Total Contacted" value={firstStage.count.toLocaleString()} sub="Seed — last 6 months" />
        <KpiTile label="Closed Won" value={lastStage.count.toLocaleString()} sub={`${overallRate}% of contacted`} />
        <KpiTile label="Reply Rate" value="40%" sub="Contact → Reply" />
        <KpiTile label="Close Rate" value={`${overallRate}%`} sub="Contact → Close" />
      </div>

      {/* Funnel */}
      <ChartContainer
        title="Sales Conversion Funnel"
        question="Where does pipeline get stuck?"
        status="seed"
        statusIntegration="HubSpot Pending"
      >
        <ResponsiveContainer width="100%" height={320}>
          <FunnelChart>
            <Tooltip
              {...tooltipStyle}
              formatter={(value: unknown) => [String(value)]}
            />
            <Funnel
              dataKey="count"
              data={mockLifecycleData.funnelStages.map((s, i) => ({
                ...s,
                name: s.stage,
                fill: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
              }))}
              isAnimationActive
            >
              <LabelList
                position="center"
                content={(props: LabelProps) => {
                  const { value, name, x, y, width, height } = props;
                  const xN = Number(x ?? 0);
                  const yN = Number(y ?? 0);
                  const wN = Number(width ?? 0);
                  const hN = Number(height ?? 0);
                  return (
                    <text
                      x={xN + wN / 2}
                      y={yN + hN / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize={12}
                      fontWeight={600}
                    >
                      {String(name ?? "")} — {String(value ?? "")}
                    </text>
                  );
                }}
              />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Drop-off analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer
          title="Stage Drop-off Rates"
          question="At which stage is the most pipeline lost?"
          status="seed"
        >
          <div className="space-y-3">
            {mockLifecycleData.stageDropoff.map((item) => (
              <div key={item.from} className="flex items-center gap-3">
                <TrendingDown className="h-4 w-4 text-gray-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 truncate">{item.from}</span>
                    <span className="font-semibold text-red-500 flex-shrink-0 ml-2">−{item.dropoff}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-red-400"
                      style={{ width: `${item.dropoff}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{item.absolute} leads lost</p>
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>

        <ChartContainer
          title="Average Time per Stage"
          question="Which stage slows the sales cycle most?"
          status="seed"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockLifecycleData.avgDaysPerStage} layout="vertical" margin={{ left: 12, right: 12 }}>
              <CartesianGrid {...gridStyle} horizontal={false} />
              <XAxis type="number" {...axisStyle} tickFormatter={(v) => `${v}d`} />
              <YAxis type="category" dataKey="stage" {...axisStyle} width={130} />
              <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`${v} days`, "Avg time"]} />
              <Bar dataKey="days" fill={TAP2_COLORS.primary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Source performance */}
      <ChartContainer
        title="Source Conversion Performance"
        question="Which acquisition source converts to closed won?"
        status="seed"
        statusIntegration="HubSpot Pending"
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={mockLifecycleData.sourcePerformance} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="source" {...axisStyle} />
            <YAxis {...axisStyle} tickFormatter={(v) => `${v}%`} />
            <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`${v}%`, "Close rate"]} />
            <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
              {mockLifecycleData.sourcePerformance.map((_, i) => (
                <Cell key={i} fill={i === 0 ? TAP2_COLORS.primary : i === 1 ? TAP2_COLORS.secondary : TAP2_COLORS.muted} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Monthly cohort */}
      <ChartContainer
        title="Monthly Cohort Conversion"
        question="Is overall conversion rate improving over time?"
        status="seed"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Month</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Contacted</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Closed</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Rate</th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500">Trend</th>
              </tr>
            </thead>
            <tbody>
              {mockLifecycleData.cohortConversion.map((row, i) => (
                <tr key={row.month} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-2 px-3 text-gray-700 font-medium text-xs">{row.month}</td>
                  <td className="py-2 px-3 text-right text-gray-600 text-xs">{row.contacted}</td>
                  <td className="py-2 px-3 text-right text-gray-800 font-semibold text-xs">{row.closed}</td>
                  <td className="py-2 px-3 text-right font-semibold text-xs" style={{ color: TAP2_COLORS.primary }}>{row.rate}%</td>
                  <td className="py-2 px-3">
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${Math.min(row.rate * 6, 100)}%`, background: TAP2_COLORS.primary }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartContainer>
    </div>
  );
}
