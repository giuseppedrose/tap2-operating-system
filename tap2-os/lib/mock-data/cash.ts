export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  counterparty: string;
  amount: number;
  category: string;
  subcategory: string;
  confidence: "auto" | "review" | "manual";
}

export const mockCashData = {
  bankBalance: 38500,
  monthlyBurn: 8200,
  runway: 4.7,

  expensesByCategory: [
    { category: "Salaries & Contractors", amount: 5200, percentage: 63.4 },
    { category: "Software & Tools", amount: 820, percentage: 10.0 },
    { category: "Marketing & Events", amount: 680, percentage: 8.3 },
    { category: "Office & Co-working", amount: 420, percentage: 5.1 },
    { category: "Travel & Transport", amount: 380, percentage: 4.6 },
    { category: "Legal & Accounting", amount: 340, percentage: 4.1 },
    { category: "Miscellaneous", amount: 360, percentage: 4.4 },
  ],

  burnHistory: [
    { month: "Jan 2025", burn: 6800, revenue: 800 },
    { month: "Feb 2025", burn: 7100, revenue: 860 },
    { month: "Mar 2025", burn: 7200, revenue: 920 },
    { month: "Apr 2025", burn: 7400, revenue: 980 },
    { month: "May 2025", burn: 7600, revenue: 1020 },
    { month: "Jun 2025", burn: 7800, revenue: 1080 },
    { month: "Jul 2025", burn: 7900, revenue: 1120 },
    { month: "Aug 2025", burn: 8000, revenue: 1160 },
    { month: "Sep 2025", burn: 8100, revenue: 1220 },
    { month: "Oct 2025", burn: 8100, revenue: 1280 },
    { month: "Nov 2025", burn: 8200, revenue: 1340 },
    { month: "Dec 2025", burn: 8200, revenue: 1400 },
  ],

  // All transactions are SAMPLE SEED DATA — not real bank transactions
  transactions: [
    { id: "tx1", date: "2025-12-01", description: "Stripe payout", counterparty: "Stripe Payments", amount: 1350, category: "Revenue", subcategory: "Subscription", confidence: "auto" as const },
    { id: "tx2", date: "2025-12-01", description: "Salary — Team Member A", counterparty: "[Seed Record]", amount: -2200, category: "Salaries & Contractors", subcategory: "Salary", confidence: "manual" as const },
    { id: "tx3", date: "2025-12-01", description: "Salary — Team Member B", counterparty: "[Seed Record]", amount: -1800, category: "Salaries & Contractors", subcategory: "Salary", confidence: "manual" as const },
    { id: "tx4", date: "2025-12-02", description: "Vercel Pro subscription", counterparty: "Vercel Inc", amount: -20, category: "Software & Tools", subcategory: "Hosting", confidence: "auto" as const },
    { id: "tx5", date: "2025-12-02", description: "Supabase Pro", counterparty: "Supabase Inc", amount: -25, category: "Software & Tools", subcategory: "Database", confidence: "auto" as const },
    { id: "tx6", date: "2025-12-03", description: "Contractor — Spain Market", counterparty: "[Seed Record]", amount: -600, category: "Salaries & Contractors", subcategory: "Contractor", confidence: "manual" as const },
    { id: "tx7", date: "2025-12-04", description: "HubSpot Starter", counterparty: "HubSpot", amount: -45, category: "Software & Tools", subcategory: "CRM", confidence: "auto" as const },
    { id: "tx8", date: "2025-12-05", description: "Instantly.ai", counterparty: "Instantly", amount: -97, category: "Software & Tools", subcategory: "Email Tool", confidence: "auto" as const },
    { id: "tx9", date: "2025-12-06", description: "LinkedIn Sales Navigator", counterparty: "LinkedIn", amount: -99, category: "Marketing & Events", subcategory: "LinkedIn", confidence: "auto" as const },
    { id: "tx10", date: "2025-12-08", description: "Co-working Amsterdam", counterparty: "Co-working Space NL", amount: -420, category: "Office & Co-working", subcategory: "Coworking", confidence: "auto" as const },
    { id: "tx11", date: "2025-12-10", description: "Flight Amsterdam-Madrid", counterparty: "KLM", amount: -180, category: "Travel & Transport", subcategory: "Flights", confidence: "auto" as const },
    { id: "tx12", date: "2025-12-10", description: "Hotel Madrid 3 nights", counterparty: "Booking.com", amount: -240, category: "Travel & Transport", subcategory: "Accommodation", confidence: "review" as const },
    { id: "tx13", date: "2025-12-12", description: "Google Workspace", counterparty: "Google", amount: -72, category: "Software & Tools", subcategory: "Productivity", confidence: "auto" as const },
    { id: "tx14", date: "2025-12-12", description: "Anthropic API", counterparty: "Anthropic", amount: -38, category: "Software & Tools", subcategory: "AI", confidence: "auto" as const },
    { id: "tx15", date: "2025-12-13", description: "Stripe client payment", counterparty: "Stripe Payments", amount: 89, category: "Revenue", subcategory: "Subscription", confidence: "auto" as const },
    { id: "tx16", date: "2025-12-14", description: "Accountant fee", counterparty: "Accounting Firm NL", amount: -240, category: "Legal & Accounting", subcategory: "Accounting", confidence: "auto" as const },
    { id: "tx17", date: "2025-12-15", description: "Marketing agency retainer", counterparty: "Digital Agency NL", amount: -680, category: "Marketing & Events", subcategory: "Agency", confidence: "review" as const },
    { id: "tx18", date: "2025-12-15", description: "Contractor — Italy Market", counterparty: "[Seed Record]", amount: -600, category: "Salaries & Contractors", subcategory: "Contractor", confidence: "manual" as const },
    { id: "tx19", date: "2025-12-16", description: "Fathom Pro", counterparty: "Fathom Video", amount: -40, category: "Software & Tools", subcategory: "Meetings", confidence: "auto" as const },
    { id: "tx20", date: "2025-12-17", description: "GitHub Team", counterparty: "GitHub", amount: -16, category: "Software & Tools", subcategory: "Development", confidence: "auto" as const },
    { id: "tx21", date: "2025-12-18", description: "Figma Professional", counterparty: "Figma", amount: -45, category: "Software & Tools", subcategory: "Design", confidence: "auto" as const },
    { id: "tx22", date: "2025-12-19", description: "Refund — churned client", counterparty: "Stripe Payments", amount: -49, category: "Revenue", subcategory: "Refund", confidence: "review" as const },
    { id: "tx23", date: "2025-12-20", description: "Contractor — NL Market", counterparty: "[Seed Record]", amount: -400, category: "Salaries & Contractors", subcategory: "Contractor", confidence: "manual" as const },
    { id: "tx24", date: "2025-12-21", description: "SIM / Mobile plan", counterparty: "Telecom Provider", amount: -29, category: "Miscellaneous", subcategory: "Telecom", confidence: "auto" as const },
    { id: "tx25", date: "2025-12-22", description: "Notion Team", counterparty: "Notion Labs", amount: -16, category: "Software & Tools", subcategory: "Productivity", confidence: "auto" as const },
    { id: "tx26", date: "2025-12-23", description: "Client dinner Amsterdam", counterparty: "Restaurant NL", amount: -88, category: "Marketing & Events", subcategory: "Entertainment", confidence: "review" as const },
    { id: "tx27", date: "2025-12-24", description: "AWS charges", counterparty: "Amazon Web Services", amount: -122, category: "Software & Tools", subcategory: "Hosting", confidence: "auto" as const },
    { id: "tx28", date: "2025-12-26", description: "VAT payment Q3", counterparty: "Tax Authority NL", amount: -210, category: "Legal & Accounting", subcategory: "Tax", confidence: "manual" as const },
    { id: "tx29", date: "2025-12-28", description: "Transport costs", counterparty: "NS / Public Transport", amount: -50, category: "Travel & Transport", subcategory: "Public Transport", confidence: "auto" as const },
    { id: "tx30", date: "2025-12-30", description: "Stripe payout December", counterparty: "Stripe Payments", amount: 1350, category: "Revenue", subcategory: "Subscription", confidence: "auto" as const },
  ],
};
