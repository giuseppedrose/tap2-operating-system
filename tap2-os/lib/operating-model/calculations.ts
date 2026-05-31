// Tap2 Operating Model — Derived Calculations
// All page metrics derive from this file. Do not hardcode numbers in pages.

import type { Deal, PartnerPerformance, GTMSource, LifecycleStage, ForecastScenario, ForecastMonth } from './types';
import {
  SEED_DEALS, CLOSED_WON, CLOSED_LOST, ACTIVE_PIPELINE, SEED_CAMPAIGNS, ALL_DEALS,
} from './seed';
import {
  STAGE_PROBABILITY, STALE_THRESHOLDS, GTM_SOURCES, MONTHLY_BURN_ESTIMATE, CASH_ESTIMATE,
  MILESTONES, CHURN_ASSUMPTIONS,
} from './constants';

// ─── Revenue (reconciles with /revenue page) ─────────────────────────────────

export const REVENUE = {
  currentMRR: CLOSED_WON.reduce((s, d) => s + d.expected_mrr, 0),
  activeClients: CLOSED_WON.length,
  get arr() { return this.currentMRR * 12; },
  get arpa() { return Math.round(this.currentMRR / this.activeClients); },
};

// ─── Pipeline ────────────────────────────────────────────────────────────────

export function calcPipeline(deals: Deal[] = ACTIVE_PIPELINE) {
  const open = deals.filter(d => d.deal_stage !== 'Closed Won' && d.deal_stage !== 'Closed Lost');
  const stale = open.filter(d => d.deal_health === 'Stale' || d.deal_health === 'At Risk');
  const closingThisMonth = open.filter(d => {
    const cm = d.expected_close_month;
    return cm === 'May 2026' || cm === 'Jun 2026';
  });
  const needsAttention = open.filter(d =>
    d.deal_health === 'Needs Follow-up' || d.deal_health === 'Stale' || d.deal_health === 'At Risk'
  );

  return {
    totalGross:        open.reduce((s, d) => s + d.amount, 0),
    totalWeighted:     open.reduce((s, d) => s + d.weighted_arr, 0),
    expectedMRR:       open.reduce((s, d) => s + d.expected_mrr, 0),
    weightedMRR:       open.reduce((s, d) => s + d.weighted_mrr, 0),
    dealCount:         open.length,
    stalePipeline:     stale.reduce((s, d) => s + d.amount, 0),
    staleCount:        stale.length,
    closingThisMonth,
    needsAttention,
    byStage:           groupByStage(open),
    byOwner:           groupBy(open, 'owner'),
    bySource:          groupBy(open, 'source'),
    byCountry:         groupBy(open, 'country'),
    bySegment:         groupBy(open, 'segment'),
    byUseCase:         groupBy(open, 'use_case'),
    byHealth:          groupByHealth(open),
    lostReasons:       lostReasonSummary(),
    competitors:       competitorSummary(),
  };
}

function groupByStage(deals: Deal[]) {
  const order = ['New Lead','Contacted','Positive Reply','Meeting Booked','Discovery Completed','Demo Completed','Proposal Sent','Trial / Pilot','Negotiation','Nurture'];
  const map: Record<string, { count: number; mrr: number; weighted_mrr: number; probability: number }> = {};
  deals.forEach(d => {
    if (!map[d.deal_stage]) map[d.deal_stage] = { count: 0, mrr: 0, weighted_mrr: 0, probability: STAGE_PROBABILITY[d.deal_stage] ?? 0 };
    map[d.deal_stage].count++;
    map[d.deal_stage].mrr += d.expected_mrr;
    map[d.deal_stage].weighted_mrr += d.weighted_mrr;
  });
  return order.filter(s => map[s]).map(s => ({ stage: s, ...map[s] }));
}

function groupBy(deals: Deal[], key: keyof Deal) {
  const map: Record<string, { count: number; mrr: number; weighted_mrr: number }> = {};
  deals.forEach(d => {
    const k = String(d[key]);
    if (!map[k]) map[k] = { count: 0, mrr: 0, weighted_mrr: 0 };
    map[k].count++;
    map[k].mrr += d.expected_mrr;
    map[k].weighted_mrr += d.weighted_mrr;
  });
  return Object.entries(map)
    .map(([label, v]) => ({ label, ...v }))
    .sort((a, b) => b.mrr - a.mrr);
}

function groupByHealth(deals: Deal[]) {
  const map: Record<string, number> = {};
  deals.forEach(d => { map[d.deal_health] = (map[d.deal_health] ?? 0) + 1; });
  return Object.entries(map).map(([health, count]) => ({ health, count })).sort((a,b) => b.count - a.count);
}

function lostReasonSummary() {
  return CLOSED_LOST
    .filter(d => d.lost_reason)
    .reduce<Record<string, { count: number; mrr: number }>>((acc, d) => {
      const r = d.lost_reason!;
      if (!acc[r]) acc[r] = { count: 0, mrr: 0 };
      acc[r].count++;
      acc[r].mrr += d.expected_mrr;
      return acc;
    }, {});
}

function competitorSummary() {
  return CLOSED_LOST
    .filter(d => d.competitor)
    .reduce<Record<string, number>>((acc, d) => {
      acc[d.competitor!] = (acc[d.competitor!] ?? 0) + 1;
      return acc;
    }, {});
}

// ─── Partner Performance ──────────────────────────────────────────────────────

export function calcPartnerPerformance(): PartnerPerformance[] {
  const owners = [...new Set(ALL_DEALS.map(d => d.owner))];
  return owners.map(owner => {
    const ownerDeals = ALL_DEALS.filter(d => d.owner === owner);
    const won = ownerDeals.filter(d => d.deal_stage === 'Closed Won');
    const lost = ownerDeals.filter(d => d.deal_stage === 'Closed Lost');
    const active = ownerDeals.filter(d => d.deal_stage !== 'Closed Won' && d.deal_stage !== 'Closed Lost');
    const withMeeting = ownerDeals.filter(d => !['New Lead','Contacted','Positive Reply','Closed Lost','Nurture'].includes(d.deal_stage) || d.deal_stage === 'Closed Won');
    const withDemo = ownerDeals.filter(d => ['Demo Completed','Proposal Sent','Trial / Pilot','Negotiation','Closed Won'].includes(d.deal_stage));
    const withProposal = ownerDeals.filter(d => ['Proposal Sent','Trial / Pilot','Negotiation','Closed Won'].includes(d.deal_stage));

    const closedMRR = won.reduce((s, d) => s + d.expected_mrr, 0);
    const pipeline = active.reduce((s, d) => s + d.amount, 0);
    const weightedPipeline = active.reduce((s, d) => s + d.weighted_arr, 0);
    const qualityScores = ownerDeals.map(d => d.quality_score);
    const avgQuality = qualityScores.length ? Math.round(qualityScores.reduce((s,v) => s+v, 0) / qualityScores.length) : 0;
    const avgDealSize = won.length ? Math.round(won.reduce((s,d) => s + d.expected_mrr, 0) / won.length) : 0;
    const staleDeals = active.filter(d => d.deal_health === 'Stale' || d.deal_health === 'At Risk').length;
    const overdue = active.filter(d => d.deal_health === 'Needs Follow-up').length;
    const cycleDeals = won.filter(d => d.sales_cycle_days > 0);
    const avgCycle = cycleDeals.length ? Math.round(cycleDeals.reduce((s,d) => s + d.sales_cycle_days, 0) / cycleDeals.length) : 0;

    const totalLeads = ownerDeals.length;
    const l2m = totalLeads > 0 ? Math.round((withMeeting.length / totalLeads) * 100 * 10) / 10 : 0;
    const m2d = withMeeting.length > 0 ? Math.round((withDemo.length / withMeeting.length) * 100 * 10) / 10 : 0;
    const d2c = withDemo.length > 0 ? Math.round((won.length / withDemo.length) * 100 * 10) / 10 : 0;
    const overallClose = totalLeads > 0 ? Math.round((won.length / totalLeads) * 100 * 10) / 10 : 0;

    // Source/market/use_case breakdowns
    const sourceMap: Record<string, number> = {};
    const marketMap: Record<string, number> = {};
    const ucMap: Record<string, number> = {};
    won.forEach(d => {
      sourceMap[d.source] = (sourceMap[d.source] ?? 0) + d.expected_mrr;
      marketMap[d.country] = (marketMap[d.country] ?? 0) + d.expected_mrr;
      ucMap[d.use_case] = (ucMap[d.use_case] ?? 0) + d.expected_mrr;
    });
    const bestSource = Object.entries(sourceMap).sort((a,b) => b[1]-a[1])[0]?.[0] ?? '—';
    const bestMarket = Object.entries(marketMap).sort((a,b) => b[1]-a[1])[0]?.[0] ?? '—';
    const bestUseCase = Object.entries(ucMap).sort((a,b) => b[1]-a[1])[0]?.[0] ?? '—';

    // Scores
    const activityScore = Math.min(100, Math.round((totalLeads / 12) * 30 + (withMeeting.length / 5) * 40 + (won.length / 3) * 30));
    const conversionScore = Math.min(100, Math.round(l2m * 1.2 + d2c * 2.5));
    const revenueScore = Math.min(100, Math.round((closedMRR / 400) * 60 + (weightedPipeline / 5000) * 40));
    const qualityScore2 = Math.min(100, Math.round(avgQuality * 0.7 + (100 - staleDeals * 10) * 0.3));

    const grade = deriveGrade(revenueScore, conversionScore, qualityScore2);

    return {
      name: owner,
      leads_owned: totalLeads,
      qualified_leads: withMeeting.length,
      meetings_booked: withMeeting.length,
      meetings_completed: Math.round(withMeeting.length * 0.85),
      demos_completed: withDemo.length,
      proposals_sent: withProposal.length,
      trials_started: ownerDeals.filter(d => d.deal_stage === 'Trial / Pilot').length,
      closed_won: won.length,
      closed_lost: lost.length,
      closed_mrr: closedMRR,
      closed_arr: closedMRR * 12,
      pipeline_generated: pipeline,
      weighted_pipeline: weightedPipeline,
      avg_deal_quality_score: avgQuality,
      avg_deal_size: avgDealSize,
      lead_to_meeting_rate: l2m,
      meeting_to_demo_rate: m2d,
      demo_to_close_rate: d2c,
      overall_close_rate: overallClose,
      avg_sales_cycle_days: avgCycle,
      stale_deals: staleDeals,
      overdue_next_steps: overdue,
      best_source: bestSource,
      best_market: bestMarket,
      best_use_case: bestUseCase,
      activity_score: activityScore,
      conversion_score: conversionScore,
      revenue_impact_score: revenueScore,
      pipeline_quality_score: qualityScore2,
      grade,
      grade_rationale: gradeRationale(grade, closedMRR, conversionScore, staleDeals),
    };
  }).sort((a, b) => b.closed_mrr - a.closed_mrr);
}

function deriveGrade(revenue: number, conversion: number, quality: number): 'A' | 'B' | 'C' | 'D' | 'Needs Review' {
  const composite = revenue * 0.45 + conversion * 0.35 + quality * 0.20;
  if (composite >= 70) return 'A';
  if (composite >= 50) return 'B';
  if (composite >= 30) return 'C';
  if (composite >= 15) return 'D';
  return 'Needs Review';
}

function gradeRationale(grade: 'A'|'B'|'C'|'D'|'Needs Review', mrr: number, conversion: number, stale: number): string {
  if (grade === 'A') return `Strong revenue (€${mrr}/mo MRR) with high conversion. Clean pipeline.`;
  if (grade === 'B') return `Good activity and some closed revenue. Conversion can improve.`;
  if (grade === 'C') return `Active but conversion is below target. ${stale > 0 ? `${stale} stale deals need attention.` : 'Focus on deal quality.'}`;
  if (grade === 'D') return `Low revenue impact. Review pipeline quality and follow-up cadence.`;
  return `Pipeline contains stale or low-quality deals. Review and clean up.`;
}

// ─── GTM Source Attribution ───────────────────────────────────────────────────

export function calcGTMSources(): GTMSource[] {
  const sourceMap: Record<string, Deal[]> = {};
  ALL_DEALS.forEach(d => {
    if (!sourceMap[d.source]) sourceMap[d.source] = [];
    sourceMap[d.source].push(d);
  });

  return Object.entries(sourceMap).map(([source, deals]) => {
    const won = deals.filter(d => d.deal_stage === 'Closed Won');
    const lost = deals.filter(d => d.deal_stage === 'Closed Lost');
    const active = deals.filter(d => d.deal_stage !== 'Closed Won' && d.deal_stage !== 'Closed Lost');
    const meetings = deals.filter(d => !['New Lead','Contacted','Positive Reply','Closed Lost','Nurture'].includes(d.deal_stage) || d.deal_stage === 'Closed Won');
    const demos = deals.filter(d => ['Demo Completed','Proposal Sent','Trial / Pilot','Negotiation','Closed Won'].includes(d.deal_stage));
    const proposals = deals.filter(d => ['Proposal Sent','Trial / Pilot','Negotiation','Closed Won'].includes(d.deal_stage));
    const trials = deals.filter(d => d.deal_stage === 'Trial / Pilot');

    const closedMRR = won.reduce((s, d) => s + d.expected_mrr, 0);
    const pipelineGenerated = active.reduce((s, d) => s + d.amount, 0);
    const weightedPipeline = active.reduce((s, d) => s + d.weighted_arr, 0);
    const avgQuality = deals.length ? Math.round(deals.reduce((s,d) => s+d.quality_score, 0) / deals.length) : 0;
    const cycleDeals = won.filter(d => d.sales_cycle_days > 0);
    const avgCycle = cycleDeals.length ? Math.round(cycleDeals.reduce((s,d) => s+d.sales_cycle_days, 0) / cycleDeals.length) : 0;

    const l2m = deals.length > 0 ? Math.round((meetings.length / deals.length) * 100 * 10) / 10 : 0;
    const m2d = meetings.length > 0 ? Math.round((demos.length / meetings.length) * 100 * 10) / 10 : 0;
    const d2c = demos.length > 0 ? Math.round((won.length / demos.length) * 100 * 10) / 10 : 0;
    const overallClose = deals.length > 0 ? Math.round((won.length / deals.length) * 100 * 10) / 10 : 0;

    // Quality score
    const qualityScore = Math.min(100, Math.round(
      (closedMRR / 50) * 25 +
      (overallClose * 2) +
      (avgQuality * 0.35) +
      (deals.length >= 3 ? 15 : deals.length * 5)
    ));

    const { rec, rationale } = gtmRecommendation(source, closedMRR, qualityScore, deals.length, overallClose);
    const category = getSourceCategory(source);

    return {
      source,
      category,
      leads: deals.length,
      qualified_leads: meetings.length,
      positive_replies: deals.filter(d => !['New Lead','Contacted','Closed Lost'].includes(d.deal_stage)).length,
      meetings: meetings.length,
      demos: demos.length,
      proposals: proposals.length,
      trials: trials.length,
      closed_won: won.length,
      closed_lost: lost.length,
      closed_mrr: closedMRR,
      pipeline_generated: pipelineGenerated,
      weighted_pipeline: weightedPipeline,
      lead_to_meeting_rate: l2m,
      meeting_to_demo_rate: m2d,
      demo_to_close_rate: d2c,
      overall_close_rate: overallClose,
      avg_deal_quality: avgQuality,
      avg_sales_cycle_days: avgCycle,
      quality_score: qualityScore,
      recommendation: rec,
      recommendation_rationale: rationale,
    };
  }).sort((a, b) => b.closed_mrr - a.closed_mrr);
}

function getSourceCategory(source: string): string {
  if (['Cold Email','Spain Outbound','Colombia Outbound','Italy Outbound'].includes(source)) return 'Outbound Email';
  if (['Cold Calling'].includes(source)) return 'Outbound Calling';
  if (['LinkedIn'].includes(source)) return 'Social';
  if (['Referral','Partner Referral'].includes(source)) return 'Referral';
  if (['Horecava','HIP Spain'].includes(source)) return 'Events';
  if (['CitySales','OptiDist','Qubico Studio'].includes(source)) return 'Partner';
  if (['Website / Inbound'].includes(source)) return 'Inbound';
  return 'Other';
}

function gtmRecommendation(
  source: string, mrr: number, quality: number, volume: number, closeRate: number
): { rec: import('./types').GTMRecommendation; rationale: string } {
  if (mrr >= 300 && quality >= 70) return { rec: 'Double Down', rationale: `Best closed MRR and quality score. Increase investment.` };
  if (mrr >= 150 && closeRate >= 8) return { rec: 'Double Down', rationale: `Strong close rate (${closeRate}%). Scale volume.` };
  if (mrr > 0 && quality >= 60) return { rec: 'Test More', rationale: `Shows revenue signal. Needs more volume to confirm.` };
  if (mrr > 0 && closeRate < 5) return { rec: 'Improve Follow-up', rationale: `Getting deals but low close rate. Improve nurture.` };
  if (volume >= 3 && mrr === 0) return { rec: 'Pause', rationale: `Volume without closes. Reassess ICP or messaging.` };
  return { rec: 'Needs Data', rationale: `Too few deals to conclude. Run at least 5–10 deals before deciding.` };
}

// ─── Lifecycle Funnel ─────────────────────────────────────────────────────────

export function calcLifecycleFunnel(): LifecycleStage[] {
  const stages = [
    'New Lead', 'Contacted', 'Positive Reply', 'Meeting Booked',
    'Discovery Completed', 'Demo Completed', 'Proposal Sent',
    'Trial / Pilot', 'Negotiation', 'Closed Won',
  ];

  const stageCounts = stages.map(stage => {
    const stageDeals = ALL_DEALS.filter(d => d.deal_stage === stage);
    // Also count deals that passed through this stage (all ≥ this stage)
    const stageIndex = stages.indexOf(stage);
    const throughDeals = ALL_DEALS.filter(d => {
      const di = stages.indexOf(d.deal_stage);
      return di >= stageIndex || d.deal_stage === 'Closed Won' || d.deal_stage === 'Closed Lost';
    });

    return {
      stage,
      count: throughDeals.length,
      activeInStage: stageDeals.length,
      avgDays: stageDeals.length
        ? Math.round(stageDeals.reduce((s,d) => s + d.days_in_stage, 0) / stageDeals.length)
        : 0,
      mrr: stageDeals.reduce((s,d) => s + d.expected_mrr, 0),
    };
  });

  return stageCounts.map((s, i) => {
    const next = stageCounts[i + 1];
    const convRate = next ? Math.round((next.count / s.count) * 100 * 10) / 10 : null;
    const dropoff = convRate !== null ? Math.round((100 - convRate) * 10) / 10 : null;
    const dropped = next ? s.count - next.count : null;
    return {
      stage: s.stage,
      count: s.count,
      avg_days_in_stage: s.avgDays,
      conversion_to_next: convRate,
      dropoff_rate: dropoff,
      absolute_dropped: dropped,
      revenue_at_risk: dropped ? dropped * 60 : 0,
    };
  });
}

// ─── Forecast ────────────────────────────────────────────────────────────────

export function calcForecastScenarios(): ForecastScenario[] {
  const scenarios = [
    { name: 'Conservative', color: '#878787', monthlyGrowth: 0.08, arpa: 44, churn: CHURN_ASSUMPTIONS.conservative },
    { name: 'Expected',     color: '#0358F1', monthlyGrowth: 0.15, arpa: 48, churn: CHURN_ASSUMPTIONS.expected },
    { name: 'Aggressive',   color: '#16a34a', monthlyGrowth: 0.25, arpa: 52, churn: CHURN_ASSUMPTIONS.aggressive },
    { name: 'Investor',     color: '#d97706', monthlyGrowth: 0.20, arpa: 50, churn: CHURN_ASSUMPTIONS.investor },
  ];

  return scenarios.map(sc => {
    const months: ForecastMonth[] = [];
    let mrr = REVENUE.currentMRR;
    let customers = REVENUE.activeClients;
    let cash = CASH_ESTIMATE;

    let months100k: number | null = null;
    let months1m: number | null = null;

    const monthNames = ['Jun 2026','Jul 2026','Aug 2026','Sep 2026','Oct 2026','Nov 2026',
      'Dec 2026','Jan 2027','Feb 2027','Mar 2027','Apr 2027','May 2027',
      'Jun 2027','Jul 2027','Aug 2027','Sep 2027','Oct 2027','Nov 2027',
      'Dec 2027','Jan 2028','Feb 2028','Mar 2028','Apr 2028','May 2028'];

    for (let i = 0; i < 24; i++) {
      const churnedMRR = Math.round(mrr * (sc.churn / 100));
      const newClients = Math.max(1, Math.round(customers * sc.monthlyGrowth * 0.35));
      const newMRR = Math.round(newClients * sc.arpa);
      const expansionMRR = Math.round(mrr * 0.01); // 1% expansion
      const netNew = newMRR + expansionMRR - churnedMRR;
      const endingMRR = mrr + netNew;
      customers = Math.round(customers * (1 - sc.churn / 100) + newClients);
      const burn = MONTHLY_BURN_ESTIMATE;
      cash = cash - burn + endingMRR;
      const runway = endingMRR > 0 ? Math.round(cash / Math.max(1, burn - endingMRR) * 10) / 10 : cash / burn;

      if (months100k === null && endingMRR * 12 >= 99600) months100k = i + 1;
      if (months1m === null && endingMRR * 12 >= 996000) months1m = i + 1;

      months.push({
        month: monthNames[i],
        starting_mrr: mrr,
        new_mrr: newMRR,
        expansion_mrr: expansionMRR,
        churned_mrr: churnedMRR,
        net_new_mrr: netNew,
        ending_mrr: endingMRR,
        arr: endingMRR * 12,
        customers,
        cash: Math.max(0, cash),
        burn,
        runway_months: Math.max(0, Math.round(runway * 10) / 10),
        closes_needed: newClients,
        pipeline_needed: Math.round(newMRR * 12 / (0.25)),
        meetings_needed: Math.round(newClients / 0.25),
        leads_needed: Math.round(newClients / 0.08),
      });

      mrr = endingMRR;
    }

    return {
      name: sc.name,
      color: sc.color,
      monthly_growth_rate: sc.monthlyGrowth,
      new_clients_per_month: Math.round(REVENUE.activeClients * sc.monthlyGrowth * 0.35),
      arpa: sc.arpa,
      churn_rate: sc.churn,
      months_to_100k_arr: months100k,
      months_to_1m_arr: months1m,
      months,
    };
  });
}

// ─── Campaign Summary ─────────────────────────────────────────────────────────

export function getCampaignSummary() {
  return {
    totalCampaigns: SEED_CAMPAIGNS.length,
    totalEmailsSent: SEED_CAMPAIGNS.reduce((s, c) => s + c.emails_sent, 0),
    totalMeetingsBooked: SEED_CAMPAIGNS.reduce((s, c) => s + c.meetings_booked, 0),
    totalDealsCreated: SEED_CAMPAIGNS.reduce((s, c) => s + c.deals_created, 0),
    totalPipelineGenerated: SEED_CAMPAIGNS.reduce((s, c) => s + c.pipeline_generated, 0),
    totalClosedMRR: SEED_CAMPAIGNS.reduce((s, c) => s + c.closed_mrr, 0),
    avgOpenRate: Math.round(SEED_CAMPAIGNS.reduce((s, c) => s + c.open_rate, 0) / SEED_CAMPAIGNS.length * 10) / 10,
    avgReplyRate: Math.round(SEED_CAMPAIGNS.reduce((s, c) => s + c.reply_rate, 0) / SEED_CAMPAIGNS.length * 10) / 10,
    avgPositiveReplyRate: Math.round(SEED_CAMPAIGNS.reduce((s, c) => s + c.positive_reply_rate, 0) / SEED_CAMPAIGNS.length * 10) / 10,
  };
}

// ─── Investor Metrics ─────────────────────────────────────────────────────────

export function getInvestorMetrics() {
  const pipeline = calcPipeline();
  const scenarios = calcForecastScenarios();
  const expected = scenarios.find(s => s.name === 'Expected')!;

  return {
    mrr: REVENUE.currentMRR,
    arr: REVENUE.arr,
    activeClients: REVENUE.activeClients,
    arpa: REVENUE.arpa,
    pipelineGross: pipeline.totalGross,
    weightedPipeline: pipeline.totalWeighted,
    weightedMRR: pipeline.weightedMRR,
    closedWonDeals: CLOSED_WON.length,
    activePipelineDeals: ACTIVE_PIPELINE.length,
    months_to_100k_arr: expected.months_to_100k_arr,
    months_to_1m_arr: expected.months_to_1m_arr,
  };
}

// ─── Boardroom operating functions ───────────────────────────────────────────

export type BusinessStatus = 'on_track' | 'behind' | 'critical';

export interface OperatingState {
  status: BusinessStatus;
  headline: string;
  signals: string[];
}

export interface ActionItem {
  deal_id: string;
  company: string;
  stage: string;
  mrr: number;
  owner: string;
  action: string;
  due: string;
  urgency: 'now' | 'this_week' | 'this_month';
}

export interface MilestoneState {
  current: number;
  target: number;
  targetLabel: string;
  pct: number;
  monthsAtCurrentPace: number | null;
  requiredMonthlyNew: number;
}

export function getOperatingState(): OperatingState {
  const mrr = REVENUE.currentMRR;
  const runway = CASH_ESTIMATE / Math.max(1, MONTHLY_BURN_ESTIMATE - mrr);
  const pipeline = calcPipeline();
  const stale = pipeline.staleCount;
  const target100k = 8300;
  const pct = mrr / target100k;

  if (runway < 3 || (pct < 0.10 && stale > 3)) {
    return {
      status: 'critical',
      headline: `Critical — ${runway.toFixed(1)} months runway. MRR is ${(pct * 100).toFixed(0)}% of €100k ARR target.`,
      signals: [
        `Runway: ${runway.toFixed(1)} months at current burn`,
        `${stale} stale deals risk ${(pipeline.stalePipeline / 1000).toFixed(1)}k pipeline`,
        `Need €${(target100k - mrr).toLocaleString()} more MRR for €100k ARR`,
      ],
    };
  }

  if (runway < 6 || pct < 0.30) {
    return {
      status: 'behind',
      headline: `Behind schedule — Runway is ${runway.toFixed(1)} months. €${mrr.toLocaleString()} MRR is ${(pct * 100).toFixed(0)}% of €100k ARR target.`,
      signals: [
        `${pipeline.closingThisMonth.length} deal${pipeline.closingThisMonth.length !== 1 ? 's' : ''} expected to close this month`,
        `Weighted pipeline: €${(pipeline.weightedMRR).toLocaleString()}/mo`,
        stale > 0 ? `${stale} stale deals need follow-up` : 'Pipeline health is clean',
      ],
    };
  }

  return {
    status: 'on_track',
    headline: `On track — €${mrr.toLocaleString()} MRR, ${runway.toFixed(1)} months runway, ${pipeline.closingThisMonth.length} deals closing this month.`,
    signals: [
      `${(pct * 100).toFixed(0)}% of the way to €100k ARR`,
      `${pipeline.closingThisMonth.length} deal${pipeline.closingThisMonth.length !== 1 ? 's' : ''} in close window`,
      'Runway is comfortable',
    ],
  };
}

export function getActionQueue(): ActionItem[] {
  const now = new Date('2026-05-31');
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return ACTIVE_PIPELINE
    .filter(d => !['Nurture', 'Closed Won', 'Closed Lost'].includes(d.deal_stage))
    .filter(d => d.deal_health !== 'Low Quality')
    .map(d => {
      const due = d.next_step_due_date && d.next_step_due_date !== '—' ? new Date(d.next_step_due_date) : null;
      let urgency: 'now' | 'this_week' | 'this_month' = 'this_month';
      if (due && due <= in7days) urgency = 'now';
      else if (d.deal_health === 'High Intent' || d.deal_stage === 'Negotiation') urgency = 'this_week';
      else if (due && due <= in30days) urgency = 'this_week';

      return {
        deal_id: d.deal_id,
        company: d.company_name,
        stage: d.deal_stage,
        mrr: d.expected_mrr,
        owner: d.owner,
        action: d.next_step,
        due: d.next_step_due_date,
        urgency,
      };
    })
    .sort((a, b) => {
      const order = { now: 0, this_week: 1, this_month: 2 };
      if (order[a.urgency] !== order[b.urgency]) return order[a.urgency] - order[b.urgency];
      return b.mrr - a.mrr;
    })
    .slice(0, 8);
}

export function getMilestoneProgress(): MilestoneState {
  const mrr = REVENUE.currentMRR;
  const target = 8300; // €100k ARR = €8,300 MRR
  const pct = Math.min(100, (mrr / target) * 100);
  const netNewPerMonth = 250; // ~€280 new - €80 churn
  const monthsAtCurrentPace = netNewPerMonth > 0
    ? Math.ceil((target - mrr) / netNewPerMonth)
    : null;
  const requiredMonthlyNew = Math.ceil((target - mrr) / 12); // to hit in 12 months

  return { current: mrr, target, targetLabel: '€100k ARR', pct, monthsAtCurrentPace, requiredMonthlyNew };
}

export function getPipelineThisMonth() {
  return calcPipeline().closingThisMonth.sort((a, b) => b.expected_mrr - a.expected_mrr);
}

export function getRevenueQualitySignals() {
  const mrr = REVENUE.currentMRR;
  const activeClients = REVENUE.activeClients;
  const arpa = REVENUE.arpa;
  const growthRate = 12.5; // % MoM
  const monthlyNewMRR = 280;
  const churnedMRR = 80;
  const expansionMRR = 50;
  const netNew = monthlyNewMRR + expansionMRR - churnedMRR;
  const churnRate = 2.1;
  const closedLostCount = CLOSED_LOST.length;

  return {
    mrr, arpa, growthRate, monthlyNewMRR, churnedMRR, expansionMRR, netNew,
    churnRate, closedLostCount, activeClients,
    netBurnRate: MONTHLY_BURN_ESTIMATE - mrr,
    runway: CASH_ESTIMATE / Math.max(1, MONTHLY_BURN_ESTIMATE - mrr),
  };
}
