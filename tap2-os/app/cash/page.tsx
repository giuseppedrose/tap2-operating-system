"use client";

import { useState, useEffect } from "react";
import { KpiCard } from "@/components/shared/kpi-card";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { mockCashData, type BankTransaction } from "@/lib/mock-data/cash";
import { fetchCashSnapshots, type DbCashSnapshot } from "@/lib/supabase/queries";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Wallet, TrendingDown, AlertTriangle, CreditCard } from "lucide-react";

const BLUE = "#0358F1";
const COLORS = [BLUE, "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#f59e0b", "#94a3b8"];

const txColumns: Column<BankTransaction>[] = [
  { header: "Date", accessor: "date" },
  { header: "Description", accessor: "description", cell: (r) => <span className="font-medium text-gray-900">{r.description}</span> },
  { header: "Counterparty", accessor: "counterparty" },
  { header: "Amount", accessor: "amount", cell: (r) => (
    <span className={`font-semibold ${r.amount >= 0 ? "text-green-600" : "text-red-500"}`}>
      {r.amount >= 0 ? "+" : ""}€{Math.abs(r.amount).toLocaleString()}
    </span>
  )},
  { header: "Category", accessor: "category", cell: (r) => <StatusBadge status={r.amount >= 0 ? "revenue" : "expense"} /> },
  { header: "Subcategory", accessor: "subcategory" },
];

export default function CashPage() {
  const [liveSnapshots, setLiveSnapshots] = useState<DbCashSnapshot[] | null>(null);

  useEffect(() => {
    fetchCashSnapshots().then(data => { if (data) setLiveSnapshots(data) });
  }, []);

  const latestSnapshot = liveSnapshots && liveSnapshots.length > 0
    ? liveSnapshots[liveSnapshots.length - 1]
    : null;

  const bankBalance = latestSnapshot ? Number(latestSnapshot.bank_balance) : mockCashData.bankBalance;
  const monthlyBurn = latestSnapshot ? Number(latestSnapshot.monthly_burn) : mockCashData.monthlyBurn;
  const runway = latestSnapshot && latestSnapshot.runway_months != null
    ? Number(latestSnapshot.runway_months)
    : mockCashData.runway;

  const burnHistory = liveSnapshots && liveSnapshots.length > 0
    ? liveSnapshots.map(s => ({
        month: s.snapshot_date,
        burn: Number(s.monthly_burn),
        revenue: Number(s.accounts_receivable ?? 0),
      }))
    : mockCashData.burnHistory;

  const runwayStatus = runway < 3 ? "danger" : runway < 6 ? "warning" : "ok";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Bank Balance" value={`€${bankBalance.toLocaleString()}`} subvalue="current balance" icon={<Wallet className="h-5 w-5" />} />
        <KpiCard title="Monthly Burn" value={`€${monthlyBurn.toLocaleString()}`} subvalue="net burn" icon={<TrendingDown className="h-5 w-5" />} />
        <KpiCard
          title="Runway"
          value={`${runway} mo`}
          subvalue={runwayStatus === "danger" ? "⚠ Critical" : runwayStatus === "warning" ? "↓ Low" : "Comfortable"}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <KpiCard title="Monthly Revenue" value={`€1,400`} subvalue="MRR covering burn" icon={<CreditCard className="h-5 w-5" />} />
      </div>

      {runwayStatus !== "ok" && (
        <div className={`rounded-xl border p-4 flex items-center gap-3 ${runwayStatus === "danger" ? "bg-red-50 border-red-200 text-red-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Runway Alert</p>
            <p className="text-xs">Current runway of {runway} months is {runwayStatus === "danger" ? "critically low" : "below 6 months"}. Prioritize fundraising or revenue growth.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Burn vs Revenue" description="Monthly burn rate vs MRR over last 12 months">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={burnHistory} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BLUE} stopOpacity={0.1} />
                    <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => v.split(" ")[0]} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(v: unknown) => [`€${Number(v).toLocaleString()}`]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="burn" stroke="#ef4444" strokeWidth={2} fill="url(#burnGrad)" dot={false} name="Burn" />
                <Area type="monotone" dataKey="revenue" stroke={BLUE} strokeWidth={2} fill="url(#revGrad)" dot={false} name="Revenue (MRR)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="Expenses by Category" description="Current month breakdown">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={mockCashData.expensesByCategory} cx="50%" cy="40%" outerRadius={80} dataKey="amount" nameKey="category">
                {mockCashData.expensesByCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11 }} formatter={(v: unknown) => [`€${v}`, ""]} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Expense Breakdown" description="Monthly spend by category">
        <div className="space-y-3">
          {mockCashData.expensesByCategory.map((cat, i) => (
            <div key={cat.category} className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="flex-1 text-sm text-gray-700">{cat.category}</span>
              <div className="flex-1 max-w-xs">
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full" style={{ width: `${cat.percentage}%`, background: COLORS[i % COLORS.length] }} />
                </div>
              </div>
              <span className="w-12 text-right text-sm font-semibold text-gray-900">€{cat.amount}</span>
              <span className="w-10 text-right text-xs text-gray-400">{cat.percentage}%</span>
            </div>
          ))}
        </div>
      </ChartCard>

      <div>
        <h2 className="mb-3 text-base font-semibold text-gray-900">Bank Transactions — December 2025</h2>
        <DataTable columns={txColumns} data={mockCashData.transactions} />
      </div>
    </div>
  );
}
