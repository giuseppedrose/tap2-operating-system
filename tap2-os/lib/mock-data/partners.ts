export interface PartnerMetrics {
  name: string;
  leadsGenerated: number;
  meetingsBooked: number;
  demosCompleted: number;
  proposalsSent: number;
  trialsStarted: number;
  closedWon: number;
  closedLost: number;
  pipelineGenerated: number;
  mrrClosed: number;
  conversionLeadToMeeting: number;
  conversionMeetingToClose: number;
  averageDealSize: number;
}

export const mockPartnersData: PartnerMetrics[] = [
  {
    name: "Giuseppe",
    leadsGenerated: 82,
    meetingsBooked: 28,
    demosCompleted: 22,
    proposalsSent: 14,
    trialsStarted: 9,
    closedWon: 11,
    closedLost: 4,
    pipelineGenerated: 14800,
    mrrClosed: 979,
    conversionLeadToMeeting: 34.1,
    conversionMeetingToClose: 39.3,
    averageDealSize: 89,
  },
  {
    name: "Dorian",
    leadsGenerated: 55,
    meetingsBooked: 18,
    demosCompleted: 14,
    proposalsSent: 9,
    trialsStarted: 5,
    closedWon: 6,
    closedLost: 3,
    pipelineGenerated: 9200,
    mrrClosed: 534,
    conversionLeadToMeeting: 32.7,
    conversionMeetingToClose: 33.3,
    averageDealSize: 89,
  },
  {
    name: "Joaquin",
    leadsGenerated: 47,
    meetingsBooked: 16,
    demosCompleted: 12,
    proposalsSent: 8,
    trialsStarted: 4,
    closedWon: 5,
    closedLost: 4,
    pipelineGenerated: 7400,
    mrrClosed: 245,
    conversionLeadToMeeting: 34.0,
    conversionMeetingToClose: 31.3,
    averageDealSize: 49,
  },
  {
    name: "Jonathan",
    leadsGenerated: 38,
    meetingsBooked: 12,
    demosCompleted: 9,
    proposalsSent: 6,
    trialsStarted: 3,
    closedWon: 4,
    closedLost: 2,
    pipelineGenerated: 4800,
    mrrClosed: 116,
    conversionLeadToMeeting: 31.6,
    conversionMeetingToClose: 33.3,
    averageDealSize: 29,
  },
  {
    name: "Carlo",
    leadsGenerated: 43,
    meetingsBooked: 13,
    demosCompleted: 10,
    proposalsSent: 7,
    trialsStarted: 3,
    closedWon: 4,
    closedLost: 3,
    pipelineGenerated: 6200,
    mrrClosed: 245,
    conversionLeadToMeeting: 30.2,
    conversionMeetingToClose: 30.8,
    averageDealSize: 61,
  },
  {
    name: "Niels",
    leadsGenerated: 29,
    meetingsBooked: 9,
    demosCompleted: 7,
    proposalsSent: 4,
    trialsStarted: 2,
    closedWon: 2,
    closedLost: 2,
    pipelineGenerated: 3600,
    mrrClosed: 178,
    conversionLeadToMeeting: 31.0,
    conversionMeetingToClose: 22.2,
    averageDealSize: 89,
  },
  {
    name: "Qubico Studio",
    leadsGenerated: 22,
    meetingsBooked: 8,
    demosCompleted: 6,
    proposalsSent: 4,
    trialsStarted: 2,
    closedWon: 1,
    closedLost: 1,
    pipelineGenerated: 4200,
    mrrClosed: 89,
    conversionLeadToMeeting: 36.4,
    conversionMeetingToClose: 12.5,
    averageDealSize: 89,
  },
  {
    name: "Other",
    leadsGenerated: 14,
    meetingsBooked: 4,
    demosCompleted: 3,
    proposalsSent: 2,
    trialsStarted: 1,
    closedWon: 1,
    closedLost: 1,
    pipelineGenerated: 1800,
    mrrClosed: 89,
    conversionLeadToMeeting: 28.6,
    conversionMeetingToClose: 25.0,
    averageDealSize: 89,
  },
];

export const partnerSummary = {
  totalLeads: mockPartnersData.reduce((s, p) => s + p.leadsGenerated, 0),
  totalMeetings: mockPartnersData.reduce((s, p) => s + p.meetingsBooked, 0),
  totalClosedWon: mockPartnersData.reduce((s, p) => s + p.closedWon, 0),
  totalMrrClosed: mockPartnersData.reduce((s, p) => s + p.mrrClosed, 0),
};
