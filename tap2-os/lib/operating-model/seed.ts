// Tap2 Operating Model — Unified Seed Dataset
// All pages derive their metrics from this single source of truth.
// MRR from Closed Won deals reconciles with /revenue (€1,400 MRR, 32 active clients).

import type { Deal, Campaign } from './types';
import { STAGE_PROBABILITY } from './constants';

function mrr(m: number) { return { expected_mrr: m, expected_arr: m * 12, amount: m * 12 }; }
function w(deal: Omit<Deal, 'weighted_mrr' | 'weighted_arr' | 'probability'>): Deal {
  const prob = STAGE_PROBABILITY[deal.deal_stage] ?? 0;
  return {
    ...deal,
    probability: prob,
    weighted_mrr: Math.round(deal.expected_mrr * prob / 100),
    weighted_arr: Math.round(deal.expected_arr * prob / 100),
  };
}

// ─── Campaigns (referenced by deals) ────────────────────────────────────────
export const SEED_CAMPAIGNS: Campaign[] = [
  {
    campaign_id: 'c-nl-q4-2025',
    campaign_name: 'NL Cold Email Q4 2025',
    market: 'Netherlands',
    segment: 'HoReCa',
    owner: 'Carlo',
    status: 'Completed',
    start_date: '2025-10-01',
    emails_sent: 1840,
    delivered: 1746,
    bounced: 94,
    bounce_rate: 5.1,
    open_rate: 38.4,
    reply_rate: 8.2,
    positive_reply_rate: 3.8,
    negative_reply_rate: 2.7,
    unsubscribe_rate: 1.7,
    meetings_booked: 22,
    meetings_completed: 18,
    demos_completed: 14,
    deals_created: 14,
    pipeline_generated: 12460,
    weighted_pipeline: 5820,
    closed_mrr: 356,
    closed_arr: 4272,
    cost_estimate: 380,
    cost_per_reply: 2.51,
    cost_per_meeting: 17.27,
    pipeline_per_1000: 6772,
    closed_mrr_per_1000: 193,
    quality_score: 74,
    insights: [
      'Strong open rate (38%) — subject lines working for NL HoReCa',
      'Reply-to-meeting conversion at 47% — solid but improvable',
      'Meeting-to-close at 25% — needs objection handling script',
    ],
  },
  {
    campaign_id: 'c-es-q4-2025',
    campaign_name: 'Spain Cold Email Q4 2025',
    market: 'Spain',
    segment: 'HoReCa',
    owner: 'Joaquin',
    status: 'Completed',
    start_date: '2025-10-15',
    emails_sent: 960,
    delivered: 902,
    bounced: 58,
    bounce_rate: 6.0,
    open_rate: 34.2,
    reply_rate: 6.9,
    positive_reply_rate: 3.1,
    negative_reply_rate: 2.4,
    unsubscribe_rate: 1.4,
    meetings_booked: 12,
    meetings_completed: 9,
    demos_completed: 7,
    deals_created: 7,
    pipeline_generated: 4116,
    weighted_pipeline: 1890,
    closed_mrr: 147,
    closed_arr: 1764,
    cost_estimate: 220,
    cost_per_reply: 3.33,
    cost_per_meeting: 18.33,
    pipeline_per_1000: 4288,
    closed_mrr_per_1000: 153,
    quality_score: 62,
    insights: [
      'Lower reply rate than NL — Spanish market takes longer to warm up',
      'High negative reply rate — consider localising value prop more',
      'Joaquin local relationships compensate for cold performance',
    ],
  },
  {
    campaign_id: 'c-co-q4-2025',
    campaign_name: 'Colombia Outbound Q4 2025',
    market: 'Colombia',
    segment: 'HoReCa',
    owner: 'Jonathan',
    status: 'Active',
    start_date: '2025-11-01',
    emails_sent: 620,
    delivered: 594,
    bounced: 26,
    bounce_rate: 4.2,
    open_rate: 41.6,
    reply_rate: 9.4,
    positive_reply_rate: 5.1,
    negative_reply_rate: 2.5,
    unsubscribe_rate: 1.8,
    meetings_booked: 14,
    meetings_completed: 11,
    demos_completed: 9,
    deals_created: 9,
    pipeline_generated: 3132,
    weighted_pipeline: 1540,
    closed_mrr: 87,
    closed_arr: 1044,
    cost_estimate: 140,
    cost_per_reply: 2.40,
    cost_per_meeting: 10.00,
    pipeline_per_1000: 5052,
    closed_mrr_per_1000: 140,
    quality_score: 70,
    insights: [
      'Best positive reply rate across all campaigns (5.1%)',
      'Cost per meeting is lowest at €10 — efficient market',
      'ARPA is lower (€29/mo) — needs volume or expansion path',
    ],
  },
  {
    campaign_id: 'c-it-q4-2025',
    campaign_name: 'Italy Cold Email Q4 2025',
    market: 'Italy',
    segment: 'HoReCa',
    owner: 'Carlo',
    status: 'Active',
    start_date: '2025-11-15',
    emails_sent: 480,
    delivered: 451,
    bounced: 29,
    bounce_rate: 6.0,
    open_rate: 29.8,
    reply_rate: 5.5,
    positive_reply_rate: 2.4,
    negative_reply_rate: 2.0,
    unsubscribe_rate: 1.1,
    meetings_booked: 7,
    meetings_completed: 5,
    demos_completed: 4,
    deals_created: 4,
    pipeline_generated: 2352,
    weighted_pipeline: 1050,
    closed_mrr: 98,
    closed_arr: 1176,
    cost_estimate: 120,
    cost_per_reply: 4.55,
    cost_per_meeting: 17.14,
    pipeline_per_1000: 4900,
    closed_mrr_per_1000: 204,
    quality_score: 58,
    insights: [
      'Lowest open rate — subject lines need localisation for Italian market',
      'Strong MRR/1000 when it closes — quality over quantity',
      'Consider Horecava Italy equivalent events to supplement cold',
    ],
  },
  {
    campaign_id: 'c-nl-gym-2026',
    campaign_name: 'NL Gym & Membership Q1 2026',
    market: 'Netherlands',
    segment: 'Gym / Membership',
    owner: 'Dorian',
    status: 'Active',
    start_date: '2026-01-15',
    emails_sent: 340,
    delivered: 326,
    bounced: 14,
    bounce_rate: 4.1,
    open_rate: 44.2,
    reply_rate: 11.0,
    positive_reply_rate: 5.8,
    negative_reply_rate: 2.6,
    unsubscribe_rate: 2.6,
    meetings_booked: 9,
    meetings_completed: 6,
    demos_completed: 4,
    deals_created: 4,
    pipeline_generated: 3204,
    weighted_pipeline: 1640,
    closed_mrr: 89,
    closed_arr: 1068,
    cost_estimate: 90,
    cost_per_reply: 2.41,
    cost_per_meeting: 10.00,
    pipeline_per_1000: 9424,
    closed_mrr_per_1000: 262,
    quality_score: 78,
    insights: [
      'Highest open and reply rates — gym segment highly receptive',
      'Best pipeline/1000 emails across all campaigns',
      'New segment validation — consider scaling if 2-3 more close',
    ],
  },
];

// ─── Unified Deal Seed ────────────────────────────────────────────────────────
// Total Closed Won MRR ≈ €1,400 (reconciles with /revenue)
// Active pipeline ≈ €42k gross, €19k weighted

export const SEED_DEALS: Deal[] = [

  // ── CLOSED WON ─────────────────────────────────────────────────────────────
  // NL HoReCa (10 × €89 = €890 MRR)
  w({ deal_id:'cw-01', deal_name:'Loyalty Wallet Growth', company_name:'Brasserie De Kade', company_domain:'brasserie-de-kade.nl', country:'NL', city:'Amsterdam', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(89), owner:'Giuseppe', partner_owner:'Giuseppe', source:'Horecava', source_detail:'Horecava 2025 stand', campaign_id:null, campaign_name:null, created_date:'2025-01-08', last_activity_date:'2025-01-15', close_date:'2025-01-15', expected_close_month:'Jan 2025', days_in_stage:0, sales_cycle_days:7, next_step:'Active customer — quarterly check-in', next_step_due_date:'2026-04-15', deal_health:'Healthy', deal_quality:'A', quality_score:88, urgency:'Low', lost_reason:null, competitor:null, objections:[], notes:'First Horecava win. Champion was owner Marco.' }),
  w({ deal_id:'cw-02', deal_name:'Loyalty Wallet Growth', company_name:'Grand Café Centraal', company_domain:'grandcafe-centraal.nl', country:'NL', city:'Amsterdam', industry:'HoReCa', segment:'Café / Bar / Takeaway', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(89), owner:'Dorian', partner_owner:'Dorian', source:'Cold Calling', source_detail:'Direct dial outbound NL', campaign_id:null, campaign_name:null, created_date:'2025-01-22', last_activity_date:'2025-02-01', close_date:'2025-02-01', expected_close_month:'Feb 2025', days_in_stage:0, sales_cycle_days:10, next_step:'Active customer — product update call Q2', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'A', quality_score:82, urgency:'Low', lost_reason:null, competitor:null, objections:['Price hesitation initially'], notes:'Closed after pricing objection resolved with 30-day trial.' }),
  w({ deal_id:'cw-03', deal_name:'Loyalty Wallet Growth', company_name:'Café Hoorn', company_domain:'cafe-hoorn.nl', country:'NL', city:'Hoorn', industry:'HoReCa', segment:'Café / Bar / Takeaway', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(89), owner:'Giuseppe', partner_owner:'Giuseppe', source:'Referral', source_detail:'Referred by De Kade owner', campaign_id:null, campaign_name:null, created_date:'2025-01-15', last_activity_date:'2025-01-20', close_date:'2025-01-20', expected_close_month:'Jan 2025', days_in_stage:0, sales_cycle_days:5, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'A', quality_score:91, urgency:'Low', lost_reason:null, competitor:null, objections:[], notes:'Fast close via warm referral. Best conversion source.' }),
  w({ deal_id:'cw-04', deal_name:'Loyalty Wallet Growth', company_name:'Eetcafé De Zon', company_domain:'eetcafe-de-zon.nl', country:'NL', city:'Haarlem', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(89), owner:'Carlo', partner_owner:'Carlo', source:'Cold Email', source_detail:'NL Cold Email Q4 2025', campaign_id:'c-nl-q4-2025', campaign_name:'NL Cold Email Q4 2025', created_date:'2025-10-12', last_activity_date:'2025-11-01', close_date:'2025-11-01', expected_close_month:'Nov 2025', days_in_stage:0, sales_cycle_days:20, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'B', quality_score:74, urgency:'Low', lost_reason:null, competitor:null, objections:['Needs to see ROI'], notes:'Closed after ROI case study shared.' }),
  w({ deal_id:'cw-05', deal_name:'Loyalty Wallet Growth', company_name:'Stadsbrouwerij Utrecht', company_domain:'stadsbrouwerij-utrecht.nl', country:'NL', city:'Utrecht', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card + win-back', deal_stage:'Closed Won', ...mrr(89), owner:'Giuseppe', partner_owner:'Giuseppe', source:'Horecava', source_detail:'Horecava 2025 follow-up', campaign_id:null, campaign_name:null, created_date:'2025-01-20', last_activity_date:'2025-03-22', close_date:'2025-03-22', expected_close_month:'Mar 2025', days_in_stage:0, sales_cycle_days:61, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'B', quality_score:76, urgency:'Low', lost_reason:null, competitor:null, objections:['Long evaluation period'], notes:'Slow close — wanted to pilot with competitor first.' }),
  w({ deal_id:'cw-06', deal_name:'Loyalty Wallet Growth', company_name:'Havana Club Rotterdam', company_domain:'havana-rotterdam.nl', country:'NL', city:'Rotterdam', industry:'HoReCa', segment:'Café / Bar / Takeaway', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(89), owner:'Dorian', partner_owner:'Dorian', source:'Cold Calling', source_detail:'Direct dial outbound NL', campaign_id:null, campaign_name:null, created_date:'2025-04-01', last_activity_date:'2025-04-18', close_date:'2025-04-18', expected_close_month:'Apr 2025', days_in_stage:0, sales_cycle_days:17, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'A', quality_score:83, urgency:'Low', lost_reason:null, competitor:null, objections:[], notes:'Quick close. Bar owner was ready to replace paper stamps.' }),
  w({ deal_id:'cw-07', deal_name:'Loyalty Wallet Growth', company_name:'Skybar Den Haag', company_domain:'skybar-denhaag.nl', country:'NL', city:'Den Haag', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(89), owner:'Niels', partner_owner:'Niels', source:'LinkedIn', source_detail:'LinkedIn organic outreach', campaign_id:null, campaign_name:null, created_date:'2025-07-01', last_activity_date:'2025-07-10', close_date:'2025-07-10', expected_close_month:'Jul 2025', days_in_stage:0, sales_cycle_days:9, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'A', quality_score:80, urgency:'Low', lost_reason:null, competitor:null, objections:[], notes:'LinkedIn outreach conversion — Niels connection.' }),
  w({ deal_id:'cw-08', deal_name:'Loyalty Wallet Growth', company_name:'Kapsalon Centrum', company_domain:'kapsalon-centrum.nl', country:'NL', city:'Amsterdam', industry:'Beauty / Wellness', segment:'Beauty / Wellness', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(89), owner:'Carlo', partner_owner:'Carlo', source:'Cold Email', source_detail:'NL Cold Email Q4 2025', campaign_id:'c-nl-q4-2025', campaign_name:'NL Cold Email Q4 2025', created_date:'2025-10-20', last_activity_date:'2025-11-18', close_date:'2025-11-18', expected_close_month:'Nov 2025', days_in_stage:0, sales_cycle_days:29, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'B', quality_score:70, urgency:'Low', lost_reason:null, competitor:null, objections:['Not sure wallet works for beauty'], notes:'First beauty segment close. Good proof point for new ICP.' }),
  w({ deal_id:'cw-09', deal_name:'Loyalty Wallet Growth', company_name:'Snackbar De Hoek', company_domain:'snackbar-de-hoek.nl', country:'NL', city:'Breda', industry:'HoReCa', segment:'Café / Bar / Takeaway', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(89), owner:'Giuseppe', partner_owner:'Giuseppe', source:'Referral', source_detail:'Referred by Café Hoorn', campaign_id:null, campaign_name:null, created_date:'2025-09-25', last_activity_date:'2025-10-01', close_date:'2025-10-01', expected_close_month:'Oct 2025', days_in_stage:0, sales_cycle_days:6, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'A', quality_score:87, urgency:'Low', lost_reason:null, competitor:null, objections:[], notes:'Referral flywheel working. 3rd close via Café Hoorn network.' }),
  w({ deal_id:'cw-10', deal_name:'Loyalty + Win-back', company_name:'Brasserie Noord', company_domain:'brasserie-noord.nl', country:'NL', city:'Amsterdam', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card + win-back', deal_stage:'Closed Won', ...mrr(89), owner:'Dorian', partner_owner:'Dorian', source:'Cold Email', source_detail:'NL Cold Email Q4 2025', campaign_id:'c-nl-q4-2025', campaign_name:'NL Cold Email Q4 2025', created_date:'2025-11-05', last_activity_date:'2025-12-11', close_date:'2025-12-11', expected_close_month:'Dec 2025', days_in_stage:0, sales_cycle_days:36, next_step:'Active — onboarding', next_step_due_date:'2026-01-11', deal_health:'Healthy', deal_quality:'B', quality_score:72, urgency:'Low', lost_reason:null, competitor:null, objections:['Already has a digital stamp card'], notes:'Competitor displacement. Faster notifications was key differentiator.' }),

  // NL Gym / Fitness (2 × €89 = €178 MRR)
  w({ deal_id:'cw-11', deal_name:'Loyalty Wallet Growth', company_name:'Gym & Sports Club Breda', company_domain:'gymsports-breda.nl', country:'NL', city:'Breda', industry:'Gym / Sports', segment:'Gym / Sports Club', use_case:'Membership loyalty card', deal_stage:'Closed Won', ...mrr(89), owner:'Giuseppe', partner_owner:'Giuseppe', source:'Cold Email', source_detail:'NL Cold Email Q4 2025', campaign_id:'c-nl-q4-2025', campaign_name:'NL Cold Email Q4 2025', created_date:'2025-10-08', last_activity_date:'2025-11-01', close_date:'2025-11-01', expected_close_month:'Nov 2025', days_in_stage:0, sales_cycle_days:24, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'B', quality_score:73, urgency:'Low', lost_reason:null, competitor:null, objections:['Members prefer app'], notes:'First gym win. Wallet pass vs app — key objection resolved by demo.' }),
  w({ deal_id:'cw-12', deal_name:'Loyalty Wallet Basic', company_name:'Fitness Center Eindhoven', company_domain:'fitnesscenter-eindhoven.nl', country:'NL', city:'Eindhoven', industry:'Gym / Sports', segment:'Gym / Sports Club', use_case:'Membership loyalty card', deal_stage:'Closed Won', ...mrr(49), owner:'Dorian', partner_owner:'Dorian', source:'Referral', source_detail:'Referred by Gym Breda', campaign_id:null, campaign_name:null, created_date:'2025-08-10', last_activity_date:'2025-08-15', close_date:'2025-08-15', expected_close_month:'Aug 2025', days_in_stage:0, sales_cycle_days:5, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'A', quality_score:85, urgency:'Low', lost_reason:null, competitor:null, objections:[], notes:'Referral from Breda gym. Very fast close.' }),

  // NL Other segments (2 × €49 = €98 MRR)
  w({ deal_id:'cw-13', deal_name:'Loyalty Wallet Basic', company_name:'Barbershop Jordaan', company_domain:'barbershop-jordaan.nl', country:'NL', city:'Amsterdam', industry:'Beauty / Wellness', segment:'Beauty / Wellness', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(49), owner:'Niels', partner_owner:'Niels', source:'LinkedIn', source_detail:'LinkedIn organic', campaign_id:null, campaign_name:null, created_date:'2025-09-01', last_activity_date:'2025-09-10', close_date:'2025-09-10', expected_close_month:'Sep 2025', days_in_stage:0, sales_cycle_days:9, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'B', quality_score:71, urgency:'Low', lost_reason:null, competitor:null, objections:[], notes:'Beauty/wellness expansion from LinkedIn.' }),
  w({ deal_id:'cw-14', deal_name:'Loyalty Wallet Basic', company_name:'Nail Studio Vondelpark', company_domain:'nailstudio-vondelpark.nl', country:'NL', city:'Amsterdam', industry:'Beauty / Wellness', segment:'Beauty / Wellness', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(49), owner:'Carlo', partner_owner:'Carlo', source:'Cold Email', source_detail:'NL Cold Email Q4 2025', campaign_id:'c-nl-q4-2025', campaign_name:'NL Cold Email Q4 2025', created_date:'2025-09-12', last_activity_date:'2025-09-22', close_date:'2025-09-22', expected_close_month:'Sep 2025', days_in_stage:0, sales_cycle_days:10, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'B', quality_score:68, urgency:'Low', lost_reason:null, competitor:null, objections:['Small customer base'], notes:'Nail studio — small but loyal customer base use case works.' }),

  // Spain (3 × €49 = €147 MRR)
  w({ deal_id:'cw-15', deal_name:'Loyalty Wallet Spain', company_name:'El Patio Madrid', company_domain:'elpatio-madrid.es', country:'ES', city:'Madrid', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(49), owner:'Joaquin', partner_owner:'Joaquin', source:'HIP Spain', source_detail:'HIP 2025 Barcelona', campaign_id:null, campaign_name:null, created_date:'2025-03-01', last_activity_date:'2025-03-10', close_date:'2025-03-10', expected_close_month:'Mar 2025', days_in_stage:0, sales_cycle_days:9, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'A', quality_score:80, urgency:'Low', lost_reason:null, competitor:null, objections:[], notes:'HIP Spain trade show. Joaquin local presence critical.' }),
  w({ deal_id:'cw-16', deal_name:'Loyalty Wallet Spain', company_name:'La Terraza Barcelona', company_domain:'la-terraza-bcn.es', country:'ES', city:'Barcelona', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(49), owner:'Joaquin', partner_owner:'Joaquin', source:'HIP Spain', source_detail:'HIP 2025 Barcelona', campaign_id:null, campaign_name:null, created_date:'2025-04-01', last_activity_date:'2025-04-05', close_date:'2025-04-05', expected_close_month:'Apr 2025', days_in_stage:0, sales_cycle_days:4, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'A', quality_score:82, urgency:'Low', lost_reason:null, competitor:null, objections:[], notes:'HIP Spain follow-up close.' }),
  w({ deal_id:'cw-17', deal_name:'Loyalty Wallet Spain', company_name:'Bodega Sur Sevilla', company_domain:'bodegasur-sevilla.es', country:'ES', city:'Sevilla', industry:'HoReCa', segment:'Café / Bar / Takeaway', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(49), owner:'Joaquin', partner_owner:'Joaquin', source:'Cold Email', source_detail:'Spain Cold Email Q4 2025', campaign_id:'c-es-q4-2025', campaign_name:'Spain Cold Email Q4 2025', created_date:'2025-10-20', last_activity_date:'2025-11-15', close_date:'2025-11-15', expected_close_month:'Nov 2025', days_in_stage:0, sales_cycle_days:26, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'B', quality_score:67, urgency:'Low', lost_reason:null, competitor:null, objections:['Language barrier on technical setup'], notes:'Cold email → local demo → close. Spanish UX needed.' }),

  // Colombia (4 × €29 = €116 MRR)
  w({ deal_id:'cw-18', deal_name:'Colombia Starter', company_name:'Taberna Central Bogotá', company_domain:'taberna-central.co', country:'CO', city:'Bogotá', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(29), owner:'Jonathan', partner_owner:'Jonathan', source:'Colombia Outbound', source_detail:'Direct outbound Bogotá', campaign_id:'c-co-q4-2025', campaign_name:'Colombia Outbound Q4 2025', created_date:'2025-05-01', last_activity_date:'2025-05-08', close_date:'2025-05-08', expected_close_month:'May 2025', days_in_stage:0, sales_cycle_days:7, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'B', quality_score:69, urgency:'Low', lost_reason:null, competitor:null, objections:[], notes:'Colombian market first close. Jonathan local market.' }),
  w({ deal_id:'cw-19', deal_name:'Colombia Starter', company_name:'Café Bogotá Centro', company_domain:'cafe-bogota.co', country:'CO', city:'Bogotá', industry:'HoReCa', segment:'Café / Bar / Takeaway', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(29), owner:'Jonathan', partner_owner:'Jonathan', source:'Colombia Outbound', source_detail:'Referral from Taberna Central', campaign_id:'c-co-q4-2025', campaign_name:'Colombia Outbound Q4 2025', created_date:'2025-08-01', last_activity_date:'2025-08-08', close_date:'2025-08-08', expected_close_month:'Aug 2025', days_in_stage:0, sales_cycle_days:7, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'B', quality_score:72, urgency:'Low', lost_reason:null, competitor:null, objections:[], notes:'Referral from Taberna Central.' }),
  w({ deal_id:'cw-20', deal_name:'Colombia Starter', company_name:'Pura Vida Medellín', company_domain:'puravida-medellin.co', country:'CO', city:'Medellín', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(29), owner:'Jonathan', partner_owner:'Jonathan', source:'Colombia Outbound', source_detail:'Direct outbound Medellín', campaign_id:'c-co-q4-2025', campaign_name:'Colombia Outbound Q4 2025', created_date:'2025-08-15', last_activity_date:'2025-08-22', close_date:'2025-08-22', expected_close_month:'Aug 2025', days_in_stage:0, sales_cycle_days:7, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'B', quality_score:68, urgency:'Low', lost_reason:null, competitor:null, objections:['Price sensitivity'], notes:'Medellín expansion. Growing market.' }),
  w({ deal_id:'cw-21', deal_name:'Colombia Starter', company_name:'El Rincón Cartagena', company_domain:'elrincon-cartagena.co', country:'CO', city:'Cartagena', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(29), owner:'Jonathan', partner_owner:'Jonathan', source:'Referral', source_detail:'Referred by Bogotá client', campaign_id:null, campaign_name:null, created_date:'2025-10-01', last_activity_date:'2025-10-05', close_date:'2025-10-05', expected_close_month:'Oct 2025', days_in_stage:0, sales_cycle_days:4, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'A', quality_score:78, urgency:'Low', lost_reason:null, competitor:null, objections:[], notes:'Fastest close in Colombia. Referral effect.' }),

  // Italy (2 × €49 = €98 MRR)
  w({ deal_id:'cw-22', deal_name:'Italy Standard', company_name:'Trattoria Lombarda Milan', company_domain:'trattoria-lombarda.it', country:'IT', city:'Milan', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(49), owner:'Carlo', partner_owner:'Carlo', source:'Italy Outbound', source_detail:'Italy Cold Email Q4 2025', campaign_id:'c-it-q4-2025', campaign_name:'Italy Cold Email Q4 2025', created_date:'2025-06-01', last_activity_date:'2025-07-01', close_date:'2025-07-01', expected_close_month:'Jul 2025', days_in_stage:0, sales_cycle_days:30, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'B', quality_score:66, urgency:'Low', lost_reason:null, competitor:null, objections:['Prefers app-based'], notes:'Italian market slow. Carlo Italian language essential.' }),
  w({ deal_id:'cw-23', deal_name:'Italy Standard', company_name:'Osteria Veneziana', company_domain:'osteria-veneziana.it', country:'IT', city:'Venice', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Closed Won', ...mrr(49), owner:'Carlo', partner_owner:'Carlo', source:'Italy Outbound', source_detail:'Italy Cold Email Q4 2025', campaign_id:'c-it-q4-2025', campaign_name:'Italy Cold Email Q4 2025', created_date:'2025-10-10', last_activity_date:'2025-11-10', close_date:'2025-11-10', expected_close_month:'Nov 2025', days_in_stage:0, sales_cycle_days:31, next_step:'Active', next_step_due_date:'2026-04-01', deal_health:'Healthy', deal_quality:'B', quality_score:64, urgency:'Low', lost_reason:null, competitor:null, objections:['Implementation complexity'], notes:'Second Italian close. Carlo building a mini-network.' }),

  // Partner / white-label (1 × €89 = €89 MRR)
  w({ deal_id:'cw-24', deal_name:'Qubico Demo Venue', company_name:'Qubico Demo Venue', company_domain:'qubico.studio', country:'NL', city:'Amsterdam', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Agency pilot', deal_stage:'Closed Won', ...mrr(89), owner:'Qubico Studio', partner_owner:'Qubico Studio', source:'Qubico Studio', source_detail:'Agency referral', campaign_id:null, campaign_name:null, created_date:'2025-11-01', last_activity_date:'2025-11-15', close_date:'2025-11-15', expected_close_month:'Nov 2025', days_in_stage:0, sales_cycle_days:14, next_step:'Agency expansion discussion', next_step_due_date:'2026-06-01', deal_health:'Healthy', deal_quality:'B', quality_score:70, urgency:'Low', lost_reason:null, competitor:null, objections:[], notes:'Agency pilot. Could unlock multi-venue white-label.' }),

  // ── ACTIVE PIPELINE ─────────────────────────────────────────────────────────

  // Negotiation (2 deals — should close this month)
  w({ deal_id:'p-01', deal_name:'Loyalty + Win-back Pro', company_name:'CitySales Restaurant Group', company_domain:'citysales.nl', country:'NL', city:'Amsterdam', industry:'HoReCa', segment:'Restaurant Group / Chain', use_case:'Multi-venue loyalty', deal_stage:'Negotiation', ...mrr(178), owner:'Giuseppe', partner_owner:'Giuseppe', source:'CitySales', source_detail:'CitySales distribution partner', campaign_id:null, campaign_name:null, created_date:'2025-12-01', last_activity_date:'2026-05-21', close_date:'2026-05-31', expected_close_month:'May 2026', days_in_stage:9, sales_cycle_days:150, next_step:'Final contract review — waiting on legal sign-off', next_step_due_date:'2026-05-31', deal_health:'Healthy', deal_quality:'A', quality_score:92, urgency:'High', lost_reason:null, competitor:null, objections:[], notes:'Largest deal in pipeline. Multi-venue group. CitySales distribution.' }),
  w({ deal_id:'p-02', deal_name:'Loyalty Wallet Spain Pro', company_name:'Verde Gourmet Barcelona', company_domain:'verde-gourmet.es', country:'ES', city:'Barcelona', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Negotiation', ...mrr(89), owner:'Joaquin', partner_owner:'Joaquin', source:'HIP Spain', source_detail:'HIP 2025 Barcelona follow-up', campaign_id:null, campaign_name:null, created_date:'2025-11-15', last_activity_date:'2026-05-22', close_date:'2026-05-30', expected_close_month:'May 2026', days_in_stage:8, sales_cycle_days:166, next_step:'Price confirmation and onboarding date', next_step_due_date:'2026-05-30', deal_health:'High Intent', deal_quality:'A', quality_score:88, urgency:'High', lost_reason:null, competitor:null, objections:['Previous system switching cost'], notes:'Long cycle due to existing Stamp It contract. Ready to switch.' }),

  // Trial / Pilot (3 deals)
  w({ deal_id:'p-03', deal_name:'Agency White-Label Pilot', company_name:'Qubico Restaurant Group', company_domain:'qubico.studio', country:'NL', city:'Amsterdam', industry:'HoReCa', segment:'Restaurant Group / Chain', use_case:'Agency white-label', deal_stage:'Trial / Pilot', ...mrr(267), owner:'Qubico Studio', partner_owner:'Qubico Studio', source:'Qubico Studio', source_detail:'Agency partnership discussion', campaign_id:null, campaign_name:null, created_date:'2025-11-15', last_activity_date:'2026-05-15', close_date:'2026-06-15', expected_close_month:'Jun 2026', days_in_stage:15, sales_cycle_days:181, next_step:'Pilot review meeting — agency team feedback on 3-venue setup', next_step_due_date:'2026-06-10', deal_health:'Healthy', deal_quality:'A', quality_score:85, urgency:'Medium', lost_reason:null, competitor:null, objections:[], notes:'Agency wants white-label for restaurant clients. 3-venue pilot running.' }),
  w({ deal_id:'p-04', deal_name:'Loyalty Wallet Growth', company_name:'Madre Natura Torino', company_domain:'madre-natura.it', country:'IT', city:'Turin', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Trial / Pilot', ...mrr(49), owner:'Carlo', partner_owner:'Carlo', source:'Italy Outbound', source_detail:'Italy Cold Email Q4 2025', campaign_id:'c-it-q4-2025', campaign_name:'Italy Cold Email Q4 2025', created_date:'2025-11-20', last_activity_date:'2026-05-10', close_date:'2026-06-01', expected_close_month:'Jun 2026', days_in_stage:20, sales_cycle_days:161, next_step:'Check-in call on trial results — 80 scans logged', next_step_due_date:'2026-06-01', deal_health:'Healthy', deal_quality:'B', quality_score:72, urgency:'Medium', lost_reason:null, competitor:null, objections:[], notes:'Trial running well. 80 scans in first 3 weeks.' }),
  w({ deal_id:'p-05', deal_name:'Gym Membership Card', company_name:'Fit Republic Amsterdam', company_domain:'fitrepublic.nl', country:'NL', city:'Amsterdam', industry:'Gym / Sports', segment:'Gym / Sports Club', use_case:'Membership loyalty card', deal_stage:'Trial / Pilot', ...mrr(89), owner:'Dorian', partner_owner:'Dorian', source:'Cold Email', source_detail:'NL Gym & Membership Q1 2026', campaign_id:'c-nl-gym-2026', campaign_name:'NL Gym & Membership Q1 2026', created_date:'2026-02-10', last_activity_date:'2026-05-20', close_date:'2026-06-10', expected_close_month:'Jun 2026', days_in_stage:10, sales_cycle_days:109, next_step:'Decision call with gym owner this week', next_step_due_date:'2026-06-01', deal_health:'High Intent', deal_quality:'A', quality_score:86, urgency:'High', lost_reason:null, competitor:null, objections:[], notes:'Gym is happy with trial scan rate. Owner ready to decide.' }),

  // Proposal Sent (4 deals)
  w({ deal_id:'p-06', deal_name:'OptiDist Distribution Bundle', company_name:'OptiDist NL', company_domain:'optidist.nl', country:'NL', city:'Amsterdam', industry:'Distribution', segment:'Restaurant Group / Chain', use_case:'Distribution partner deal', deal_stage:'Proposal Sent', ...mrr(267), owner:'Giuseppe', partner_owner:'Giuseppe', source:'OptiDist', source_detail:'OptiDist distribution channel', campaign_id:null, campaign_name:null, created_date:'2025-12-10', last_activity_date:'2026-05-15', close_date:'2026-06-30', expected_close_month:'Jun 2026', days_in_stage:15, sales_cycle_days:171, next_step:'Follow-up on commercial terms — awaiting procurement sign-off', next_step_due_date:'2026-06-01', deal_health:'Needs Follow-up', deal_quality:'A', quality_score:81, urgency:'Medium', lost_reason:null, competitor:null, objections:['Procurement approval needed'], notes:'Distribution partner deal — could unlock 20+ venues in one close.' }),
  w({ deal_id:'p-07', deal_name:'Loyalty Wallet Growth', company_name:'Kale & Roots Eindhoven', company_domain:'kale-roots.nl', country:'NL', city:'Eindhoven', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Proposal Sent', ...mrr(89), owner:'Niels', partner_owner:'Niels', source:'LinkedIn', source_detail:'LinkedIn organic', campaign_id:null, campaign_name:null, created_date:'2025-12-05', last_activity_date:'2026-05-20', close_date:'2026-06-01', expected_close_month:'Jun 2026', days_in_stage:10, sales_cycle_days:175, next_step:'Follow-up call — asked for ROI examples from similar venues', next_step_due_date:'2026-06-01', deal_health:'Healthy', deal_quality:'B', quality_score:68, urgency:'Medium', lost_reason:null, competitor:null, objections:['Needs ROI examples'], notes:'Slow evaluator. Send case study and ROI calc.' }),
  w({ deal_id:'p-08', deal_name:'Colombia Growth Plan', company_name:'EcoEat Bogotá', company_domain:'ecoeat-bogota.co', country:'CO', city:'Bogotá', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Proposal Sent', ...mrr(29), owner:'Jonathan', partner_owner:'Jonathan', source:'Colombia Outbound', source_detail:'Colombia Outbound Q4 2025', campaign_id:'c-co-q4-2025', campaign_name:'Colombia Outbound Q4 2025', created_date:'2025-11-20', last_activity_date:'2026-05-10', close_date:'2026-06-01', expected_close_month:'Jun 2026', days_in_stage:20, sales_cycle_days:161, next_step:'Resend proposal with WhatsApp follow-up', next_step_due_date:'2026-05-31', deal_health:'Stale', deal_quality:'C', quality_score:52, urgency:'Low', lost_reason:null, competitor:null, objections:['Slow decision maker', 'Budget constrained'], notes:'Low urgency. WhatsApp contact needed.' }),
  w({ deal_id:'p-09', deal_name:'Loyalty Wallet Basic', company_name:'The Herbivore Brussels', company_domain:'herbivore-brussels.be', country:'BE', city:'Brussels', industry:'HoReCa', segment:'Café / Bar / Takeaway', use_case:'Loyalty stamp card', deal_stage:'Proposal Sent', ...mrr(49), owner:'Dorian', partner_owner:'Dorian', source:'Cold Email', source_detail:'NL Cold Email Q4 2025', campaign_id:'c-nl-q4-2025', campaign_name:'NL Cold Email Q4 2025', created_date:'2025-12-15', last_activity_date:'2026-05-18', close_date:'2026-06-15', expected_close_month:'Jun 2026', days_in_stage:12, sales_cycle_days:165, next_step:'Decision expected this week — follow-up Thursday', next_step_due_date:'2026-06-01', deal_health:'Healthy', deal_quality:'B', quality_score:66, urgency:'Medium', lost_reason:null, competitor:null, objections:[], notes:'Belgium expansion. Dorian follow-up pending.' }),

  // Demo Completed (3 deals)
  w({ deal_id:'p-10', deal_name:'Loyalty Wallet Growth', company_name:'Biocenter Antwerp', company_domain:'biocenter-antwerp.be', country:'BE', city:'Antwerp', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Demo Completed', ...mrr(89), owner:'Dorian', partner_owner:'Dorian', source:'Cold Calling', source_detail:'Direct dial outbound BE', campaign_id:null, campaign_name:null, created_date:'2026-01-15', last_activity_date:'2026-05-20', close_date:'2026-06-30', expected_close_month:'Jun 2026', days_in_stage:10, sales_cycle_days:135, next_step:'Proposal to be sent this week with Belgium pricing', next_step_due_date:'2026-06-01', deal_health:'Healthy', deal_quality:'B', quality_score:71, urgency:'Medium', lost_reason:null, competitor:null, objections:['Needs Belgium compliance check'], notes:'Belgium market first test. Dorian expanding west.' }),
  w({ deal_id:'p-11', deal_name:'Gym Wallet Pro', company_name:'SportZone Rotterdam', company_domain:'sportzone-rotterdam.nl', country:'NL', city:'Rotterdam', industry:'Gym / Sports', segment:'Gym / Sports Club', use_case:'Membership loyalty card', deal_stage:'Demo Completed', ...mrr(89), owner:'Dorian', partner_owner:'Dorian', source:'Cold Email', source_detail:'NL Gym & Membership Q1 2026', campaign_id:'c-nl-gym-2026', campaign_name:'NL Gym & Membership Q1 2026', created_date:'2026-02-20', last_activity_date:'2026-05-22', close_date:'2026-07-01', expected_close_month:'Jul 2026', days_in_stage:8, sales_cycle_days:99, next_step:'Send proposal — owner asked for 3-month commitment option', next_step_due_date:'2026-06-01', deal_health:'High Intent', deal_quality:'A', quality_score:84, urgency:'High', lost_reason:null, competitor:null, objections:['Wants flexible contract'], notes:'High intent signal. Gym segment momentum building.' }),
  w({ deal_id:'p-12', deal_name:'Loyalty Wallet Spain', company_name:'Organic Hub Madrid', company_domain:'organichub-madrid.es', country:'ES', city:'Madrid', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Demo Completed', ...mrr(49), owner:'Joaquin', partner_owner:'Joaquin', source:'Spain Outbound', source_detail:'Spain Cold Email Q4 2025', campaign_id:'c-es-q4-2025', campaign_name:'Spain Cold Email Q4 2025', created_date:'2025-12-20', last_activity_date:'2026-05-18', close_date:'2026-06-30', expected_close_month:'Jun 2026', days_in_stage:12, sales_cycle_days:161, next_step:'Send proposal in Spanish — include case study', next_step_due_date:'2026-06-01', deal_health:'Healthy', deal_quality:'B', quality_score:65, urgency:'Medium', lost_reason:null, competitor:null, objections:['Existing stamp program'], notes:'Good demo. Competitor has physical stamp card — easier for them.' }),

  // Meeting Booked (3 deals)
  w({ deal_id:'p-13', deal_name:'Loyalty Wallet Growth', company_name:'Grand Café West Amsterdam', company_domain:'grandcafe-west.nl', country:'NL', city:'Amsterdam', industry:'HoReCa', segment:'Café / Bar / Takeaway', use_case:'Loyalty stamp card', deal_stage:'Meeting Booked', ...mrr(89), owner:'Carlo', partner_owner:'Carlo', source:'Cold Email', source_detail:'NL Cold Email Q4 2025', campaign_id:'c-nl-q4-2025', campaign_name:'NL Cold Email Q4 2025', created_date:'2026-04-20', last_activity_date:'2026-05-25', close_date:'2026-07-01', expected_close_month:'Jul 2026', days_in_stage:5, sales_cycle_days:35, next_step:'Demo call Monday 2 June — Zoom with owner Thomas', next_step_due_date:'2026-06-02', deal_health:'Healthy', deal_quality:'B', quality_score:62, urgency:'Medium', lost_reason:null, competitor:null, objections:[], notes:'Strong positive reply. Owner manages 2 locations.' }),
  w({ deal_id:'p-14', deal_name:'Gym Membership Card', company_name:'Club Fit Den Haag', company_domain:'clubfit-denhaag.nl', country:'NL', city:'Den Haag', industry:'Gym / Sports', segment:'Gym / Sports Club', use_case:'Membership loyalty card', deal_stage:'Meeting Booked', ...mrr(89), owner:'Dorian', partner_owner:'Dorian', source:'Cold Email', source_detail:'NL Gym & Membership Q1 2026', campaign_id:'c-nl-gym-2026', campaign_name:'NL Gym & Membership Q1 2026', created_date:'2026-04-25', last_activity_date:'2026-05-26', close_date:'2026-07-15', expected_close_month:'Jul 2026', days_in_stage:4, sales_cycle_days:35, next_step:'Demo call Thursday 4 June — owner Elena', next_step_due_date:'2026-06-04', deal_health:'Healthy', deal_quality:'B', quality_score:65, urgency:'Medium', lost_reason:null, competitor:null, objections:[], notes:'Gym segment — 400 members. Good fit.' }),
  w({ deal_id:'p-15', deal_name:'Tenant Loyalty Card', company_name:'Parkview Real Estate', company_domain:'parkview-re.nl', country:'NL', city:'Utrecht', industry:'Real Estate', segment:'Tenant Card / Real Estate', use_case:'Tenant wallet card', deal_stage:'Meeting Booked', ...mrr(149), owner:'Giuseppe', partner_owner:'Giuseppe', source:'Referral', source_detail:'Referred by CitySales', campaign_id:null, campaign_name:null, created_date:'2026-04-28', last_activity_date:'2026-05-28', close_date:'2026-07-31', expected_close_month:'Jul 2026', days_in_stage:2, sales_cycle_days:32, next_step:'First discovery call — exploring tenant engagement use case', next_step_due_date:'2026-06-03', deal_health:'High Intent', deal_quality:'B', quality_score:74, urgency:'Medium', lost_reason:null, competitor:null, objections:[], notes:'New ICP category — real estate tenant card. First exploration.' }),

  // Positive Reply (3 deals)
  w({ deal_id:'p-16', deal_name:'Loyalty Wallet Growth', company_name:'Café Blenheim Rotterdam', company_domain:'cafe-blenheim.nl', country:'NL', city:'Rotterdam', industry:'HoReCa', segment:'Café / Bar / Takeaway', use_case:'Loyalty stamp card', deal_stage:'Positive Reply', ...mrr(89), owner:'Carlo', partner_owner:'Carlo', source:'Cold Email', source_detail:'NL Cold Email Q4 2025', campaign_id:'c-nl-q4-2025', campaign_name:'NL Cold Email Q4 2025', created_date:'2026-05-01', last_activity_date:'2026-05-27', close_date:'2026-08-01', expected_close_month:'Aug 2026', days_in_stage:3, sales_cycle_days:29, next_step:'Book discovery call — replied with interest this week', next_step_due_date:'2026-06-01', deal_health:'Healthy', deal_quality:'B', quality_score:58, urgency:'Medium', lost_reason:null, competitor:null, objections:[], notes:'Recent positive reply. Hot lead in cadence.' }),
  w({ deal_id:'p-17', deal_name:'Gym Membership Card', company_name:'PowerFit Eindhoven', company_domain:'powerfit-eindhoven.nl', country:'NL', city:'Eindhoven', industry:'Gym / Sports', segment:'Gym / Sports Club', use_case:'Membership loyalty card', deal_stage:'Positive Reply', ...mrr(89), owner:'Dorian', partner_owner:'Dorian', source:'Cold Email', source_detail:'NL Gym & Membership Q1 2026', campaign_id:'c-nl-gym-2026', campaign_name:'NL Gym & Membership Q1 2026', created_date:'2026-05-05', last_activity_date:'2026-05-28', close_date:'2026-08-01', expected_close_month:'Aug 2026', days_in_stage:2, sales_cycle_days:25, next_step:'Schedule meeting — replied asking for pricing', next_step_due_date:'2026-06-01', deal_health:'High Intent', deal_quality:'B', quality_score:62, urgency:'Medium', lost_reason:null, competitor:null, objections:[], notes:'Gym campaign ROI — 5th positive reply this month.' }),
  w({ deal_id:'p-18', deal_name:'Colombia Starter', company_name:'Café del Valle Cali', company_domain:'cafedelvalle.co', country:'CO', city:'Cali', industry:'HoReCa', segment:'Café / Bar / Takeaway', use_case:'Loyalty stamp card', deal_stage:'Positive Reply', ...mrr(29), owner:'Jonathan', partner_owner:'Jonathan', source:'Colombia Outbound', source_detail:'Colombia Outbound Q4 2025', campaign_id:'c-co-q4-2025', campaign_name:'Colombia Outbound Q4 2025', created_date:'2026-05-10', last_activity_date:'2026-05-29', close_date:'2026-08-15', expected_close_month:'Aug 2026', days_in_stage:1, sales_cycle_days:19, next_step:'WhatsApp follow-up with demo video link', next_step_due_date:'2026-06-01', deal_health:'Healthy', deal_quality:'C', quality_score:48, urgency:'Low', lost_reason:null, competitor:null, objections:[], notes:'New Colombian city. Low ARPA but volume potential.' }),

  // Contacted (3 deals)
  w({ deal_id:'p-19', deal_name:'Loyalty Wallet Growth', company_name:'Restaurant Zuidas Amsterdam', company_domain:'restaurant-zuidas.nl', country:'NL', city:'Amsterdam', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Contacted', ...mrr(89), owner:'Niels', partner_owner:'Niels', source:'LinkedIn', source_detail:'LinkedIn organic', campaign_id:null, campaign_name:null, created_date:'2026-05-12', last_activity_date:'2026-05-24', close_date:'2026-09-01', expected_close_month:'Sep 2026', days_in_stage:6, sales_cycle_days:18, next_step:'Follow-up sequence — day 7 touch', next_step_due_date:'2026-06-01', deal_health:'Needs Follow-up', deal_quality:'C', quality_score:38, urgency:'Low', lost_reason:null, competitor:null, objections:[], notes:'Corporate restaurant. LinkedIn connection pending.' }),
  w({ deal_id:'p-20', deal_name:'Gym Wallet Basic', company_name:'Iron House Groningen', company_domain:'ironhouse-groningen.nl', country:'NL', city:'Groningen', industry:'Gym / Sports', segment:'Gym / Sports Club', use_case:'Membership loyalty card', deal_stage:'Contacted', ...mrr(49), owner:'Dorian', partner_owner:'Dorian', source:'Cold Email', source_detail:'NL Gym & Membership Q1 2026', campaign_id:'c-nl-gym-2026', campaign_name:'NL Gym & Membership Q1 2026', created_date:'2026-05-15', last_activity_date:'2026-05-25', close_date:'2026-09-15', expected_close_month:'Sep 2026', days_in_stage:5, sales_cycle_days:15, next_step:'Send follow-up email with gym case study', next_step_due_date:'2026-06-02', deal_health:'Healthy', deal_quality:'C', quality_score:42, urgency:'Low', lost_reason:null, competitor:null, objections:[], notes:'Small gym — 200 members. Low urgency from their side.' }),
  w({ deal_id:'p-21', deal_name:'Loyalty Wallet Spain', company_name:'Sabor Natural Seville', company_domain:'sabor-natural.es', country:'ES', city:'Sevilla', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Contacted', ...mrr(49), owner:'Joaquin', partner_owner:'Joaquin', source:'Spain Outbound', source_detail:'Spain Cold Email Q4 2025', campaign_id:'c-es-q4-2025', campaign_name:'Spain Cold Email Q4 2025', created_date:'2026-05-08', last_activity_date:'2026-05-20', close_date:'2026-10-01', expected_close_month:'Oct 2026', days_in_stage:10, sales_cycle_days:22, next_step:'Second email in sequence — no reply yet', next_step_due_date:'2026-06-01', deal_health:'Stale', deal_quality:'D', quality_score:28, urgency:'Low', lost_reason:null, competitor:null, objections:[], notes:'No reply after 2 emails. Move to nurture if no reply by June 5.' }),

  // Nurture (3 deals)
  w({ deal_id:'p-22', deal_name:'Italy Standard', company_name:'Vegano Milano', company_domain:'vegano-milano.it', country:'IT', city:'Milan', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Nurture', ...mrr(49), owner:'Carlo', partner_owner:'Carlo', source:'Italy Outbound', source_detail:'Italy Cold Email Q4 2025', campaign_id:'c-it-q4-2025', campaign_name:'Italy Cold Email Q4 2025', created_date:'2025-12-01', last_activity_date:'2026-03-15', close_date:'2026-12-01', expected_close_month:'Dec 2026', days_in_stage:76, sales_cycle_days:180, next_step:'Monthly newsletter touch — re-engage in Sep 2026', next_step_due_date:'2026-09-01', deal_health:'Stale', deal_quality:'D', quality_score:25, urgency:'Low', lost_reason:null, competitor:null, objections:['Not the right time', 'Owner change coming'], notes:'Ownership transition. Re-approach Q3 2026.' }),
  w({ deal_id:'p-23', deal_name:'Colombia Starter', company_name:'Naturaleza Cali', company_domain:'naturaleza-cali.co', country:'CO', city:'Cali', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Nurture', ...mrr(29), owner:'Jonathan', partner_owner:'Jonathan', source:'Colombia Outbound', source_detail:'Colombia Outbound Q4 2025', campaign_id:'c-co-q4-2025', campaign_name:'Colombia Outbound Q4 2025', created_date:'2025-12-15', last_activity_date:'2026-02-01', close_date:'2026-12-15', expected_close_month:'Dec 2026', days_in_stage:118, sales_cycle_days:166, next_step:'Re-engage Q3 2026 after expansion funding', next_step_due_date:'2026-09-15', deal_health:'Stale', deal_quality:'D', quality_score:22, urgency:'Low', lost_reason:null, competitor:null, objections:['Waiting for own funding'], notes:'Founder waiting for own funding round. Keep warm.' }),
  w({ deal_id:'p-24', deal_name:'Loyalty Wallet Basic', company_name:'The Plant Bar Utrecht', company_domain:'plantbar-utrecht.nl', country:'NL', city:'Utrecht', industry:'HoReCa', segment:'Café / Bar / Takeaway', use_case:'Loyalty stamp card', deal_stage:'Nurture', ...mrr(89), owner:'Giuseppe', partner_owner:'Giuseppe', source:'Website / Inbound', source_detail:'Website contact form', campaign_id:null, campaign_name:null, created_date:'2025-11-01', last_activity_date:'2026-01-10', close_date:'2026-12-01', expected_close_month:'Dec 2026', days_in_stage:140, sales_cycle_days:210, next_step:'Re-engage in Sep — they mentioned rebranding first', next_step_due_date:'2026-09-01', deal_health:'Stale', deal_quality:'D', quality_score:30, urgency:'Low', lost_reason:null, competitor:null, objections:['Rebranding in progress'], notes:'Inbound lead. In rebranding. Re-approach after rebrand.' }),

  // ── CLOSED LOST ─────────────────────────────────────────────────────────────
  w({ deal_id:'cl-01', deal_name:'Loyalty Wallet Spain', company_name:'Bodega Valencia', company_domain:'bodega-valencia.es', country:'ES', city:'Valencia', industry:'HoReCa', segment:'Café / Bar / Takeaway', use_case:'Loyalty stamp card', deal_stage:'Closed Lost', ...mrr(49), owner:'Joaquin', partner_owner:'Joaquin', source:'HIP Spain', source_detail:'HIP 2025 Barcelona', campaign_id:null, campaign_name:null, created_date:'2025-02-15', last_activity_date:'2025-04-01', close_date:'2025-04-01', expected_close_month:'Apr 2025', days_in_stage:0, sales_cycle_days:45, next_step:'—', next_step_due_date:'—', deal_health:'Low Quality', deal_quality:'D', quality_score:22, urgency:'Low', lost_reason:'Chose competitor — Stamp It', competitor:'Stamp It', objections:['Price', 'Existing Stamp It contract'], notes:'Lost to Stamp It on existing contract pricing.' }),
  w({ deal_id:'cl-02', deal_name:'Loyalty Wallet Growth', company_name:'Broccoli Bar Groningen', company_domain:'broccolibar.nl', country:'NL', city:'Groningen', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Closed Lost', ...mrr(89), owner:'Carlo', partner_owner:'Carlo', source:'Cold Email', source_detail:'NL Cold Email Q4 2025', campaign_id:'c-nl-q4-2025', campaign_name:'NL Cold Email Q4 2025', created_date:'2025-10-25', last_activity_date:'2025-12-15', close_date:'2025-12-15', expected_close_month:'Dec 2025', days_in_stage:0, sales_cycle_days:51, next_step:'—', next_step_due_date:'—', deal_health:'Low Quality', deal_quality:'D', quality_score:28, urgency:'Low', lost_reason:'No budget — seasonality', competitor:null, objections:['Not the right time', 'Low season'], notes:'Restaurant in low season. Revisit March 2026.' }),
  w({ deal_id:'cl-03', deal_name:'Colombia Starter', company_name:'Madre Tierra Bogotá', company_domain:'madre-tierra-bogota.co', country:'CO', city:'Bogotá', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Closed Lost', ...mrr(29), owner:'Jonathan', partner_owner:'Jonathan', source:'Colombia Outbound', source_detail:'Colombia Outbound Q4 2025', campaign_id:'c-co-q4-2025', campaign_name:'Colombia Outbound Q4 2025', created_date:'2025-10-10', last_activity_date:'2025-11-20', close_date:'2025-11-20', expected_close_month:'Nov 2025', days_in_stage:0, sales_cycle_days:41, next_step:'—', next_step_due_date:'—', deal_health:'Low Quality', deal_quality:'D', quality_score:30, urgency:'Low', lost_reason:'Chose competitor — local stamp app', competitor:'Local stamp app CO', objections:['Local competitor cheaper', 'Language barrier on wallet tech'], notes:'Local CO app at $5/mo. Price fight we lose in that market.' }),
  w({ deal_id:'cl-04', deal_name:'Loyalty Wallet Growth', company_name:'Vegano Valencia', company_domain:'vegano-valencia.es', country:'ES', city:'Valencia', industry:'HoReCa', segment:'Independent Restaurant', use_case:'Loyalty stamp card', deal_stage:'Closed Lost', ...mrr(49), owner:'Joaquin', partner_owner:'Joaquin', source:'HIP Spain', source_detail:'HIP 2025 Barcelona', campaign_id:null, campaign_name:null, created_date:'2025-02-01', last_activity_date:'2025-05-01', close_date:'2025-05-01', expected_close_month:'May 2025', days_in_stage:0, sales_cycle_days:89, next_step:'—', next_step_due_date:'—', deal_health:'Low Quality', deal_quality:'D', quality_score:19, urgency:'Low', lost_reason:'Changed strategy — no loyalty program', competitor:null, objections:['Owner changed strategy', 'Not a priority'], notes:'Restaurant pivoted to delivery-only. No front-of-house loyalty needed.' }),
  w({ deal_id:'cl-05', deal_name:'NL Gym Wallet', company_name:'GymPlus Rotterdam', company_domain:'gymplus-rotterdam.nl', country:'NL', city:'Rotterdam', industry:'Gym / Sports', segment:'Gym / Sports Club', use_case:'Membership loyalty card', deal_stage:'Closed Lost', ...mrr(89), owner:'Dorian', partner_owner:'Dorian', source:'Cold Email', source_detail:'NL Gym & Membership Q1 2026', campaign_id:'c-nl-gym-2026', campaign_name:'NL Gym & Membership Q1 2026', created_date:'2026-01-20', last_activity_date:'2026-03-15', close_date:'2026-03-15', expected_close_month:'Mar 2026', days_in_stage:0, sales_cycle_days:54, next_step:'—', next_step_due_date:'—', deal_health:'Low Quality', deal_quality:'C', quality_score:38, urgency:'Low', lost_reason:'Chose gym management software with built-in loyalty', competitor:'PerfectGym', objections:['Already built-in to gym software'], notes:'PerfectGym has native loyalty. Need integration story for this objection.' }),
];

// ─── Convenience exports ─────────────────────────────────────────────────────

export const ALL_DEALS = SEED_DEALS;
export const CLOSED_WON = SEED_DEALS.filter(d => d.deal_stage === 'Closed Won');
export const CLOSED_LOST = SEED_DEALS.filter(d => d.deal_stage === 'Closed Lost');
export const ACTIVE_PIPELINE = SEED_DEALS.filter(d =>
  d.deal_stage !== 'Closed Won' && d.deal_stage !== 'Closed Lost'
);
