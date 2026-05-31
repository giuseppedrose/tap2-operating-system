"use client";

import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { BLUE, tooltipStyle } from "./chart-theme";

interface SmallTrendProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  data: { v: number }[];
  color?: string;
  height?: number;
}

export function SmallTrend({ label, value, change, positive, data, color = BLUE, height = 48 }: SmallTrendProps) {
  const gradId = `sm-grad-${label.replace(/\s/g, "")}`;
  return (
    <div className="border border-gray-200 bg-white p-3">
      <div className="flex items-start justify-between mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        {change && (
          <span className={`text-[10px] font-semibold tabular-nums ${positive ? "text-emerald-600" : "text-red-500"}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-xl font-semibold tabular-nums text-gray-900 tracking-tight mb-2">{value}</p>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            {...tooltipStyle}
            formatter={(v: unknown) => [String(v), ""]}
          />
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
            fill={`url(#${gradId})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SmallMultipleTrendsProps {
  items: SmallTrendProps[];
  cols?: number;
}

export function SmallMultipleTrends({ items, cols = 4 }: SmallMultipleTrendsProps) {
  return (
    <div className={`grid gap-px bg-gray-200 grid-cols-2 sm:grid-cols-${cols}`}>
      {items.map(item => (
        <SmallTrend key={item.label} {...item} />
      ))}
    </div>
  );
}
