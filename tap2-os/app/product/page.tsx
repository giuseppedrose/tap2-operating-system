"use client";

import { useState, useEffect } from "react";
import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { mockProductData } from "@/lib/mock-data/product";
import { fetchProductMetrics, type DbProductMetric } from "@/lib/supabase/queries";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, AreaChart, Area,
} from "recharts";
import { Cpu, Smartphone, CreditCard, Bell, QrCode, RefreshCw } from "lucide-react";

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
  const [liveMetrics, setLiveMetrics] = useState<DbProductMetric[] | null>(null);

  useEffect(() => {
    fetchProductMetrics().then(data => { if (data) setLiveMetrics(data) });
  }, []);

  const latestMetric = liveMetrics && liveMetrics.length > 0
    ? liveMetrics[liveMetrics.length - 1]
    : null;

  const activeWallets = latestMetric ? Number(latestMetric.active_wallets) : mockProductData.activeWallets;
  const walletInstalls = latestMetric ? Number(latestMetric.wallet_installs) : mockProductData.walletInstalls;
  const activeCards = latestMetric ? Number(latestMetric.active_cards) : mockProductData.activeCards;
  const notificationsSent = latestMetric ? Number(latestMetric.notifications_sent) : mockProductData.notificationsSent;
  const scans = latestMetric ? Number(latestMetric.scans) : mockProductData.scans;
  const redemptions = latestMetric ? Number(latestMetric.redemptions) : mockProductData.redemptions;

  const trendsData = liveMetrics && liveMetrics.length > 0
    ? liveMetrics.map(m => ({
        month: m.date,
        activeWallets: Number(m.active_wallets),
        walletInstalls: Number(m.wallet_installs),
        activeCards: Number(m.active_cards),
        notificationsSent: Number(m.notifications_sent),
        scans: Number(m.scans),
        redemptions: Number(m.redemptions),
      }))
    : mockProductData.trends;

  const tableData = mockProductData.topRestaurantsByScans.map((r, i) => ({ ...r, id: i + 1 }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard title="Active Wallets" value={activeWallets.toLocaleString()} trend={5.1} trendLabel="MoM" icon={<Smartphone className="h-5 w-5" />} />
        <KpiCard title="Wallet Installs" value={walletInstalls.toLocaleString()} subvalue="total installed" icon={<Cpu className="h-5 w-5" />} />
        <KpiCard title="Active Cards" value={activeCards.toLocaleString()} trend={3.2} trendLabel="MoM" icon={<CreditCard className="h-5 w-5" />} />
        <KpiCard title="Notifications Sent" value={notificationsSent.toLocaleString()} subvalue="this month" icon={<Bell className="h-5 w-5" />} />
        <KpiCard title="Scans" value={scans.toLocaleString()} trend={6.0} trendLabel="MoM" icon={<QrCode className="h-5 w-5" />} />
        <KpiCard title="Redemptions" value={redemptions.toLocaleString()} trend={7.1} trendLabel="MoM" icon={<RefreshCw className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Wallet Conversion Rate", value: `${mockProductData.walletConversionRate}%`, desc: "Installs that are active", color: "text-blue-600" },
          { label: "Activation Rate", value: `${mockProductData.activationRate}%`, desc: "Cards issued vs installs", color: "text-green-600" },
          { label: "Win-Back Reactivation", value: `${mockProductData.winBackReactivation}%`, desc: "Churned wallets reactivated", color: "text-amber-600" },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-center">
            <p className="text-xs font-medium text-gray-500 mb-2">{metric.label}</p>
            <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
            <p className="text-xs text-gray-400 mt-1">{metric.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Wallet & Card Growth" description="Monthly trend over last 12 months">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendsData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
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
            <AreaChart data={trendsData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
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

      <ChartCard title="Notifications Sent" description="Monthly push notification volume">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={trendsData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => v.split(" ")[0]} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v) => [Number(v).toLocaleString(), "Notifications"]} />
            <Bar dataKey="notificationsSent" fill={BLUE} radius={[4, 4, 0, 0]} name="Notifications" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">Top Restaurants by Scans</h2>
        <DataTable columns={scanColumns} data={tableData} />
      </div>
    </div>
  );
}
