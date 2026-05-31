"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface MetricTrendProps {
  value: string;
  label: string;
  change?: string;
  positive?: boolean;
  data?: number[];
  color?: string;
  sub?: string;
  status?: "live" | "seed" | "pending" | "manual";
}

const STATUS_DOT: Record<string, string> = {
  live: "bg-emerald-400", seed: "bg-amber-400",
  pending: "bg-gray-300", manual: "bg-purple-400",
};

export function MetricTrend({ value, label, change, positive, data, color = "#0358F1", sub, status }: MetricTrendProps) {
  const sparkData = (data ?? []).map(v => ({ v }));
  const gradId = `mt-${label.replace(/\W/g, "")}`;

  return (
    <div className="border border-gray-200 bg-white px-4 py-3 space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
        {status && (
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
        )}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-semibold tabular-nums text-gray-900 tracking-tight">{value}</p>
        {change && (
          <span className={`text-xs font-semibold tabular-nums ${positive ? "text-emerald-600" : "text-red-500"}`}>
            {change}
          </span>
        )}
      </div>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
      {sparkData.length > 2 && (
        <div className="pt-1">
          <ResponsiveContainer width="100%" height={32}>
            <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
                fill={`url(#${gradId})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
