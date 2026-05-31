"use client";

import { mockCashData } from "@/lib/mock-data/cash";
import { OperatingBrief } from "@/components/operating/OperatingBrief";
import { BoardMetricCard, BoardMetricRow } from "@/components/analytics/BoardMetricCard";
import { ExecutiveSection } from "@/components/analytics/ExecutiveSection";
import { BridgeChart } from "@/components/analytics/BridgeChart";
import { SourceOfTruthBadge } from "@/components/analytics/SourceOfTruthBadge";

const CONFIDENCE_STYLE: Record<string, string> = {
  auto:   "text-emerald-700 bg-emerald-50",
  review: "text-amber-700 bg-amber-50",
  manual: "text-gray-500 bg-gray-100",
};

const CONFIDENCE_LABEL: Record<string, string> = {
  auto:   "Auto",
  review: "Review",
  manual: "Manual",
};

const EXPENSE_META: Record<string, { recurring: string; reviewStatus: string }> = {
  "Salaries & Contractors": { recurring: "Yes",     reviewStatus: "OK" },
  "Software & Tools":       { recurring: "Yes",     reviewStatus: "OK" },
  "Marketing & Events":     { recurring: "Partial", reviewStatus: "Needs Review" },
  "Office & Co-working":    { recurring: "Yes",     reviewStatus: "OK" },
  "Travel & Transport":     { recurring: "No",      reviewStatus: "Needs Review" },
  "Legal & Accounting":     { recurring: "Yes",     reviewStatus: "OK" },
  "Miscellaneous":          { recurring: "No",      reviewStatus: "Needs Review" },
};

export default function CashPage() {
  const { bankBalance, monthlyBurn, runway, expensesByCategory, transactions } = mockCashData;

  const netBurn     = 6800;
  const mrr         = 1400;
  const grossBurn   = monthlyBurn;
  const mrrCoverage = Math.round((mrr / grossBurn) * 100);

  const briefStatus: "critical" | "behind" | "on_track" =
    runway < 4 ? "critical" : runway < 6 ? "behind" : "on_track";

  const bridgeRows = [
    { label: "Opening cash (Apr)",       value: 38500, type: "opening" as const,  running: 38500 },
    { label: "Revenue collected",        value: 1350,  type: "add" as const,      running: 39850 },
    { label: "Payroll & contractors",    value: 5200,  type: "subtract" as const, running: 34650 },
    { label: "SaaS & tools",             value: 820,   type: "subtract" as const, running: 33830 },
    { label: "Marketing",                value: 680,   type: "subtract" as const, running: 33150 },
    { label: "Office & travel",          value: 800,   type: "subtract" as const, running: 32350 },
    { label: "Legal & accounting",       value: 340,   type: "subtract" as const, running: 32010 },
    { label: "Other",                    value: 360,   type: "subtract" as const, running: 31650 },
    { label: "Closing cash (May est.)",  value: 31650, type: "closing" as const,  running: 31650 },
  ];

  const runwaySensitivity = [
    { scenario: "Current (seed)",       burn: 8200, mrr: 1400, netBurn: 6800, runway: 4.7 },
    { scenario: "+2 closes (€178 ea)",  burn: 8200, mrr: 1756, netBurn: 6444, runway: 5.0 },
    { scenario: "+5 closes",            burn: 8200, mrr: 2245, netBurn: 5955, runway: 5.4 },
    { scenario: "Reduce burn 10%",      burn: 7380, mrr: 1400, netBurn: 5980, runway: 5.4 },
    { scenario: "€100k ARR",            burn: 8200, mrr: 8300, netBurn: -100, runway: 99 },
  ];

  return (
    <div className="space-y-6 p-6 max-w-[1400px]">

      {/* 1. OperatingBrief */}
      <OperatingBrief
        status={briefStatus}
        headline={`€${bankBalance.toLocaleString()} cash on hand — ${runway} months runway at €${netBurn.toLocaleString()}/mo net burn. Seed estimate only.`}
        signals={[
          `Gross burn: €${grossBurn.toLocaleString()}/mo`,
          `MRR covering ${mrrCoverage}% of burn`,
          "Rabobank CSV required before figures can be trusted for investor conversations",
        ]}
        dataLabel="Seed / Manual"
      />

      {/* 2. BoardMetricRow */}
      <BoardMetricRow>
        <BoardMetricCard
          label="Cash on Hand"
          value={`€${bankBalance.toLocaleString()}`}
          dataStatus="seed"
          source="Rabobank Pending"
          flag="Seed Estimate"
        />
        <BoardMetricCard
          label="Gross Burn"
          value={`€${grossBurn.toLocaleString()}`}
          sub="per month"
          dataStatus="seed"
          source="Seed / Manual"
        />
        <BoardMetricCard
          label="Net Burn"
          value={`€${netBurn.toLocaleString()}`}
          sub="per month"
          dataStatus="derived"
          source="Gross − MRR"
        />
        <BoardMetricCard
          label="Runway"
          value={`${runway} mo`}
          dataStatus="seed"
          source="Seed / Manual"
          flag="Critical"
        />
      </BoardMetricRow>

      {/* 3. Seed Data Warning */}
      <div className="border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700 mb-1">Data Quality Warning</p>
        <p className="text-sm text-amber-900 font-medium">
          All cash figures are seed estimates. Rabobank CSV upload required before runway and burn figures can be trusted for investor conversations.
        </p>
        <p className="text-xs text-amber-700 mt-1">
          Source: Manual seed data · Status: Rabobank connection pending · Action: Upload Rabobank CSV in /admin/data-connections
        </p>
      </div>

      {/* 4. Cash Bridge */}
      <ExecutiveSection
        title="Cash Bridge — May 2026 (Seed Estimate)"
        subtitle="Opening to closing cash reconciliation"
        right={<SourceOfTruthBadge source="Seed / Manual" status="seed" />}
      >
        <BridgeChart
          title="Cash Bridge — May 2026 (Seed Estimate)"
          rows={bridgeRows}
          currency
          note="Seed estimate only. Revenue collected may differ from MRR due to timing. Upload Rabobank CSV to replace."
        />
      </ExecutiveSection>

      {/* 5. Burn by Category Table */}
      <ExecutiveSection
        title="Expense Analysis by Category"
        subtitle="Monthly burn decomposed by spend category"
        note="Payroll + contractors = 63% of burn. Reducing SaaS and marketing below €1,000/mo combined would add ~0.2 months runway."
        right={<SourceOfTruthBadge source="Seed / Manual" status="seed" />}
      >
        <div className="board-card overflow-x-auto">
          <table className="board-table">
            <thead>
              <tr>
                <th className="text-left">Category</th>
                <th>Amount/mo</th>
                <th>% of Burn</th>
                <th className="text-left">Recurring?</th>
                <th className="text-left">Review Status</th>
              </tr>
            </thead>
            <tbody>
              {expensesByCategory.map((e) => {
                const meta = EXPENSE_META[e.category] ?? { recurring: "—", reviewStatus: "—" };
                return (
                  <tr key={e.category}>
                    <td className="text-left font-medium text-gray-900">{e.category}</td>
                    <td className="tabular-nums font-semibold">€{e.amount.toLocaleString()}</td>
                    <td className="tabular-nums">{e.percentage}%</td>
                    <td className="text-left text-xs text-gray-600">{meta.recurring}</td>
                    <td className="text-left">
                      <span className={`text-xs font-medium ${meta.reviewStatus === "OK" ? "text-emerald-700" : "text-amber-700"}`}>
                        {meta.reviewStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td className="text-left">Total</td>
                <td className="tabular-nums">€{expensesByCategory.reduce((s, e) => s + e.amount, 0).toLocaleString()}</td>
                <td className="tabular-nums">100%</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </ExecutiveSection>

      {/* 6. Runway Sensitivity Table */}
      <ExecutiveSection
        title="Runway Sensitivity Analysis"
        subtitle="How runway changes under different revenue and burn scenarios"
        note="Cash on hand: €38,500 (seed estimate). Each €178/mo Tier 3 deal closed extends runway by ~0.3 months."
        right={<SourceOfTruthBadge source="Seed / Derived" status="seed" />}
      >
        <div className="board-card overflow-x-auto">
          <table className="board-table">
            <thead>
              <tr>
                <th className="text-left">Scenario</th>
                <th>Monthly Burn</th>
                <th>MRR</th>
                <th>Net Burn</th>
                <th>Runway</th>
              </tr>
            </thead>
            <tbody>
              {runwaySensitivity.map((r) => {
                const isCurrent = r.scenario === "Current (seed)";
                const isGood = r.runway >= 24;
                const runwayDisplay = r.runway >= 24 ? ">24 mo" : `${r.runway} mo`;
                return (
                  <tr key={r.scenario} className={isCurrent ? "bg-gray-50" : ""}>
                    <td className="text-left font-medium text-gray-800">{r.scenario}</td>
                    <td className="tabular-nums">€{r.burn.toLocaleString()}</td>
                    <td className="tabular-nums">€{r.mrr.toLocaleString()}</td>
                    <td className={`tabular-nums font-semibold ${r.netBurn <= 0 ? "var-pos" : r.netBurn < 6000 ? "text-amber-700" : "var-neg"}`}>
                      {r.netBurn <= 0 ? `−€${Math.abs(r.netBurn)}` : `€${r.netBurn.toLocaleString()}`}
                    </td>
                    <td className={`tabular-nums font-semibold ${isGood ? "var-pos" : r.runway >= 6 ? "text-amber-700" : "var-neg"}`}>
                      {runwayDisplay}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ExecutiveSection>

      {/* 7. Transaction Register */}
      <ExecutiveSection
        title="Sample Transaction Register — May 2026 (Seed Only)"
        subtitle="All transactions are seed records — upload Rabobank CSV to replace with real bank data"
        note="All transactions are seed records. Upload Rabobank CSV to replace with real bank data."
        right={<SourceOfTruthBadge source="Seed / Manual" status="seed" />}
      >
        <div className="board-card overflow-x-auto">
          <table className="board-table">
            <thead>
              <tr>
                <th className="text-left">Date</th>
                <th className="text-left">Description</th>
                <th className="text-left">Counterparty</th>
                <th className="text-left">Category</th>
                <th>Amount</th>
                <th className="text-left">Classification</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="text-left text-gray-600 whitespace-nowrap">{tx.date}</td>
                  <td className="text-left text-gray-700 max-w-[200px] truncate">{tx.description}</td>
                  <td className="text-left text-gray-600 whitespace-nowrap">{tx.counterparty}</td>
                  <td className="text-left text-gray-600 text-xs">{tx.category}</td>
                  <td className={`tabular-nums font-semibold ${tx.amount >= 0 ? "var-pos" : "var-neg"}`}>
                    {tx.amount >= 0 ? "+" : ""}€{Math.abs(tx.amount).toLocaleString()}
                  </td>
                  <td className="text-left">
                    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded ${CONFIDENCE_STYLE[tx.confidence] ?? "text-gray-500 bg-gray-100"}`}>
                      {CONFIDENCE_LABEL[tx.confidence] ?? tx.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ExecutiveSection>

    </div>
  );
}
