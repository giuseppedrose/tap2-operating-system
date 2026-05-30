"use client";

import { ChartContainer } from "@/components/charts/ChartContainer";
import { DataStatusBadge } from "@/components/shared/data-status-badge";
import { ExecutiveInsight } from "@/components/shared/executive-insight";
import { mockMeetingsData } from "@/lib/mock-data/meetings";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { TAP2_COLORS, axisStyle, tooltipStyle, gridStyle } from "@/components/charts/chart-theme";
import { CalendarCheck, TrendingUp, Users, CheckCircle } from "lucide-react";

function KpiTile({ label, value, sub, icon }: {
  label: string; value: string; sub?: string; icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        {icon && <div className="text-gray-300">{icon}</div>}
      </div>
    </div>
  );
}

const outcomeConfig: Record<string, { label: string; color: string }> = {
  closed_won: { label: "Closed Won", color: "text-green-700 bg-green-50 border-green-200" },
  proposal_sent: { label: "Proposal Sent", color: "text-blue-700 bg-blue-50 border-blue-200" },
  follow_up: { label: "Follow-up", color: "text-amber-700 bg-amber-50 border-amber-200" },
  closed_lost: { label: "Lost", color: "text-red-700 bg-red-50 border-red-200" },
};

export default function MeetingsPage() {
  return (
    <div className="space-y-6">
      <ExecutiveInsight
        insight="Fathom and Calendar will turn call notes into objection and buying-signal intelligence. Currently all meeting data is seed-based. The top objection in seed data is 'Price too high' — expect this to shift once real transcripts are loaded."
        nextStep="Connect Google Calendar + Fathom to activate real meeting tracking and objection analysis."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiTile
          label="Total Meetings"
          value={mockMeetingsData.totalMeetings.toString()}
          sub="Seed — last 6 months"
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <KpiTile
          label="This Month"
          value={mockMeetingsData.meetingsThisMonth.toString()}
          sub={`${mockMeetingsData.avgMeetingsPerWeek}/week avg`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KpiTile
          label="Show Rate"
          value={`${mockMeetingsData.showRate}%`}
          sub="Booked → attended"
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <KpiTile
          label="Demo → Proposal"
          value={`${mockMeetingsData.demoToProposalRate}%`}
          sub="Demo conversion"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Meeting volume trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartContainer
          title="Meetings per Month"
          question="Is meeting velocity increasing?"
          status="seed"
          statusIntegration="Calendar + Fathom Pending"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockMeetingsData.meetingsByMonth} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="month" {...axisStyle} tickFormatter={(v) => v.split(" ")[0]} />
              <YAxis {...axisStyle} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="booked" fill={TAP2_COLORS.muted} radius={[4, 4, 0, 0]} name="Booked" />
              <Bar dataKey="meetings" fill={TAP2_COLORS.primary} radius={[4, 4, 0, 0]} name="Attended" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer
          title="Meetings by Type"
          question="What mix of meeting types is driving pipeline?"
          status="seed"
        >
          <div className="space-y-3 mt-2">
            {mockMeetingsData.meetingsByType.map((row) => (
              <div key={row.type} className="flex items-center gap-3">
                <span className="w-32 text-xs text-gray-700 truncate">{row.type}</span>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(row.count / mockMeetingsData.totalMeetings) * 100}%`,
                        background: TAP2_COLORS.primary,
                      }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right text-xs font-semibold text-gray-800">{row.count}</span>
                <span className="w-16 text-right text-xs text-gray-400">{row.showRate}% show</span>
              </div>
            ))}
          </div>
        </ChartContainer>
      </div>

      {/* Objections */}
      <ChartContainer
        title="Objection Frequency & Win Rate"
        question="Which objections block conversion most?"
        status="seed"
        statusIntegration="Fathom Pending"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Objection</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Category</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Frequency</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Win Rate</th>
                <th className="py-2 px-3 text-xs font-medium text-gray-500">Win Rate Bar</th>
              </tr>
            </thead>
            <tbody>
              {mockMeetingsData.objections.map((obj) => (
                <tr key={obj.objection} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-2 px-3 text-gray-800 font-medium text-xs">{obj.objection}</td>
                  <td className="py-2 px-3">
                    <span className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">{obj.category}</span>
                  </td>
                  <td className="py-2 px-3 text-right text-gray-600 text-xs">{obj.frequency}×</td>
                  <td className="py-2 px-3 text-right font-semibold text-xs" style={{ color: obj.winRate >= 50 ? TAP2_COLORS.primary : "#dc2626" }}>
                    {obj.winRate}%
                  </td>
                  <td className="py-2 px-3">
                    <div className="h-2 rounded-full bg-gray-100 w-24">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${obj.winRate}%`,
                          background: obj.winRate >= 50 ? TAP2_COLORS.primary : "#dc2626",
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartContainer>

      {/* Buying signals */}
      <ChartContainer
        title="Buying Signals Detected"
        question="What signals predict close?"
        status="seed"
        statusIntegration="Fathom Pending"
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={mockMeetingsData.buyingSignals} layout="vertical" margin={{ left: 12, right: 32 }}>
            <CartesianGrid {...gridStyle} horizontal={false} />
            <XAxis type="number" {...axisStyle} />
            <YAxis type="category" dataKey="signal" {...axisStyle} width={220} />
            <Tooltip {...tooltipStyle} formatter={(v: unknown) => [String(v), "Frequency"]} />
            <Bar dataKey="frequency" fill={TAP2_COLORS.primary} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Recent meetings */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Recent Meetings</h3>
            <p className="text-xs text-gray-400 mt-0.5">Seed records — not real meeting data</p>
          </div>
          <DataStatusBadge status="seed" integration="Fathom Pending" />
        </div>
        <div className="divide-y divide-gray-50">
          {mockMeetingsData.recentMeetings.map((m) => {
            const cfg = outcomeConfig[m.outcome] ?? { label: m.outcome, color: "text-gray-600 bg-gray-50 border-gray-200" };
            return (
              <div key={m.date + m.prospect} className="flex items-start gap-4 px-5 py-3 hover:bg-gray-50/50">
                <div className="text-xs text-gray-400 w-20 flex-shrink-0 pt-0.5">{m.date}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{m.prospect}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.notes}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{m.type}</span>
                <span className={`inline-flex text-xs font-medium border rounded px-2 py-0.5 flex-shrink-0 ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
