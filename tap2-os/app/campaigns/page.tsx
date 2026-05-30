"use client";

import { useState, useEffect } from "react";
import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { mockCampaignsData, campaignSummary, type Campaign } from "@/lib/mock-data/campaigns";
import { fetchCampaigns, type DbCampaign } from "@/lib/supabase/queries";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Mail, MousePointerClick, Calendar, DollarSign } from "lucide-react";

const BLUE = "#0358F1";

const campaignColumns: Column<Campaign>[] = [
  { header: "Campaign", accessor: "name", cell: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
  { header: "Market", accessor: "market" },
  { header: "Owner", accessor: "owner" },
  { header: "Status", accessor: "status", cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Sent", accessor: "emailsSent", cell: (r) => <span>{r.emailsSent.toLocaleString()}</span> },
  { header: "Open Rate", accessor: "openRate", cell: (r) => (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 bg-gray-100 rounded-full">
        <div className="h-1.5 rounded-full" style={{ width: `${r.openRate}%`, background: BLUE }} />
      </div>
      <span className="text-xs text-gray-600">{r.openRate}%</span>
    </div>
  )},
  { header: "Reply Rate", accessor: "replyRate", cell: (r) => <span>{r.replyRate}%</span> },
  { header: "+Reply Rate", accessor: "positiveReplyRate", cell: (r) => <span className="text-green-600 font-medium">{r.positiveReplyRate}%</span> },
  { header: "Meetings", accessor: "meetingsBooked", cell: (r) => <span className="font-semibold">{r.meetingsBooked}</span> },
  { header: "Pipeline", accessor: "pipelineGenerated", cell: (r) => <span className="font-semibold">€{r.pipelineGenerated.toLocaleString()}</span> },
  { header: "MRR Closed", accessor: "mrrClosed", cell: (r) => <span className="font-semibold text-green-600">€{r.mrrClosed}</span> },
];

export default function CampaignsPage() {
  const [liveCampaigns, setLiveCampaigns] = useState<DbCampaign[] | null>(null);

  useEffect(() => {
    fetchCampaigns().then(data => { if (data) setLiveCampaigns(data) });
  }, []);

  const campaignsData: Campaign[] = liveCampaigns
    ? liveCampaigns.map(c => ({
        id: c.id,
        name: c.name,
        market: c.market ?? '',
        segment: c.segment ?? '',
        owner: c.owner ?? '',
        status: c.status as Campaign['status'],
        emailsSent: Number(c.emails_sent),
        openRate: Number(c.open_rate ?? 0),
        replyRate: Number(c.reply_rate ?? 0),
        positiveReplyRate: Number(c.positive_reply_rate ?? 0),
        meetingsBooked: Number(c.meetings_booked),
        demosCompleted: Number(c.demos_completed),
        dealsCreated: Number(c.deals_created),
        pipelineGenerated: Number(c.pipeline_generated ?? 0),
        mrrClosed: Number(c.mrr_closed ?? 0),
        createdAt: c.id,
      }))
    : mockCampaignsData;

  const totalEmailsSent = liveCampaigns
    ? liveCampaigns.reduce((s, c) => s + Number(c.emails_sent), 0)
    : campaignSummary.totalEmailsSent;

  const avgOpenRate = liveCampaigns && liveCampaigns.length > 0
    ? parseFloat((liveCampaigns.reduce((s, c) => s + Number(c.open_rate ?? 0), 0) / liveCampaigns.length).toFixed(1))
    : campaignSummary.avgOpenRate;

  const totalMeetingsBooked = liveCampaigns
    ? liveCampaigns.reduce((s, c) => s + Number(c.meetings_booked), 0)
    : campaignSummary.totalMeetingsBooked;

  const totalMrrClosed = liveCampaigns
    ? liveCampaigns.reduce((s, c) => s + Number(c.mrr_closed ?? 0), 0)
    : campaignSummary.totalMrrClosed;

  const metricsData = campaignsData.map((c) => ({
    name: c.name.length > 20 ? c.name.slice(0, 20) + "…" : c.name,
    openRate: c.openRate,
    replyRate: c.replyRate,
    positiveReplyRate: c.positiveReplyRate,
  }));

  const pipelineData = campaignsData.map((c) => ({
    name: c.name.length > 20 ? c.name.slice(0, 20) + "…" : c.name,
    pipeline: c.pipelineGenerated,
    mrr: c.mrrClosed,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Emails Sent" value={totalEmailsSent.toLocaleString()} icon={<Mail className="h-5 w-5" />} />
        <KpiCard title="Avg Open Rate" value={`${avgOpenRate}%`} subvalue="all campaigns" icon={<MousePointerClick className="h-5 w-5" />} />
        <KpiCard title="Meetings Booked" value={totalMeetingsBooked} icon={<Calendar className="h-5 w-5" />} />
        <KpiCard title="MRR Closed" value={`€${totalMrrClosed}`} icon={<DollarSign className="h-5 w-5" />} />
      </div>

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

      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">All Campaigns</h2>
        <DataTable columns={campaignColumns} data={campaignsData} />
      </div>
    </div>
  );
}
