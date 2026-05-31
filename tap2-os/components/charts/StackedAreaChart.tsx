"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { axisStyle, tooltipStyle, MARGIN_WITH_YAXIS } from "./chart-theme";

interface SeriesDef {
  key: string;
  label: string;
  color: string;
}

interface StackedAreaChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
  valueFormatter?: (v: number) => string;
  tickFormatter?: (v: string) => string;
  stacked?: boolean;
}

export function StackedAreaChart({
  data, xKey, series, height = 220,
  valueFormatter, tickFormatter, stacked = true,
}: StackedAreaChartProps) {
  const fmt = valueFormatter ?? ((v: number) => String(v));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={MARGIN_WITH_YAXIS}>
        <defs>
          {series.map(s => (
            <linearGradient key={s.key} id={`sg-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={s.color} stopOpacity={stacked ? 0.6 : 0.12} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.1} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey={xKey} {...axisStyle} tickFormatter={tickFormatter} />
        <YAxis {...axisStyle} tickFormatter={fmt} width={48} />
        <Tooltip {...tooltipStyle} formatter={(v: unknown) => [fmt(Number(v)), ""]} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
        {series.map(s => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={1.5}
            fill={`url(#sg-${s.key})`}
            stackId={stacked ? "stack" : undefined}
            dot={false}
            activeDot={{ r: 3 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
