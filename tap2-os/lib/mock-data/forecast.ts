export interface ForecastMonth {
  month: string;
  newCustomers: number;
  churnedCustomers: number;
  totalCustomers: number;
  expectedMrr: number;
  expectedArr: number;
  expectedCash: number;
}

export interface ForecastScenario {
  name: string;
  color: string;
  assumptions: {
    monthlyNewCustomers: number;
    monthlyChurnPct: number;
    avgMrrPerCustomer: number;
    monthlyBurn: number;
  };
  months: ForecastMonth[];
}

const STARTING_MRR = 1400;
const STARTING_CASH = 35000;
const STARTING_CUSTOMERS = 32;
const AVG_MRR = 43.75;

function buildScenario(
  name: string,
  color: string,
  newPerMonth: number,
  churnPct: number,
  burn: number
): ForecastScenario {
  const months: ForecastMonth[] = [];
  let cash = STARTING_CASH;
  let customers = STARTING_CUSTOMERS;

  const monthNames = [
    "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026",
    "Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026", "Dec 2026",
    "Jan 2027", "Feb 2027", "Mar 2027", "Apr 2027", "May 2027", "Jun 2027",
    "Jul 2027", "Aug 2027", "Sep 2027", "Oct 2027", "Nov 2027", "Dec 2027",
  ];

  for (let i = 0; i < 24; i++) {
    const churned = Math.round(customers * (churnPct / 100));
    customers = customers - churned + newPerMonth;
    const mrr = Math.round(customers * AVG_MRR);
    cash = cash + mrr - burn;

    months.push({
      month: monthNames[i],
      newCustomers: newPerMonth,
      churnedCustomers: churned,
      totalCustomers: customers,
      expectedMrr: mrr,
      expectedArr: mrr * 12,
      expectedCash: Math.max(cash, 0),
    });
  }

  return {
    name,
    color,
    assumptions: {
      monthlyNewCustomers: newPerMonth,
      monthlyChurnPct: churnPct,
      avgMrrPerCustomer: AVG_MRR,
      monthlyBurn: burn,
    },
    months,
  };
}

export const mockForecastData = {
  currentMrr: STARTING_MRR,
  startingCash: STARTING_CASH,
  monthlyBurn: 8000,
  avgMrrPerCustomer: AVG_MRR,
  monthlyChurnPct: 2,

  scenarios: [
    buildScenario("Conservative", "#94a3b8", 3, 3, 8500),
    buildScenario("Expected", "#0358F1", 6, 2, 8000),
    buildScenario("Aggressive", "#16a34a", 10, 1.5, 8000),
  ],
};
