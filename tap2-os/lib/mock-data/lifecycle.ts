export const mockLifecycleData = {
  funnelStages: [
    { stage: "Contacted", count: 420, conversionRate: 100 },
    { stage: "Replied", count: 168, conversionRate: 40 },
    { stage: "Meeting Booked", count: 84, conversionRate: 50 },
    { stage: "Demo Done", count: 63, conversionRate: 75 },
    { stage: "Proposal Sent", count: 42, conversionRate: 67 },
    { stage: "Closed Won", count: 28, conversionRate: 67 },
  ],

  stageDropoff: [
    { from: "Contacted → Replied", dropoff: 60, absolute: 252 },
    { from: "Replied → Meeting", dropoff: 50, absolute: 84 },
    { from: "Meeting → Demo", dropoff: 25, absolute: 21 },
    { from: "Demo → Proposal", dropoff: 33, absolute: 21 },
    { from: "Proposal → Close", dropoff: 33, absolute: 14 },
  ],

  cohortConversion: [
    { month: "Jul 2025", contacted: 60, closed: 3, rate: 5.0 },
    { month: "Aug 2025", contacted: 72, closed: 4, rate: 5.6 },
    { month: "Sep 2025", contacted: 85, closed: 5, rate: 5.9 },
    { month: "Oct 2025", contacted: 90, closed: 6, rate: 6.7 },
    { month: "Nov 2025", contacted: 68, closed: 5, rate: 7.4 },
    { month: "Dec 2025", contacted: 45, closed: 5, rate: 11.1 },
  ],

  avgDaysPerStage: [
    { stage: "Contact → Reply", days: 4.2 },
    { stage: "Reply → Meeting", days: 3.8 },
    { stage: "Meeting → Proposal", days: 7.1 },
    { stage: "Proposal → Close", days: 14.3 },
  ],

  sourcePerformance: [
    { source: "Cold Email", contacted: 180, closed: 12, rate: 6.7 },
    { source: "Cold Calling", contacted: 90, closed: 7, rate: 7.8 },
    { source: "LinkedIn", contacted: 75, closed: 4, rate: 5.3 },
    { source: "Referral", contacted: 45, closed: 4, rate: 8.9 },
    { source: "Events / Fairs", contacted: 30, closed: 1, rate: 3.3 },
  ],
};
