export const mockMeetingsData = {
  totalMeetings: 84,
  meetingsThisMonth: 14,
  avgMeetingsPerWeek: 3.5,
  showRate: 78,
  demoToProposalRate: 67,

  meetingsByType: [
    { type: "First Demo", count: 42, showRate: 82 },
    { type: "Follow-up", count: 28, showRate: 78 },
    { type: "Proposal Review", count: 10, showRate: 90 },
    { type: "Onboarding", count: 4, showRate: 100 },
  ],

  meetingsByMonth: [
    { month: "Jul 2025", meetings: 8, booked: 11 },
    { month: "Aug 2025", meetings: 10, booked: 13 },
    { month: "Sep 2025", meetings: 11, booked: 14 },
    { month: "Oct 2025", meetings: 14, booked: 17 },
    { month: "Nov 2025", meetings: 13, booked: 16 },
    { month: "Dec 2025", meetings: 14, booked: 18 },
  ],

  objections: [
    { objection: "Price too high", frequency: 34, winRate: 38, category: "Pricing" },
    { objection: "Already have a loyalty program", frequency: 28, winRate: 42, category: "Competitor" },
    { objection: "Customers don't have smartphone / wallet", frequency: 22, winRate: 55, category: "Product fit" },
    { objection: "Not the right time", frequency: 18, winRate: 28, category: "Timing" },
    { objection: "Need to discuss with partner / owner", frequency: 16, winRate: 62, category: "Decision process" },
    { objection: "Too complex to implement", frequency: 12, winRate: 58, category: "Complexity" },
    { objection: "ROI not clear", frequency: 10, winRate: 40, category: "Value" },
  ],

  recentMeetings: [
    { date: "2025-12-12", prospect: "Brasserie Noord", type: "First Demo", outcome: "proposal_sent", notes: "Interested in loyalty stamp cards" },
    { date: "2025-12-11", prospect: "Grand Café West", type: "Follow-up", outcome: "closed_won", notes: "Signed €89/mo plan" },
    { date: "2025-12-10", prospect: "Sportclub Oost", type: "First Demo", outcome: "follow_up", notes: "Pricing objection — needs internal sign-off" },
    { date: "2025-12-09", prospect: "Kapsalon Centrum", type: "First Demo", outcome: "closed_won", notes: "Starter plan, on trial" },
    { date: "2025-12-08", prospect: "Pizzeria Roma", type: "Proposal Review", outcome: "closed_lost", notes: "Has existing stamp card program" },
    { date: "2025-12-05", prospect: "Gym Fit Amsterdam", type: "Follow-up", outcome: "proposal_sent", notes: "Membership loyalty use case" },
  ],

  buyingSignals: [
    { signal: "Asked about pricing plans", frequency: 52 },
    { signal: "Mentioned existing customer database", frequency: 38 },
    { signal: "Showed demo to staff during call", frequency: 24 },
    { signal: "Asked about onboarding timeline", frequency: 21 },
    { signal: "Requested trial / test period", frequency: 18 },
  ],
};
