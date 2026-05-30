"use client";

import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { mockProductData } from "@/lib/mock-data/product";
import { ACTIVE_CUSTOMERS } from "@/lib/mock-data/connected";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, AreaChart, Area,
} from "recharts";
import { Cpu, Smartphone, CreditCard, Bell, QrCode, RefreshCw } from "lucide-react";

// Mock scan counts per customer (top 5)
const TOP_CLIENTS_BY_WALLET = [
  { ...ACTIVE_CUSTOMERS[0], mockScans: 1240, mockWallets: 89 },
  { ...ACTIVE_CUSTOMERS[6], mockScans: 980, mockWallets: 76 },
  { ...ACTIVE_CUSTOMERS[7], mockScans: 870, mockWallets: 68 },
  { ...ACTIVE_CUSTOMERS[1], mockScans: 760, mockWallets: 61 },
  { ...ACTIVE_CUSTOMERS[3], mockScans: 640, mockWallets: 54 },
];

// Product health score
const walletConversionScore = mockProductData.walletConversionRate / 45;
const activationScore = mockProductData.activationRate / 70;
const scansScore = mockProductData.scans / 10000;
const HEALTH_SCORE = Math.round(((walletConversionScore + activationScore + scansScore) / 3) * 100);
const HEALTH_LABEL = HEALTH_SCORE >= 70 ? 'Strong' : HEALTH_SCORE >= 40 ? 'Moderate' : 'Needs CS';
const HEALTH_COLOR = HEALTH_SCORE >= 70 ? 'text-green-600' : HEALTH_SCORE >= 40 ? 'text-amber-600' : 'text-red-500';

const BLUE = "#0358F1";

interface RestaurantScan {
  id: number;
  name: string;
  country: string;
  scans: number;
  redemptions: number;
  conversionRate: number;
}

const scanColumns: Column<RestaurantScan>[] = [
  { header: "#", accessor: "id", cell: (r) => <span className="text-gray-400 font-medium">{r.id}</span>, sortable: false },
  { header: "Restaurant", accessor: "name", cell: (r) => <span className="font-medium text-gray-900">{r.name}</span> },
  { header: "Country", accessor: "country" },
  { header: "Scans", accessor: "scans", cell: (r) => <span className="font-semibold">{r.scans.toLocaleString()}</span> },
  { header: "Redemptions", accessor: "redemptions", cell: (r) => <span className="font-semibold text-green-600">{r.redemptions}</span> },
  { header: "Conv. Rate", accessor: "conversionRate", cell: (r) => (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 bg-gray-100 rounded-full">
        <div className="h-1.5 rounded-full" style={{ width: `${r.conversionRate * 3}%`, background: BLUE }} />
      </div>
      <span className="text-xs">{r.conversionRate}%</span>
    </div>
  )},
];

export default function ProductPage() {
  const tableData = mockProductData.topRestaurantsByScans.map((r, i) => ({ ...r, id: i + 1 }));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard title="Active Wallets" value={mockProductData.activeWallets.toLocaleString()} trend={5.1} trendLabel="MoM" icon={<Smartphone className="h-5 w-5" />} />
        <KpiCard title="Wallet Installs" value={mockProductData.walletInstalls.toLocaleString()} subvalue="total installed" icon={<Cpu className="h-5 w-5" />} />
        <KpiCard title="Active Cards" value={mockProductData.activeCards.toLocaleString()} trend={3.2} trendLabel="MoM" icon={<CreditCard className="h-5 w-5" />} />
        <KpiCard title="Notifications Sent" value={mockProductData.notificationsSent.toLocaleString()} subvalue="this month" icon={<Bell className="h-5 w-5" />} />
        <KpiCard title="Scans" value={mockProductData.scans.toLocaleString()} trend={6.0} trendLabel="MoM" icon={<QrCode className="h-5 w-5" />} />
        <KpiCard title="Redemptions" value={mockProductData.redemptions.toLocaleString()} trend={7.1} trendLabel="MoM" icon={<RefreshCw className="h-5 w-5" />} />
      </div>

      {/* Product Health Score */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-6">
        <div className="text-center flex-shrink-0">
          <p className="text-xs font-medium text-gray-500 mb-1">Product Health Score</p>
          <p className={`text-4xl font-bold ${HEALTH_COLOR}`}>{HEALTH_SCORE}</p>
          <span className={`text-xs font-semibold rounded-full px-2 py-0.5 mt-1 inline-block ${HEALTH_SCORE >= 70 ? 'bg-green-100 text-green-700' : HEALTH_SCORE >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
            {HEALTH_LABEL}
          </span>
        </div>
        <div className="flex-1 space-y-2">
          {[
            { label: 'Wallet Conversion', value: mockProductData.walletConversionRate, benchmark: 45, unit: '%' },
            { label: 'Activation Rate', value: mockProductData.activationRate, benchmark: 70, unit: '%' },
            { label: 'Monthly Scans', value: mockProductData.scans, benchmark: 10000, unit: '' },
          ].map(m => (
            <div key={m.label}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-gray-500">{m.label}</span>
                <span className="text-gray-700 font-medium">{m.value}{m.unit} <span className="text-gray-400">/ {m.benchmark}{m.unit} benchmark</span></span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full relative">
                <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${Math.min(100, (m.value / m.benchmark) * 100)}%` }} />
                <div className="absolute top-0 bottom-0 w-0.5 bg-gray-400" style={{ left: '100%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Wallet Conversion Rate", value: `${mockProductData.walletConversionRate}%`, desc: "Installs that are active (benchmark: 35-45%)", color: "text-blue-600" },
          { label: "Activation Rate", value: `${mockProductData.activationRate}%`, desc: "Cards issued vs installs (benchmark: ~70%)", color: "text-green-600" },
          { label: "Win-Back Reactivation", value: `${mockProductData.winBackReactivation}%`, desc: "Churned wallets reactivated", color: "text-amber-600" },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-center">
            <p className="text-xs font-medium text-gray-500 mb-2">{metric.label}</p>
            <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
            <p className="text-xs text-gray-400 mt-1">{metric.desc}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Wallet & Card Growth" description="Monthly trend over last 12 months">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={mockProductData.trends} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => v.split(" ")[0]} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="walletInstalls" stroke="#93c5fd" strokeWidth={2} dot={false} name="Installs" />
              <Line type="monotone" dataKey="activeWallets" stroke={BLUE} strokeWidth={2} dot={false} name="Active Wallets" />
              <Line type="monotone" dataKey="activeCards" stroke="#16a34a" strokeWidth={2} dot={false} name="Active Cards" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Scans & Redemptions" description="Monthly engagement metrics">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={mockProductData.trends} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BLUE} stopOpacity={0.1} />
                  <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => v.split(" ")[0]} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="scans" stroke={BLUE} strokeWidth={2} fill="url(#scanGrad)" dot={false} name="Scans" />
              <Area type="monotone" dataKey="redemptions" stroke="#16a34a" strokeWidth={2} fill="none" dot={false} name="Redemptions" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Notifications */}
      <ChartCard title="Notifications Sent" description="Monthly push notification volume">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={mockProductData.trends} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => v.split(" ")[0]} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => [Number(v).toLocaleString(), "Notifications"]} />
            <Bar dataKey="notificationsSent" fill={BLUE} radius={[4, 4, 0, 0]} name="Notifications" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Top restaurants */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">Top Restaurants by Scans</h2>
        <DataTable columns={scanColumns} data={tableData} />
      </div>

      {/* Usage by client (from CUSTOMERS) */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Top 5 Clients by Wallet Usage <span className="text-xs text-gray-400 font-normal">(mock)</span></h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-6 py-3 text-left font-medium">Client</th>
              <th className="px-6 py-3 text-left font-medium">Country</th>
              <th className="px-6 py-3 text-left font-medium">Partner</th>
              <th className="px-6 py-3 text-right font-medium">Mock Scans</th>
              <th className="px-6 py-3 text-right font-medium">Mock Wallets</th>
            </tr>
          </thead>
          <tbody>
            {TOP_CLIENTS_BY_WALLET.map((c, i) => (
              <tr key={i} className="border-t border-gray-50">
                <td className="px-6 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-3 text-gray-500">{c.country}</td>
                <td className="px-6 py-3 text-gray-500">{c.partner}</td>
                <td className="px-6 py-3 text-right font-semibold text-gray-900">{c.mockScans.toLocaleString()}</td>
                <td className="px-6 py-3 text-right font-semibold text-blue-600">{c.mockWallets}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
