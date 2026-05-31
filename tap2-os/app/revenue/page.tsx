"use client";

import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataSourceBadge } from "@/components/shared/data-source-badge";
import { mockRevenueData } from "@/lib/mock-data/revenue";
import { CURRENT_MRR, ACTIVE_CUSTOMERS } from "@/lib/mock-data/connected";
import { DollarSign, TrendingUp, Users, TrendingDown } from "lucide-react";
import { ExecutiveInsight } from "@/components/shared/executive-insight";
import { DataStatusBadge } from "@/components/shared/data-status-badge";
import { MRRAreaChart } from "@/components/charts/MRRAreaChart";
import { HorizontalRankChart } from "@/components/charts/HorizontalRankChart";
import { WaterfallMRR } from "@/components/charts/WaterfallMRR";

// Compute revenue by partner from CUSTOMERS data
const partnerRevMap: Record<string, number> = {};
for (const c of ACTIVE_CUSTOMERS) {
  partnerRevMap[c.partner] = (partnerRevMap[c.partner] ?? 0) + c.mrr;
}
const revenueByPartner = Object.entries(partnerRevMap)
  .map(([label, value]) => ({ label, value, formatted: `€${value}` }))
  .sort((a, b) => b.value - a.value);

const RISK_BADGE: Record<string, string> = {
  low:     'bg-green-100 text-green-700',
  medium:  'bg-amber-100 text-amber-700',
  high:    'bg-red-100 text-red-700',
  churned: 'bg-gray-100 text-gray-500',
};

interface ClientRow {
  id: string;
  name: string;
  country: string;
  mrr: number;
  status: string;
  startDate: string;
  source: string;
  partnerOwner: string;
  riskLevel?: string;
}

const clientColumns: Column<ClientRow>[] = [
  { header: "Client", accessor: "name", cell: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
  { header: "Country", accessor: "country" },
  { header: "MRR", accessor: "mrr", cell: (r) => <span className="font-semibold">€{r.mrr}</span> },
  { header: "Status", accessor: "status", cell: (r) => <StatusBadge status={r.status} /> },
  { header: "Risk", accessor: "riskLevel", cell: (r) => (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${RISK_BADGE[r.riskLevel ?? 'low'] ?? ''}`}>
      {r.riskLevel ?? 'low'}
    </span>
  )},
  { header: "Start Date", accessor: "startDate" },
  { header: "Source", accessor: "source" },
  { header: "Owner", accessor: "partnerOwner" },
];

// Enrich revenue clients with riskLevel from CUSTOMERS
const enrichedClients: ClientRow[] = mockRevenueData.clients.map(c => {
  const riskMap: Record<string, string> = {
    'De Groenhoek': 'low', 'Vega Kitchen Amsterdam': 'low', 'El Vergel Madrid': 'low',
    'Roots & Co': 'low', 'Green Elephant': 'medium', 'La Floresta Barcelona': 'low',
    'Plantiful Haarlem': 'low', 'Bio Bistro Utrecht': 'low', 'Madre Tierra Bogotá': 'medium',
    'Naturverde Milan': 'low', 'The Sprout Rotterdam': 'low', 'Vegano Valencia': 'churned',
    'Conscious Kitchen Den Haag': 'low', 'Pura Vida Medellín': 'medium', 'Qubico Demo Client': 'medium',
  };
  return { ...c, riskLevel: riskMap[c.name] ?? 'low' };
});

const previousMRR = mockRevenueData.currentMRR - mockRevenueData.newMRR - mockRevenueData.expansionMRR + mockRevenueData.churnedMRR;

const countryRankData = mockRevenueData.revenueByCountry.map(r => ({
  label: r.country,
  value: r.mrr,
  formatted: `€${r.mrr}`,
}));

const segmentRankData = mockRevenueData.revenueBySegment.map(r => ({
  label: r.segment,
  value: r.mrr,
  formatted: `€${r.mrr}`,
}));

export default function RevenuePage() {
  return (
    <div className="space-y-6">
      <ExecutiveInsight
        insight="Stripe connection is the next step to make MRR and ARR live. All revenue data shown is structured seed data based on ~€1.4k MRR and 30+ active HoReCa and local business clients."
        nextStep="Configure STRIPE_SECRET_KEY in Vercel to activate live revenue tracking."
      />
      <div className="flex items-center gap-2">
        <DataStatusBadge status="seed" integration="Stripe Pending" tooltip="Revenue data is structured seed data. Connect Stripe to replace with live MRR, invoices, and churn." />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="MRR" value={`€${mockRevenueData.currentMRR.toLocaleString()}`} trend={mockRevenueData.growth} trendLabel="MoM" icon={<DollarSign className="h-5 w-5" />} />
        <KpiCard title="ARR" value={`€${mockRevenueData.arr.toLocaleString()}`} subvalue="projected" icon={<TrendingUp className="h-5 w-5" />} />
        <KpiCard title="Active Clients" value={mockRevenueData.activeClients} trend={8.3} trendLabel="vs last month" icon={<Users className="h-5 w-5" />} />
        <KpiCard title="Monthly Churn" value={`${mockRevenueData.churn}%`} trend={-0.3} trendLabel="vs last month" icon={<TrendingDown className="h-5 w-5" />} />
      </div>

      {/* MRR Waterfall */}
      <WaterfallMRR
        previousMRR={previousMRR}
        newMRR={mockRevenueData.newMRR}
        expansionMRR={mockRevenueData.expansionMRR}
        churnedMRR={mockRevenueData.churnedMRR}
        currentMRR={CURRENT_MRR}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="MRR Trend" description="Monthly recurring revenue — last 12 months">
            <MRRAreaChart
              data={mockRevenueData.mrrHistory}
              height={260}
              referenceValue={8300}
              referenceLabel="€100k ARR target"
            />
          </ChartCard>
        </div>

        <ChartCard title="Revenue by Country" description="MRR split by market">
          <HorizontalRankChart data={countryRankData} height={260} />
        </ChartCard>
      </div>

      {/* Revenue by Partner */}
      <ChartCard title="Revenue by Partner Owner" description="MRR attributed to each partner (from CUSTOMERS data)">
        <HorizontalRankChart data={revenueByPartner} />
      </ChartCard>

      {/* Revenue by Segment */}
      <ChartCard title="Revenue by Segment" description="MRR broken down by customer segment">
        <HorizontalRankChart data={segmentRankData} />
      </ChartCard>

      {/* Clients Table */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">All Clients</h2>
          <DataSourceBadge status="mock" />
        </div>
        <DataTable columns={clientColumns} data={enrichedClients} />
      </div>
    </div>
  );
}
