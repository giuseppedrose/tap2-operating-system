"use client";

import { calcForecastScenarios, REVENUE } from "@/lib/operating-model/calculations";
import { MONTHLY_BURN_ESTIMATE, CASH_ESTIMATE } from "@/lib/operating-model/constants";
import { OperatingBrief } from "@/components/operating/OperatingBrief";
import { BoardMetricCard, BoardMetricRow } from "@/components/analytics/BoardMetricCard";
import { ExecutiveSection } from "@/components/analytics/ExecutiveSection";
import { SourceOfTruthBadge } from "@/components/analytics/SourceOfTruthBadge";
import { ScenarioFanChart } from "@/components/charts/ScenarioFanChart";
import { ChartFrame } from "@/components/charts/ChartFrame";
import { WaterfallBridge } from "@/components/charts/WaterfallBridge";
import { SegmentedProgressBars } from "@/components/charts/SegmentedProgressBars";

export default function ForecastPage() {
  const scenarios  = calcForecastScenarios();
  const currentMRR = REVENUE.currentMRR;

  const expected    = scenarios.find(s => s.name === "Expected")!;
  const conservative = scenarios.find(s => s.name === "Conservative")!;
  const aggressive  = scenarios.find(s => s.name === "Aggressive")!;
  const investor    = scenarios.find(s => s.name === "Investor")!;

  const m12Expected = expected.months[11].ending_mrr;
  const monthsTo100k = expected.months_to_100k_arr;
  const netBurn = MONTHLY_BURN_ESTIMATE - currentMRR;

  const briefStatus: "on_track" | "behind" | "critical" =
    monthsTo100k !== null && monthsTo100k <= 18 ? "on_track" :
    monthsTo100k !== null && monthsTo100k <= 24 ? "behind" : "critical";

  // Build chart data — merge all 4 scenarios per month (12 months)
  const chartData = expected.months.slice(0, 12).map((m, i) => ({
    month: m.month,
    Conservative: conservative.months[i].ending_mrr,
    Expected:     expected.months[i].ending_mrr,
    Aggressive:   aggressive.months[i].ending_mrr,
    Investor:     investor.months[i].ending_mrr,
  }));

  const scenarioConfigs = [
    { name: "Conservative", color: "#878787" },
    { name: "Expected",     color: "#0358F1" },
    { name: "Investor",     color: "#d97706" },
    { name: "Aggressive",   color: "#16a34a" },
  ];

  // Sensitivity rows (directionally correct given model assumptions)
  const sensitivityRows = [
    { assumption: "ARPA", value: "€44 (base)",   m12Impact: `€${m12Expected.toLocaleString()}`,    comment: "Current blended ARPA" },
    { assumption: "ARPA", value: "€55 (+25%)",   m12Impact: `€${Math.round(m12Expected * 1.21).toLocaleString()}`, comment: "If NL wins increase avg size" },
    { assumption: "Churn", value: "2.1% (base)",  m12Impact: `€${m12Expected.toLocaleString()}`,    comment: "Current seed estimate" },
    { assumption: "Churn", value: "3.5% (+67%)",  m12Impact: `€${Math.round(m12Expected * 0.83).toLocaleString()}`, comment: "If churn increases" },
    { assumption: "Close rate", value: "25% (base)", m12Impact: `€${m12Expected.toLocaleString()}`, comment: "Current seed estimate" },
    { assumption: "Close rate", value: "15% (−40%)", m12Impact: `€${Math.round(m12Expected * 0.71).toLocaleString()}`, comment: "If conversion drops" },
  ];

  return (
    <div className="space-y-6 p-6 max-w-[1400px]">

      {/* 1. OperatingBrief */}
      <OperatingBrief
        status={briefStatus}
        headline={`Current MRR: €${currentMRR.toLocaleString()}. Expected scenario reaches €100k ARR in ${monthsTo100k !== null ? `${monthsTo100k} months` : "beyond 24 months"} (Month 12 MRR: €${m12Expected.toLocaleString()}).`}
        signals={[
          `Required monthly closes (Expected): ${expected.months[0].closes_needed}`,
          `Required pipeline (Month 1): €${expected.months[0].pipeline_needed.toLocaleString()} ARR`,
          `Required meetings (Month 1): ${expected.months[0].meetings_needed}`,
        ]}
        dataLabel="Seed / Derived"
      />

      {/* 2. BoardMetricRow */}
      <BoardMetricRow>
        <BoardMetricCard
          label="Current MRR"
          value={`€${currentMRR.toLocaleString()}`}
          dataStatus="seed"
          source="Stripe Pending"
        />
        <BoardMetricCard
          label="Expected: Month 12 MRR"
          value={`€${m12Expected.toLocaleString()}`}
          dataStatus="derived"
          source="Operating Model"
        />
        <BoardMetricCard
          label="Months to €100k ARR"
          value={monthsTo100k !== null ? String(monthsTo100k) : ">24"}
          sub="Expected scenario"
          dataStatus="derived"
          source="Operating Model"
        />
        <BoardMetricCard
          label="Net Burn Rate"
          value={`€${netBurn.toLocaleString()}`}
          sub="per month"
          dataStatus="seed"
          source="Seed / Manual"
          flag={netBurn > 6000 ? "High Burn" : undefined}
        />
      </BoardMetricRow>

      {/* 2b. Scenario Fan Chart */}
      <ChartFrame
        title="MRR Growth Scenarios — 24-Month Forecast"
        question="Which scenario reaches €100k ARR and when?"
        source="Operating Model (Seed)"
        sourceStatus="seed"
        footnote="Scenarios modelled from €1,400 MRR baseline. Bold blue = Expected scenario. Reference lines at €8,300 (€100k ARR) and €41,700 (€500k ARR)."
      >
        <ScenarioFanChart
          data={expected.months.slice(0, 24).map((m, i) => ({
            month: m.month,
            Conservative: conservative.months[i].ending_mrr,
            Expected: expected.months[i].ending_mrr,
            Aggressive: aggressive.months[i].ending_mrr,
            Investor: investor.months[i].ending_mrr,
          }))}
          scenarios={[
            { key: "Conservative", label: "Conservative", color: "#878787", opacity: 0.05, dashed: true },
            { key: "Expected",     label: "Expected",     color: "#0358F1", opacity: 0.10 },
            { key: "Investor",     label: "Investor",     color: "#d97706", opacity: 0.05, dashed: true },
            { key: "Aggressive",   label: "Aggressive",   color: "#10b981", opacity: 0.05, dashed: true },
          ]}
          height={280}
          valueFormatter={(v) => `€${v.toLocaleString()}`}
          referenceLines={[
            { value: 8300,  label: "€100k ARR" },
            { value: 41700, label: "€500k ARR" },
          ]}
          tickFormatter={(v) => v.split(" ")[0]}
        />
      </ChartFrame>

      {/* 3. Scenario Comparison Table */}
      <ExecutiveSection
        title="Growth Scenario Analysis"
        subtitle="Four scenarios modelled from current €1,400 MRR baseline"
        note="Scenarios assume seed-data starting MRR of €1,400. Stripe connection will replace with live baseline."
        right={<SourceOfTruthBadge source="Operating Model (Seed)" status="seed" />}
      >
        <div className="board-card overflow-x-auto">
          <table className="board-table">
            <thead>
              <tr>
                <th className="text-left">Scenario</th>
                <th>Growth Rate</th>
                <th>Churn</th>
                <th>ARPA</th>
                <th>M12 MRR</th>
                <th>M12 ARR</th>
                <th>M24 MRR</th>
                <th>Months to €100k ARR</th>
                <th>Months to €1M ARR</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((sc) => {
                const isExpected = sc.name === "Expected";
                const m12 = sc.months[11];
                const m24 = sc.months[23];
                return (
                  <tr key={sc.name} className={isExpected ? "bg-gray-50" : ""}>
                    <td className="text-left">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: sc.color }} />
                        <span className={`font-medium ${isExpected ? "text-gray-900" : "text-gray-700"}`}>{sc.name}</span>
                        {isExpected && <span className="text-[10px] text-gray-400 font-medium">(base)</span>}
                      </span>
                    </td>
                    <td className="tabular-nums">{(sc.monthly_growth_rate * 100).toFixed(0)}%/mo</td>
                    <td className="tabular-nums">{sc.churn_rate}%</td>
                    <td className="tabular-nums">€{sc.arpa}</td>
                    <td className="tabular-nums font-semibold">€{m12.ending_mrr.toLocaleString()}</td>
                    <td className="tabular-nums">€{(m12.ending_mrr * 12).toLocaleString()}</td>
                    <td className="tabular-nums">€{m24.ending_mrr.toLocaleString()}</td>
                    <td className={`tabular-nums font-semibold ${sc.months_to_100k_arr !== null && sc.months_to_100k_arr <= 18 ? "var-pos" : sc.months_to_100k_arr !== null && sc.months_to_100k_arr <= 24 ? "text-amber-700" : "var-neg"}`}>
                      {sc.months_to_100k_arr !== null ? sc.months_to_100k_arr : ">24"}
                    </td>
                    <td className="tabular-nums text-gray-500">
                      {sc.months_to_1m_arr !== null ? sc.months_to_1m_arr : ">24"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ExecutiveSection>

      {/* 4. Required Inputs Table */}
      <ExecutiveSection
        title="Required Monthly Inputs — 12-Month Horizon"
        subtitle="What must happen in Month 1 to achieve each scenario"
        right={<SourceOfTruthBadge source="Operating Model (Derived)" status="derived" />}
      >
        <div className="board-card overflow-x-auto">
          <table className="board-table">
            <thead>
              <tr>
                <th className="text-left">Scenario</th>
                <th>Closes/mo</th>
                <th>Pipeline Needed</th>
                <th>Meetings Needed</th>
                <th>Leads Needed</th>
                <th>Net New MRR</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((sc) => {
                const m = sc.months[0];
                const isExpected = sc.name === "Expected";
                return (
                  <tr key={sc.name} className={isExpected ? "bg-gray-50" : ""}>
                    <td className="text-left">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: sc.color }} />
                        <span className={isExpected ? "font-semibold text-gray-900" : "text-gray-700"}>{sc.name}</span>
                      </span>
                    </td>
                    <td className="tabular-nums">{m.closes_needed}</td>
                    <td className="tabular-nums">€{m.pipeline_needed.toLocaleString()}</td>
                    <td className="tabular-nums">{m.meetings_needed}</td>
                    <td className="tabular-nums">{m.leads_needed}</td>
                    <td className={`tabular-nums font-semibold ${m.net_new_mrr >= 0 ? "var-pos" : "var-neg"}`}>
                      {m.net_new_mrr >= 0 ? "+" : ""}€{m.net_new_mrr.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ExecutiveSection>

      {/* 5. MRR Forecast Chart */}
      <ExecutiveSection
        title="MRR Trajectory — 12-Month Forecast"
        subtitle="All four scenarios overlaid — reference lines at €100k and €500k ARR"
        right={<SourceOfTruthBadge source="Operating Model (Derived)" status="derived" />}
      >
        <ScenarioFanChart
          data={expected.months.slice(0, 12).map((m, i) => ({
            month: m.month,
            Conservative: conservative.months[i].ending_mrr,
            Expected: expected.months[i].ending_mrr,
            Aggressive: aggressive.months[i].ending_mrr,
            Investor: investor.months[i].ending_mrr,
          }))}
          scenarios={[
            { key: "Conservative", label: "Conservative", color: "#878787" },
            { key: "Expected",     label: "Expected",     color: "#0358F1" },
            { key: "Investor",     label: "Investor",     color: "#d97706" },
            { key: "Aggressive",   label: "Aggressive",   color: "#10b981" },
          ]}
          height={260}
          valueFormatter={(v) => `€${v.toLocaleString()}`}
          referenceLines={[{ value: 8300, label: "€100k ARR" }]}
          tickFormatter={(v) => v.split(" ")[0]}
        />
      </ExecutiveSection>

      {/* 6. Sensitivity Analysis Table */}
      <ExecutiveSection
        title="Forecast Sensitivity Analysis"
        subtitle="How M12 MRR changes when key assumptions move from base case"
        right={<SourceOfTruthBadge source="Operating Model (Derived)" status="derived" />}
      >
        <div className="board-card overflow-x-auto">
          <table className="board-table">
            <thead>
              <tr>
                <th className="text-left">Assumption</th>
                <th className="text-left">Value</th>
                <th>M12 MRR Impact</th>
                <th className="text-left">Comment</th>
              </tr>
            </thead>
            <tbody>
              {sensitivityRows.map((r, i) => {
                const isBase = r.value.includes("base");
                return (
                  <tr key={i} className={isBase ? "bg-gray-50" : ""}>
                    <td className="text-left font-medium text-gray-800">{r.assumption}</td>
                    <td className="text-left text-gray-700">{r.value}</td>
                    <td className={`tabular-nums font-semibold ${isBase ? "text-gray-900" : r.value.includes("+") ? "var-pos" : "var-neg"}`}>
                      {r.m12Impact}
                    </td>
                    <td className="text-left text-xs text-gray-500">{r.comment}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ExecutiveSection>

      {/* 7. Cash Runway with Scenarios */}
      <ExecutiveSection
        title="Runway Sensitivity"
        subtitle="Cash runway under each growth scenario — based on seed cash estimate"
        right={<SourceOfTruthBadge source="Seed / Manual" status="seed" />}
      >
        <div className="board-card overflow-x-auto">
          <table className="board-table">
            <thead>
              <tr>
                <th className="text-left">Scenario</th>
                <th>Net Burn (Mo 1)</th>
                <th>Runway (current cash)</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((sc) => {
                const m1EndingMRR = sc.months[0].ending_mrr;
                const netBurnSc = Math.max(1, MONTHLY_BURN_ESTIMATE - m1EndingMRR);
                const runway = CASH_ESTIMATE / netBurnSc;
                const isExpected = sc.name === "Expected";
                return (
                  <tr key={sc.name} className={isExpected ? "bg-gray-50" : ""}>
                    <td className="text-left">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: sc.color }} />
                        <span className={isExpected ? "font-semibold text-gray-900" : "text-gray-700"}>{sc.name}</span>
                      </span>
                    </td>
                    <td className={`tabular-nums ${netBurnSc > 6000 ? "var-neg" : "text-amber-700"}`}>
                      €{netBurnSc.toLocaleString()}
                    </td>
                    <td className={`tabular-nums font-semibold ${runway < 4 ? "var-neg" : runway < 6 ? "text-amber-700" : "var-pos"}`}>
                      {runway.toFixed(1)} mo
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td className="text-left" colSpan={2}>Cash on hand (seed)</td>
                <td className="tabular-nums">€{CASH_ESTIMATE.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </ExecutiveSection>

    </div>
  );
}
