export interface Campaign {
  id: string;
  name: string;
  market: string;
  segment: string;
  owner: string;
  status: "active" | "paused" | "completed";
  emailsSent: number;
  openRate: number;
  replyRate: number;
  positiveReplyRate: number;
  meetingsBooked: number;
  demosCompleted: number;
  dealsCreated: number;
  pipelineGenerated: number;
  mrrClosed: number;
  createdAt: string;
}

export const mockCampaignsData: Campaign[] = [
  {
    id: "camp1",
    name: "NL Restaurant Owners Q4 2025",
    market: "Netherlands",
    segment: "Independent Restaurant",
    owner: "Carlo",
    status: "active",
    emailsSent: 480,
    openRate: 38.5,
    replyRate: 8.1,
    positiveReplyRate: 3.8,
    meetingsBooked: 14,
    demosCompleted: 10,
    dealsCreated: 7,
    pipelineGenerated: 7560,
    mrrClosed: 356,
    createdAt: "2025-10-01",
  },
  {
    id: "camp2",
    name: "Spain Vegan Restaurants 2025",
    market: "Spain",
    segment: "Independent Restaurant",
    owner: "Joaquin",
    status: "active",
    emailsSent: 320,
    openRate: 34.2,
    replyRate: 6.9,
    positiveReplyRate: 3.1,
    meetingsBooked: 9,
    demosCompleted: 7,
    dealsCreated: 4,
    pipelineGenerated: 4200,
    mrrClosed: 147,
    createdAt: "2025-09-15",
  },
  {
    id: "camp3",
    name: "Colombia Market Entry",
    market: "Colombia",
    segment: "All",
    owner: "Jonathan",
    status: "completed",
    emailsSent: 280,
    openRate: 41.1,
    replyRate: 9.3,
    positiveReplyRate: 4.6,
    meetingsBooked: 12,
    demosCompleted: 9,
    dealsCreated: 5,
    pipelineGenerated: 3600,
    mrrClosed: 116,
    createdAt: "2025-07-01",
  },
  {
    id: "camp4",
    name: "Italy Organic Restaurants",
    market: "Italy",
    segment: "Independent Restaurant",
    owner: "Carlo",
    status: "paused",
    emailsSent: 195,
    openRate: 29.7,
    replyRate: 5.1,
    positiveReplyRate: 2.1,
    meetingsBooked: 5,
    demosCompleted: 4,
    dealsCreated: 2,
    pipelineGenerated: 2400,
    mrrClosed: 98,
    createdAt: "2025-08-20",
  },
  {
    id: "camp5",
    name: "NL Chain Restaurants - Upsell",
    market: "Netherlands",
    segment: "Chain / Group",
    owner: "Giuseppe",
    status: "active",
    emailsSent: 145,
    openRate: 44.8,
    replyRate: 12.4,
    positiveReplyRate: 6.9,
    meetingsBooked: 8,
    demosCompleted: 6,
    dealsCreated: 4,
    pipelineGenerated: 8640,
    mrrClosed: 267,
    createdAt: "2025-11-01",
  },
];

export const campaignSummary = {
  totalEmailsSent: mockCampaignsData.reduce((s, c) => s + c.emailsSent, 0),
  avgOpenRate: parseFloat((mockCampaignsData.reduce((s, c) => s + c.openRate, 0) / mockCampaignsData.length).toFixed(1)),
  avgReplyRate: parseFloat((mockCampaignsData.reduce((s, c) => s + c.replyRate, 0) / mockCampaignsData.length).toFixed(1)),
  totalMeetingsBooked: mockCampaignsData.reduce((s, c) => s + c.meetingsBooked, 0),
  totalPipelineGenerated: mockCampaignsData.reduce((s, c) => s + c.pipelineGenerated, 0),
  totalMrrClosed: mockCampaignsData.reduce((s, c) => s + c.mrrClosed, 0),
};
