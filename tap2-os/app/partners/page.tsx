"use client";

import { calcPartnerPerformance } from "@/lib/operating-model/calculations";
import { OperatingBrief } from "@/components/operating/OperatingBrief";
import { BoardMetricCard, BoardMetricRow } from "@/components/analytics/BoardMetricCard";
import { ExecutiveSection } from "@/components/analytics/ExecutiveSection";
import { BridgeChart } from "@/components/analytics/BridgeChart";
import { OperatingInsight } from "@/components/analytics/OperatingInsight";
import { SourceOfTruthBadge } from "@/components/analytics/SourceOfTruthBadge";
import type { PartnerPerformance } from "@/lib/operating-model/types";

const GRADE_STYLE: Record<string, string> = {
  A:              "text-emerald-700 bg-emerald-50",
  B:              "text-blue-700 bg-blue-50",
  C:              "text-amber-700 bg-amber-50",
  D:              "text-red-600 bg-red-50",
  "Needs Review": "text-gray-500 bg-gray-100",
};

function verdictLabel(p: PartnerPerformance): string {
  const composite = p.revenue_impact_score * 0.45 + p.conversion_score * 0.35 + p.pipeline_quality_score * 0.20;
  if (composite >= 60) return "Scale";
  if (composite >= 35) return "Develop";
  return "Review";
}

function verdictColor(v: string): string {
  if (v === "Scale")   return "text-emerald-700";
  if (v === "Develop") return "text-blue-700";
  return "text-amber-700";
}

export default function PartnersPage() {
  const partners = calcPartnerPerformance();

  const totalClosedMRR  = partners.reduce((s, p) => s + p.closed_mrr, 0);
  const totalPipeline   = partners.reduce((s, p) => s + p.pipeline_generated, 0);
  const activePartners  = partners.filter(p => p.closed_won > 0 || p.pipeline_generated > 0).length;
  const staleCount      = partners.reduce((s, p) => s + p.stale_deals, 0);
  const best            = partners[0];
  const topByReferral   = partners.find(p => p.best_source === "Referral");

  const briefStatus: "on_track" | "behind" | "critical" =
    best?.grade === "A" ? "on_track" : staleCount > 5 ? "behind" : "on_track";

  // Bridge rows for partner revenue contribution
  let running = 0;
  const bridgeRows = [
    { label: "Opening", value: 0, type: "opening" as const, running: 0 },
    ...partners
      .filter(p => p.closed_mrr > 0)
      .map(p => {
        running += p.closed_mrr;
        return { label: p.name, value: p.closed_mrr, type: "add" as const, running };
      }),
    { label: "Total Closed MRR", value: totalClosedMRR, type: "closing" as const, running: totalClosedMRR },
  ];

  const stalePartners = partners.filter(p => p.stale_deals > 0);

  return (
    <div className="space-y-6 p-6 max-w-[1400px]">

      {/* 1. OperatingBrief */}
      <OperatingBrief
        status={briefStatus}
        headline={`${activePartners} partners active — €${totalClosedMRR.toLocaleString()}/mo closed MRR. Top performer: ${best.name} (€${best.closed_mrr}/mo, Grade ${best.grade}).`}
        signals={[
          `Total pipeline generated: €${totalPipeline.toLocaleString()} ARR`,
          staleCount > 0 ? `${staleCount} stale deals across partners — requires follow-up` : "No stale deals detected",
          `Avg deal quality: ${Math.round(partners.reduce((s,p) => s+p.avg_deal_quality_score, 0) / partners.length)}/100`,
        ]}
        dataLabel="Seed / HubSpot"
      />

      {/* 2. BoardMetricRow */}
      <BoardMetricRow>
        <BoardMetricCard
          label="Active Partners"
          value={String(activePartners)}
          dataStatus="seed"
          source="HubSpot Seed"
        />
        <BoardMetricCard
          label="Total Closed MRR"
          value={`€${totalClosedMRR.toLocaleString()}`}
          dataStatus="seed"
          source="HubSpot Seed"
        />
        <BoardMetricCard
          label="Total Pipeline"
          value={`€${totalPipeline.toLocaleString()}`}
          sub="Gross ARR"
          dataStatus="seed"
          source="HubSpot Seed"
        />
        <BoardMetricCard
          label="Stale Deals"
          value={String(staleCount)}
          dataStatus="seed"
          flag={staleCount > 3 ? "Needs Attention" : undefined}
        />
      </BoardMetricRow>

      {/* 3. Partner Scorecard Table */}
      <ExecutiveSection
        title="Partner Performance Scorecard"
        subtitle="Sorted by closed MRR descending — Grade = revenue impact (45%) + conversion quality (35%) + pipeline health (20%)"
        note="Grade = composite of revenue impact (45%), conversion quality (35%), pipeline health (20%). Activity alone does not drive grade."
        right={<SourceOfTruthBadge source="HubSpot (Seed)" status="seed" />}
      >
        <div className="board-card overflow-x-auto">
          <table className="board-table">
            <thead>
              <tr>
                <th className="text-left">Partner</th>
                <th>Grade</th>
                <th>Leads</th>
                <th>Meetings</th>
                <th>Demos</th>
                <th>Closed</th>
                <th>Close%</th>
                <th>MRR</th>
                <th>Avg ARPA</th>
                <th>Stale</th>
                <th>Quality</th>
                <th className="text-left">Grade Rationale</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.name}>
                  <td className="text-left font-medium text-gray-900 whitespace-nowrap">{p.name}</td>
                  <td>
                    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${GRADE_STYLE[p.grade] ?? "text-gray-500 bg-gray-100"}`}>
                      {p.grade}
                    </span>
                  </td>
                  <td className="tabular-nums">{p.leads_owned}</td>
                  <td className="tabular-nums">{p.meetings_booked}</td>
                  <td className="tabular-nums">{p.demos_completed}</td>
                  <td className="tabular-nums font-semibold">{p.closed_won}</td>
                  <td className="tabular-nums">{p.overall_close_rate}%</td>
                  <td className="tabular-nums font-semibold text-gray-900">€{p.closed_mrr}</td>
                  <td className="tabular-nums">€{p.avg_deal_size}</td>
                  <td className={`tabular-nums ${p.stale_deals > 0 ? "var-neg" : "text-gray-400"}`}>
                    {p.stale_deals}
                  </td>
                  <td className={`tabular-nums font-semibold ${p.pipeline_quality_score >= 70 ? "var-pos" : p.pipeline_quality_score >= 50 ? "text-amber-700" : "var-neg"}`}>
                    {p.pipeline_quality_score}
                  </td>
                  <td className="text-left text-xs text-gray-500 max-w-[220px]">{p.grade_rationale}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="text-left" colSpan={2}>Total</td>
                <td className="tabular-nums">{partners.reduce((s,p)=>s+p.leads_owned, 0)}</td>
                <td className="tabular-nums">{partners.reduce((s,p)=>s+p.meetings_booked, 0)}</td>
                <td className="tabular-nums">{partners.reduce((s,p)=>s+p.demos_completed, 0)}</td>
                <td className="tabular-nums">{partners.reduce((s,p)=>s+p.closed_won, 0)}</td>
                <td className="tabular-nums">—</td>
                <td className="tabular-nums">€{totalClosedMRR}</td>
                <td className="tabular-nums">—</td>
                <td className={`tabular-nums ${staleCount > 0 ? "var-neg" : ""}`}>{staleCount}</td>
                <td className="tabular-nums">—</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </ExecutiveSection>

      {/* 4. Partner Revenue Bridge */}
      <ExecutiveSection
        title="Partner Revenue Bridge"
        subtitle="Cumulative MRR contribution by partner"
        right={<SourceOfTruthBadge source="HubSpot (Seed)" status="seed" />}
      >
        <BridgeChart
          title="Partner MRR Contribution — All-Time"
          rows={bridgeRows}
          currency
          note="Seed data. Connect HubSpot deal owner → Stripe customer to replace with live revenue attribution."
        />
      </ExecutiveSection>

      {/* 5. Quality vs Activity Comparison */}
      <ExecutiveSection
        title="Quality-Adjusted Performance vs Activity Volume"
        subtitle="Do not rank by activity alone — revenue and conversion quality drive grade"
        note="Do not rank by activity alone. A partner with 8 quality closes outranks one with 20 low-quality leads."
        right={<SourceOfTruthBadge source="HubSpot (Seed)" status="seed" />}
      >
        <div className="board-card overflow-x-auto">
          <table className="board-table">
            <thead>
              <tr>
                <th className="text-left">Partner</th>
                <th>Activity Score</th>
                <th>Conversion Score</th>
                <th>Revenue Score</th>
                <th>Pipeline Quality</th>
                <th>Stale Deals</th>
                <th>Overdue</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => {
                const verdict = verdictLabel(p);
                return (
                  <tr key={p.name}>
                    <td className="text-left font-medium text-gray-900">{p.name}</td>
                    <td className="tabular-nums">{p.activity_score}</td>
                    <td className="tabular-nums">{p.conversion_score}</td>
                    <td className="tabular-nums">{p.revenue_impact_score}</td>
                    <td className={`tabular-nums ${p.pipeline_quality_score >= 70 ? "var-pos" : p.pipeline_quality_score >= 50 ? "text-amber-700" : "var-neg"}`}>
                      {p.pipeline_quality_score}
                    </td>
                    <td className={`tabular-nums ${p.stale_deals > 0 ? "var-neg" : "text-gray-400"}`}>
                      {p.stale_deals}
                    </td>
                    <td className={`tabular-nums ${p.overdue_next_steps > 0 ? "text-amber-700" : "text-gray-400"}`}>
                      {p.overdue_next_steps}
                    </td>
                    <td className={`font-semibold ${verdictColor(verdict)}`}>{verdict}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ExecutiveSection>

      {/* 6. Stale Deals Table (conditional) */}
      {stalePartners.length > 0 && (
        <ExecutiveSection
          title="Stale Deals by Partner"
          subtitle="Partners with stale or at-risk pipeline requiring immediate action"
          right={<SourceOfTruthBadge source="HubSpot (Seed)" status="seed" />}
        >
          <div className="board-card overflow-x-auto">
            <table className="board-table">
              <thead>
                <tr>
                  <th className="text-left">Partner</th>
                  <th>Stale Deals</th>
                  <th>Overdue Steps</th>
                  <th>Pipeline at Risk (ARR)</th>
                  <th>Grade</th>
                  <th className="text-left">Recommended Action</th>
                </tr>
              </thead>
              <tbody>
                {stalePartners.map((p) => (
                  <tr key={p.name}>
                    <td className="text-left font-medium text-gray-900">{p.name}</td>
                    <td className="tabular-nums var-neg">{p.stale_deals}</td>
                    <td className="tabular-nums text-amber-700">{p.overdue_next_steps}</td>
                    <td className="tabular-nums">€{p.pipeline_generated.toLocaleString()}</td>
                    <td>
                      <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${GRADE_STYLE[p.grade] ?? ""}`}>
                        {p.grade}
                      </span>
                    </td>
                    <td className="text-left text-xs text-gray-600">
                      Review stale deals, confirm next steps, set hard close date or move to nurture
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ExecutiveSection>
      )}

      {/* 7. Operating Insights */}
      <ExecutiveSection title="Operating Insights" subtitle="Data-derived signals from partner performance model">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <OperatingInsight
            type="finding"
            label={`Top Performer: ${best.name}`}
            body={`${best.name} leads with €${best.closed_mrr}/mo closed MRR and a Grade ${best.grade} rating. Overall close rate: ${best.overall_close_rate}%. Revenue impact score: ${best.revenue_impact_score}/100. This is the highest-converting partner in the portfolio.`}
            action={`Increase deal volume with ${best.name} — prioritise pipeline handoffs and expand ICP coverage`}
          />
          {staleCount > 0 && (
            <OperatingInsight
              type="risk"
              label="Stale Pipeline Risk"
              body={`${staleCount} stale deals detected across partner portfolio. Stale pipeline decays — each week without activity reduces close probability. Partners with stale deals: ${stalePartners.map(p => p.name).join(", ")}.`}
              action="Run partner pipeline review this week — set hard deadlines or move to nurture"
            />
          )}
          {topByReferral ? (
            <OperatingInsight
              type="opportunity"
              label={`Referral Signal: ${topByReferral.name}`}
              body={`${topByReferral.name}'s best source is Referral — indicating network-based deal generation. Referral deals close faster and with higher quality scores. This is a scalable channel if formalised with an incentive structure.`}
              action={`Formalise referral programme with ${topByReferral.name} — track referred deals and reward closes`}
            />
          ) : (
            <OperatingInsight
              type="neutral"
              label="Referral Channel: Underdeveloped"
              body="No partner is currently generating significant referral-sourced pipeline. Referral deals have the shortest sales cycles and highest quality scores in the current dataset. Activating a formal referral programme could unlock pipeline without incremental outbound effort."
              action="Design a referral incentive structure and socialise with top 3 partners"
            />
          )}
        </div>
      </ExecutiveSection>

    </div>
  );
}
