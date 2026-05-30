export interface GtmChannelMetrics {
  name: string;
  category: string;
  leads: number;
  meetings: number;
  demos: number;
  clients: number;
  pipeline: number;
  closedMrr: number;
  conversionRate: number;
  cac?: number;
}

export const mockGtmData: GtmChannelMetrics[] = [
  { name: "Horecava", category: "Event", leads: 48, meetings: 22, demos: 18, clients: 9, pipeline: 8700, closedMrr: 801, conversionRate: 18.75, cac: 0 },
  { name: "HIP Spain", category: "Event", leads: 36, meetings: 14, demos: 10, clients: 4, pipeline: 5200, closedMrr: 196, conversionRate: 11.1, cac: 180 },
  { name: "Cold Email", category: "Outbound", leads: 124, meetings: 18, demos: 13, clients: 5, pipeline: 6800, closedMrr: 356, conversionRate: 4.0, cac: 45 },
  { name: "Cold Calling", category: "Outbound", leads: 87, meetings: 19, demos: 14, clients: 6, pipeline: 7200, closedMrr: 445, conversionRate: 6.9, cac: 62 },
  { name: "LinkedIn", category: "Social", leads: 63, meetings: 11, demos: 8, clients: 3, pipeline: 4500, closedMrr: 267, conversionRate: 4.8, cac: 95 },
  { name: "CitySales", category: "Partnership", leads: 22, meetings: 8, demos: 6, clients: 2, pipeline: 3800, closedMrr: 178, conversionRate: 9.1, cac: 120 },
  { name: "OptiDist", category: "Partnership", leads: 18, meetings: 7, demos: 5, clients: 1, pipeline: 4200, closedMrr: 89, conversionRate: 5.6, cac: 210 },
  { name: "Qubico Studio", category: "Agency", leads: 22, meetings: 8, demos: 6, clients: 1, pipeline: 4200, closedMrr: 89, conversionRate: 4.5, cac: 0 },
  { name: "Referral", category: "Organic", leads: 19, meetings: 10, demos: 8, clients: 4, pipeline: 4000, closedMrr: 356, conversionRate: 21.1, cac: 0 },
  { name: "Website", category: "Inbound", leads: 31, meetings: 7, demos: 5, clients: 2, pipeline: 2800, closedMrr: 178, conversionRate: 6.5, cac: 85 },
  { name: "Marketing Agency", category: "Paid", leads: 42, meetings: 9, demos: 6, clients: 1, pipeline: 3200, closedMrr: 89, conversionRate: 2.4, cac: 320 },
  { name: "Colombia", category: "Market", leads: 45, meetings: 14, demos: 11, clients: 4, pipeline: 4800, closedMrr: 116, conversionRate: 8.9, cac: 55 },
  { name: "Italy Outbound", category: "Market", leads: 28, meetings: 9, demos: 7, clients: 2, pipeline: 3400, closedMrr: 98, conversionRate: 7.1, cac: 78 },
  { name: "Spain Outbound", category: "Market", leads: 33, meetings: 10, demos: 7, clients: 2, pipeline: 3100, closedMrr: 98, conversionRate: 6.1, cac: 92 },
  { name: "Other", category: "Other", leads: 12, meetings: 3, demos: 2, clients: 1, pipeline: 900, closedMrr: 49, conversionRate: 8.3, cac: 0 },
];

export const gtmSummary = {
  totalLeads: mockGtmData.reduce((s, c) => s + c.leads, 0),
  totalMeetings: mockGtmData.reduce((s, c) => s + c.meetings, 0),
  totalClients: mockGtmData.reduce((s, c) => s + c.clients, 0),
  totalPipeline: mockGtmData.reduce((s, c) => s + c.pipeline, 0),
  totalMrr: mockGtmData.reduce((s, c) => s + c.closedMrr, 0),
};

export const channelCategories = ["All", "Event", "Outbound", "Social", "Partnership", "Agency", "Organic", "Inbound", "Paid", "Market", "Other"];
