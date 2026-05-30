export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  counterparty: string;
  amount: number;
  category: string;
  subcategory: string;
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

  transactions: [
    { id: "tx1", date: "2025-12-01", description: "Stripe payout", counterparty: "Stripe", amount: 1350, category: "Revenue", subcategory: "Subscription" },
    { id: "tx2", date: "2025-12-01", description: "Salary Giuseppe Verdi", counterparty: "Giuseppe Verdi", amount: -2200, category: "Salaries & Contractors", subcategory: "Salary" },
    { id: "tx3", date: "2025-12-01", description: "Salary Dorian Gray", counterparty: "Dorian Gray", amount: -1800, category: "Salaries & Contractors", subcategory: "Salary" },
    { id: "tx4", date: "2025-12-02", description: "Vercel Pro subscription", counterparty: "Vercel Inc", amount: -20, category: "Software & Tools", subcategory: "Hosting" },
    { id: "tx5", date: "2025-12-02", description: "Supabase Pro", counterparty: "Supabase Inc", amount: -25, category: "Software & Tools", subcategory: "Database" },
    { id: "tx6", date: "2025-12-03", description: "Contractor Joaquin Muñoz", counterparty: "Joaquin Muñoz", amount: -600, category: "Salaries & Contractors", subcategory: "Contractor" },
    { id: "tx7", date: "2025-12-04", description: "HubSpot Starter", counterparty: "HubSpot", amount: -45, category: "Software & Tools", subcategory: "CRM" },
    { id: "tx8", date: "2025-12-05", description: "Instantly.ai", counterparty: "Instantly", amount: -97, category: "Software & Tools", subcategory: "Email Tool" },
    { id: "tx9", date: "2025-12-06", description: "LinkedIn Sales Navigator", counterparty: "LinkedIn", amount: -99, category: "Marketing & Events", subcategory: "LinkedIn" },
    { id: "tx10", date: "2025-12-08", description: "Co-working Amsterdam", counterparty: "Tribes Amsterdam", amount: -420, category: "Office & Co-working", subcategory: "Coworking" },
    { id: "tx11", date: "2025-12-10", description: "Flight Amsterdam-Madrid", counterparty: "KLM", amount: -180, category: "Travel & Transport", subcategory: "Flights" },
    { id: "tx12", date: "2025-12-10", description: "Hotel Madrid 3n", counterparty: "Booking.com", amount: -240, category: "Travel & Transport", subcategory: "Accommodation" },
    { id: "tx13", date: "2025-12-12", description: "Google Workspace", counterparty: "Google", amount: -72, category: "Software & Tools", subcategory: "Productivity" },
    { id: "tx14", date: "2025-12-12", description: "Anthropic API", counterparty: "Anthropic", amount: -38, category: "Software & Tools", subcategory: "AI" },
    { id: "tx15", date: "2025-12-13", description: "Stripe MRR payment - De Groenhoek", counterparty: "Stripe", amount: 89, category: "Revenue", subcategory: "Subscription" },
    { id: "tx16", date: "2025-12-14", description: "Accountant fee", counterparty: "Van der Berg Accountancy", amount: -240, category: "Legal & Accounting", subcategory: "Accounting" },
    { id: "tx17", date: "2025-12-15", description: "Marketing agency retainer", counterparty: "Boom Digital", amount: -680, category: "Marketing & Events", subcategory: "Agency" },
    { id: "tx18", date: "2025-12-15", description: "Salary Carlo Ferri", counterparty: "Carlo Ferri", amount: -600, category: "Salaries & Contractors", subcategory: "Contractor" },
    { id: "tx19", date: "2025-12-16", description: "Fathom Pro", counterparty: "Fathom Video", amount: -40, category: "Software & Tools", subcategory: "Meetings" },
    { id: "tx20", date: "2025-12-17", description: "GitHub Team", counterparty: "GitHub", amount: -16, category: "Software & Tools", subcategory: "Development" },
    { id: "tx21", date: "2025-12-18", description: "Figma Professional", counterparty: "Figma", amount: -45, category: "Software & Tools", subcategory: "Design" },
    { id: "tx22", date: "2025-12-19", description: "Refund - cancelled subscription", counterparty: "Vegano Valencia", amount: -49, category: "Revenue", subcategory: "Refund" },
    { id: "tx23", date: "2025-12-20", description: "Contractor Niels Bakker", counterparty: "Niels Bakker", amount: -400, category: "Salaries & Contractors", subcategory: "Contractor" },
    { id: "tx24", date: "2025-12-21", description: "SIM / Mobile (ES)", counterparty: "Vodafone España", amount: -29, category: "Miscellaneous", subcategory: "Telecom" },
    { id: "tx25", date: "2025-12-22", description: "Notion Team", counterparty: "Notion Labs", amount: -16, category: "Software & Tools", subcategory: "Productivity" },
    { id: "tx26", date: "2025-12-23", description: "Dinner client dinner Amsterdam", counterparty: "Grachtenpand Restaurant", amount: -88, category: "Marketing & Events", subcategory: "Entertainment" },
    { id: "tx27", date: "2025-12-24", description: "AWS charges", counterparty: "Amazon Web Services", amount: -122, category: "Software & Tools", subcategory: "Hosting" },
    { id: "tx28", date: "2025-12-26", description: "VAT payment Q3", counterparty: "Belastingdienst", amount: -210, category: "Legal & Accounting", subcategory: "Tax" },
    { id: "tx29", date: "2025-12-28", description: "OVChipkaart top-up", counterparty: "NS", amount: -50, category: "Travel & Transport", subcategory: "Public Transport" },
    { id: "tx30", date: "2025-12-30", description: "Stripe payout December", counterparty: "Stripe", amount: 1350, category: "Revenue", subcategory: "Subscription" },
  ],
};
