"use client";

import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { InsightCard } from "@/components/shared/insight-card";
import { mockCampaignsData, campaignSummary, type Campaign } from "@/lib/mock-data/campaigns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Mail, MousePointerClick, Calendar, DollarSign } from "lucide-react";

const BLUE = "#0358F1";

// Efficiency metrics per campaign
interface CampaignWithEfficiency extends Campaign {
  repliesPer100: number;
  meetingsPer100: number;
  pipelinePer1000: number;
}

const enrichedCampaigns: CampaignWithEfficiency[] = mockCampaignsData.map(c => ({
  ...c,
  repliesPer100: Math.round((c.replyRate)),
  meetingsPer100: c.emailsSent > 0 ? Math.round((c.meetingsBooked / c.emailsSent) * 100 * 10) / 10 : 0,
  pipelinePer1000: c.emailsSent > 0 ? Math.round((c.pipelineGenerated / c.emailsSent) * 1000) : 0,
}));

const campaignColumns: Column<CampaignWithEfficiency>[] = [
  { header: "Campaign", accessor: "name", cell: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
  { header: "Market", accessor: "market" },
  { header: "Owner", accessor: "owner" },
  { header: "Status", accessor: "status", cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Sent", accessor: "emailsSent", cell: (r) => <span>{r.emailsSent.toLocaleString()}</span> },
  { header: "Reply/100", accessor: "repliesPer100", cell: (r) => <span className="font-medium">{r.repliesPer100}%</span> },
  { header: "Mtg/100", accessor: "meetingsPer100", cell: (r) => <span className="font-medium text-green-600">{r.meetingsPer100}</span> },
  { header: "Pipeline/1k", accessor: "pipelinePer1000", cell: (r) => <span className="font-medium">€{r.pipelinePer1000}</span> },
  { header: "+Reply Rate", accessor: "positiveReplyRate", cell: (r) => <span className="text-green-600 font-medium">{r.positiveReplyRate}%</span> },
  { header: "Meetings", accessor: "meetingsBooked", cell: (r) => <span className="font-semibold">{r.meetingsBooked}</span> },
  { header: "Pipeline", accessor: "pipelineGenerated", cell: (r) => <span className="font-semibold">€{r.pipelineGenerated.toLocaleString()}</span> },
  { header: "MRR Closed", accessor: "mrrClosed", cell: (r) => <span className="font-semibold text-green-600">€{r.mrrClosed}</span> },
];

export default function CampaignsPage() {
  const metricsData = mockCampaignsData.map((c) => ({
    name: c.name.length > 20 ? c.name.slice(0, 20) + "…" : c.name,
    openRate: c.openRate,
    replyRate: c.replyRate,
    positiveReplyRate: c.positiveReplyRate,
  }));

  const pipelineData = mockCampaignsData.map((c) => ({
    name: c.name.length > 20 ? c.name.slice(0, 20) + "…" : c.name,
    pipeline: c.pipelineGenerated,
    mrr: c.mrrClosed,
  }));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Emails Sent" value={campaignSummary.totalEmailsSent.toLocaleString()} icon={<Mail className="h-5 w-5" />} />
        <KpiCard title="Avg Open Rate" value={`${campaignSummary.avgOpenRate}%`} subvalue="all campaigns" icon={<MousePointerClick className="h-5 w-5" />} />
        <KpiCard title="Meetings Booked" value={campaignSummary.totalMeetingsBooked} icon={<Calendar className="h-5 w-5" />} />
        <KpiCard title="MRR Closed" value={`€${campaignSummary.totalMrrClosed}`} icon={<DollarSign className="h-5 w-5" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Email Engagement by Campaign" description="Open, reply and positive reply rates">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={metricsData} margin={{ top: 4, right: 4, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`${v}%`]} />
              <Bar dataKey="openRate" fill="#bfdbfe" radius={[4, 4, 0, 0]} name="Open Rate" />
              <Bar dataKey="replyRate" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Reply Rate" />
              <Bar dataKey="positiveReplyRate" fill={BLUE} radius={[4, 4, 0, 0]} name="+Reply Rate" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Pipeline & MRR by Campaign" description="Revenue generated per campaign">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={pipelineData} margin={{ top: 4, right: 4, bottom: 40, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`€${Number(v).toLocaleString()}`]} />
              <Bar dataKey="pipeline" fill="#bfdbfe" radius={[4, 4, 0, 0]} name="Pipeline" />
              <Bar dataKey="mrr" fill={BLUE} radius={[4, 4, 0, 0]} name="MRR Closed" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Campaign Insights */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">Campaign Insights</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InsightCard
            type="warning"
            title="LinkedIn NL: Reply rate ≠ Meetings"
            description="9.6% reply rate but only 6 meetings booked. Check the booking process — are replies converting to calendar slots?"
          />
          <InsightCard
            type="positive"
            title="NL Restaurant Q4: Best Overall"
            description="3.8% positive reply rate, €356 MRR closed. This is the benchmark campaign. Replicate for other markets."
          />
        </div>
      </div>

      {/* Campaigns Table with efficiency metrics */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">All Campaigns — with Efficiency Metrics</h2>
        <DataTable columns={campaignColumns} data={enrichedCampaigns} />
      </div>
    </div>
  );
}
