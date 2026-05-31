"use client";

import { SEED_CAMPAIGNS } from "@/lib/operating-model/seed";
import { getCampaignSummary } from "@/lib/operating-model/calculations";
import { OperatingBrief } from "@/components/operating/OperatingBrief";
import { BoardMetricCard, BoardMetricRow } from "@/components/analytics/BoardMetricCard";
import { ExecutiveSection } from "@/components/analytics/ExecutiveSection";
import { OperatingInsight } from "@/components/analytics/OperatingInsight";
import { SourceOfTruthBadge } from "@/components/analytics/SourceOfTruthBadge";

// ─── Funnel derivation ────────────────────────────────────────────────────────

function buildFunnel() {
  const totalSent     = SEED_CAMPAIGNS.reduce((s, c) => s + c.emails_sent, 0);
  const totalDelivered = SEED_CAMPAIGNS.reduce((s, c) => s + c.delivered, 0);
  const avgOpenRate   = SEED_CAMPAIGNS.reduce((s, c) => s + c.open_rate, 0) / SEED_CAMPAIGNS.length;
  const avgReplyRate  = SEED_CAMPAIGNS.reduce((s, c) => s + c.reply_rate, 0) / SEED_CAMPAIGNS.length;
  const avgPosReply   = SEED_CAMPAIGNS.reduce((s, c) => s + c.positive_reply_rate, 0) / SEED_CAMPAIGNS.length;
  const totalMeetings = SEED_CAMPAIGNS.reduce((s, c) => s + c.meetings_booked, 0);
  const totalDeals    = SEED_CAMPAIGNS.reduce((s, c) => s + c.deals_created, 0);
  const totalMRR      = SEED_CAMPAIGNS.reduce((s, c) => s + c.closed_mrr, 0);

  const opened        = Math.round(totalDelivered * avgOpenRate / 100);
  const replied       = Math.round(totalDelivered * avgReplyRate / 100);
  const posReplied    = Math.round(totalDelivered * avgPosReply / 100);

  const rows = [
    { stage: "Emails Sent",       count: totalSent,     prev: null },
    { stage: "Delivered",         count: totalDelivered, prev: totalSent },
    { stage: "Opened (est.)",     count: opened,        prev: totalDelivered },
    { stage: "Replied",           count: replied,       prev: opened },
    { stage: "Positive Reply",    count: posReplied,    prev: replied },
    { stage: "Meeting Booked",    count: totalMeetings, prev: posReplied },
    { stage: "Deal Created",      count: totalDeals,    prev: totalMeetings },
    { stage: "MRR Closed (€/mo)", count: totalMRR,      prev: totalDeals, isMRR: true },
  ] as { stage: string; count: number; prev: number | null; isMRR?: boolean }[];

  return rows.map((r, i) => {
    const pctOfPrev = r.prev !== null && r.prev > 0
      ? ((r.count / r.prev) * 100).toFixed(1) + "%"
      : "—";
    const dropoff = r.prev !== null
      ? r.isMRR ? "—" : (r.prev - r.count).toLocaleString()
      : "—";
    return { ...r, pctOfPrev, dropoff };
  });
}

export default function CampaignsPage() {
  const summary  = getCampaignSummary();
  const funnel   = buildFunnel();

  const bestByMRR      = [...SEED_CAMPAIGNS].sort((a, b) => b.closed_mrr - a.closed_mrr)[0];
  const bestByMRR1000  = [...SEED_CAMPAIGNS].sort((a, b) => b.closed_mrr_per_1000 - a.closed_mrr_per_1000)[0];
  const highestPosReply = [...SEED_CAMPAIGNS].sort((a, b) => b.positive_reply_rate - a.positive_reply_rate)[0];
  const highOpenLowClose = [...SEED_CAMPAIGNS].sort((a, b) => {
    const scoreA = a.open_rate / Math.max(1, a.closed_mrr_per_1000);
    const scoreB = b.open_rate / Math.max(1, b.closed_mrr_per_1000);
    return scoreB - scoreA;
  })[0];
  const lowestEfficiency = [...SEED_CAMPAIGNS].sort((a, b) => a.quality_score - b.quality_score)[0];

  // Attribution path data
  const totalSent     = summary.totalEmailsSent;
  const totalDelivered = SEED_CAMPAIGNS.reduce((s, c) => s + c.delivered, 0);
  const posReplied    = Math.round(totalDelivered * summary.avgPositiveReplyRate / 100);
  const totalMeetings = summary.totalMeetingsBooked;
  const totalDeals    = summary.totalDealsCreated;
  const totalMRR      = summary.totalClosedMRR;

  const briefStatus: "behind" | "on_track" | "critical" =
    totalMRR > 500 ? "on_track" : totalMRR > 200 ? "behind" : "critical";

  return (
    <div className="space-y-6 p-6 max-w-[1400px]">

      {/* 1. OperatingBrief */}
      <OperatingBrief
        status={briefStatus}
        headline={`${totalSent.toLocaleString()} emails sent across ${SEED_CAMPAIGNS.length} campaigns — €${totalMRR}/mo MRR attributed. Best campaign by €/1000: ${bestByMRR1000.campaign_name} (€${bestByMRR1000.closed_mrr_per_1000}/1000).`}
        signals={[
          `Avg positive reply rate: ${summary.avgPositiveReplyRate}%`,
          `Total meetings booked: ${totalMeetings}`,
          `Attribution chain pending — Instantly → HubSpot → Stripe sync not connected`,
        ]}
        dataLabel="Seed / Instantly"
      />

      {/* 2. BoardMetricRow */}
      <BoardMetricRow>
        <BoardMetricCard
          label="Total Emails Sent"
          value={summary.totalEmailsSent.toLocaleString()}
          dataStatus="seed"
          source="Instantly Pending"
        />
        <BoardMetricCard
          label="Avg Positive Reply Rate"
          value={`${summary.avgPositiveReplyRate}%`}
          dataStatus="seed"
          source="Instantly Pending"
        />
        <BoardMetricCard
          label="Total Meetings Booked"
          value={String(summary.totalMeetingsBooked)}
          dataStatus="seed"
          source="Instantly Pending"
        />
        <BoardMetricCard
          label="Total Closed MRR"
          value={`€${summary.totalClosedMRR}`}
          dataStatus="seed"
          source="Instantly Pending"
        />
      </BoardMetricRow>

      {/* 3. Funnel Leakage Table */}
      <ExecutiveSection
        title="Outbound Funnel Leakage"
        subtitle="Attribution chain aggregated across all 5 campaigns"
        note="Attribution pending Instantly → HubSpot → Stripe sync. Current figures are seed data from outbound campaign model."
        right={<SourceOfTruthBadge source="Instantly (Seed)" status="seed" />}
      >
        <div className="board-card overflow-hidden">
          <table className="board-table">
            <thead>
              <tr>
                <th className="text-left">Stage</th>
                <th>Count</th>
                <th>% of Prev</th>
                <th>Drop-off</th>
              </tr>
            </thead>
            <tbody>
              {funnel.map((row) => (
                <tr key={row.stage}>
                  <td className="text-left font-medium text-gray-800">{row.stage}</td>
                  <td className="tabular-nums">
                    {row.isMRR ? `€${row.count}` : row.count.toLocaleString()}
                  </td>
                  <td className="tabular-nums text-gray-500">{row.pctOfPrev}</td>
                  <td className={`tabular-nums ${row.dropoff !== "—" ? "var-neg" : "text-gray-400"}`}>
                    {row.dropoff}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ExecutiveSection>

      {/* 4. Campaign Efficiency Table */}
      <ExecutiveSection
        title="Campaign Efficiency Analysis"
        subtitle="Revenue, conversion, and cost efficiency by campaign"
        note="Efficiency Score = composite of reply quality, meeting conversion, and MRR per email. Scale: 0–100."
        right={<SourceOfTruthBadge source="Instantly (Seed)" status="seed" />}
      >
        <div className="board-card overflow-x-auto">
          <table className="board-table">
            <thead>
              <tr>
                <th className="text-left">Campaign</th>
                <th className="text-left">Market</th>
                <th className="text-left">Owner</th>
                <th>Sent</th>
                <th>+Reply%</th>
                <th>Meetings</th>
                <th>Deals</th>
                <th>Pipeline</th>
                <th>Closed MRR</th>
                <th>€/1000 emails</th>
                <th>Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {SEED_CAMPAIGNS.map((c) => (
                <tr key={c.campaign_id}>
                  <td className="text-left font-medium text-gray-900 whitespace-nowrap">{c.campaign_name}</td>
                  <td className="text-left text-gray-600">{c.market}</td>
                  <td className="text-left text-gray-600">{c.owner}</td>
                  <td className="tabular-nums">{c.emails_sent.toLocaleString()}</td>
                  <td className="tabular-nums">{c.positive_reply_rate}%</td>
                  <td className="tabular-nums">{c.meetings_booked}</td>
                  <td className="tabular-nums">{c.deals_created}</td>
                  <td className="tabular-nums">€{c.pipeline_generated.toLocaleString()}</td>
                  <td className="tabular-nums font-semibold text-gray-900">€{c.closed_mrr}</td>
                  <td className="tabular-nums">€{c.closed_mrr_per_1000}</td>
                  <td className={`tabular-nums font-semibold ${c.quality_score >= 70 ? "var-pos" : c.quality_score >= 55 ? "text-amber-700" : "var-neg"}`}>
                    {c.quality_score}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="text-left" colSpan={3}>Total / Avg</td>
                <td className="tabular-nums">{summary.totalEmailsSent.toLocaleString()}</td>
                <td className="tabular-nums">{summary.avgPositiveReplyRate}%</td>
                <td className="tabular-nums">{summary.totalMeetingsBooked}</td>
                <td className="tabular-nums">{summary.totalDealsCreated}</td>
                <td className="tabular-nums">€{SEED_CAMPAIGNS.reduce((s,c) => s+c.pipeline_generated, 0).toLocaleString()}</td>
                <td className="tabular-nums">€{summary.totalClosedMRR}</td>
                <td className="tabular-nums">€{Math.round(SEED_CAMPAIGNS.reduce((s,c) => s+c.closed_mrr_per_1000, 0) / SEED_CAMPAIGNS.length)}</td>
                <td className="tabular-nums">{Math.round(SEED_CAMPAIGNS.reduce((s,c) => s+c.quality_score, 0) / SEED_CAMPAIGNS.length)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </ExecutiveSection>

      {/* 5. Campaign Diagnosis */}
      <ExecutiveSection title="Campaign Diagnosis" subtitle="Signal-based interpretation of outbound performance">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <OperatingInsight
            type="opportunity"
            label={`Strong Engagement: ${highestPosReply.campaign_name}`}
            body={`${highestPosReply.positive_reply_rate}% positive reply rate — highest across all campaigns. Segment (${highestPosReply.segment}) and market (${highestPosReply.market}) are responding well. Prioritise volume here.`}
            action={`Scale ${highestPosReply.campaign_name} — increase send volume and A/B test subject lines`}
          />
          <OperatingInsight
            type="finding"
            label={`High Engagement, Low Conversion: ${highOpenLowClose.campaign_name}`}
            body={`Open rate of ${highOpenLowClose.open_rate}% with only €${highOpenLowClose.closed_mrr_per_1000}/1000 emails in closed MRR. Interest exists but the conversion to close is underperforming. Review demo and objection handling script.`}
            action="Review post-meeting follow-up cadence and introduce ROI case study"
          />
          <OperatingInsight
            type="risk"
            label={`Low Efficiency Campaign: ${lowestEfficiency.campaign_name}`}
            body={`Efficiency score of ${lowestEfficiency.quality_score}/100 — lowest across all active campaigns. ${lowestEfficiency.market} market shows higher cost per reply (€${lowestEfficiency.cost_per_reply}) and weaker MRR/1000 (€${lowestEfficiency.closed_mrr_per_1000}). Consider pausing or restructuring.`}
            action={`Review ${lowestEfficiency.campaign_name} messaging and ICP targeting before next send`}
          />
          <OperatingInsight
            type="neutral"
            label="Attribution Chain: Pending Integration"
            body="Current campaign MRR figures are seed estimates. Revenue attribution requires Instantly → HubSpot contact sync → HubSpot deal → Stripe customer chain to be connected. Until live, all attribution figures carry seed-data risk."
            action="Connect Instantly webhook to HubSpot contact creation; map deal source field to campaign_id"
          />
        </div>
      </ExecutiveSection>

      {/* 6. Attribution Path Visualization */}
      <ExecutiveSection
        title="Attribution Path"
        subtitle="Tool chain from first email to MRR — integration pending"
        right={<SourceOfTruthBadge source="Seed Estimate" status="pending" />}
      >
        <div className="board-card p-4">
          <div className="flex flex-wrap items-start gap-0">
            {[
              {
                tool: "Instantly",
                label: "Email Send",
                count: totalSent.toLocaleString(),
                unit: "emails",
                badge: "Instantly (Pending)",
                connected: false,
              },
              {
                tool: "HubSpot",
                label: "Contact Created",
                count: SEED_CAMPAIGNS.reduce((s,c) => s+c.delivered, 0).toLocaleString(),
                unit: "delivered",
                badge: "HubSpot (Pending)",
                connected: false,
              },
              {
                tool: "HubSpot",
                label: "Deal Created",
                count: String(totalDeals),
                unit: "deals",
                badge: "HubSpot CRM",
                connected: false,
              },
              {
                tool: "Stripe",
                label: "Customer",
                count: String(totalDeals),
                unit: "activated",
                badge: "Stripe (Pending)",
                connected: false,
              },
              {
                tool: "MRR",
                label: "Recurring Revenue",
                count: `€${totalMRR}`,
                unit: "/mo",
                badge: "Stripe (Seed)",
                connected: true,
              },
            ].map((step, i, arr) => (
              <div key={step.tool + i} className="flex items-center">
                <div className="border border-gray-200 bg-white px-3 py-2.5 min-w-[110px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">{step.tool}</p>
                  <p className="text-xs font-semibold text-gray-900 mt-0.5">{step.label}</p>
                  <p className="text-sm font-bold tabular-nums text-gray-900">{step.count} <span className="text-xs font-normal text-gray-400">{step.unit}</span></p>
                  <p className={`text-[10px] mt-1 font-medium ${step.connected ? "text-emerald-600" : "text-amber-600"}`}>
                    {step.badge}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <span className="px-1 text-gray-300 text-sm font-bold select-none">→</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 italic mt-3">
            Grey boxes indicate pending integration. Connect Instantly → HubSpot → Stripe to replace seed counts with live attribution data.
          </p>
        </div>
      </ExecutiveSection>

    </div>
  );
}
