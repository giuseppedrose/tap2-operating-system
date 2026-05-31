"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { axisStyle, tooltipStyle, BLUE, MUTED } from "./chart-theme";

interface RankDataPoint {
  label: string;
  value: number;
  formatted?: string;
  highlight?: boolean;
}

interface HorizontalBarRankChartProps {
  data: RankDataPoint[];
  height?: number;
  color?: string;
  valueFormatter?: (v: number) => string;
  barSize?: number;
}

export function HorizontalBarRankChart({
  data, height, color = BLUE, valueFormatter, barSize = 12,
}: HorizontalBarRankChartProps) {
  const fmt = valueFormatter ?? ((v: number) => String(v));
  const h = height ?? Math.max(120, data.length * 32 + 20);

  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 0 }}>
        <XAxis type="number" {...axisStyle} tickFormatter={fmt} />
        <YAxis
          type="category"
          dataKey="label"
          width={120}
          {...axisStyle}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(v: unknown) => [fmt(Number(v)), ""]}
        />
        <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={barSize}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.highlight ? BLUE : i === 0 ? BLUE : `rgba(3,88,241,${Math.max(0.25, 0.85 - i * 0.08)})`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Alias for backward compat
export { HorizontalBarRankChart as HorizontalRankChart };
