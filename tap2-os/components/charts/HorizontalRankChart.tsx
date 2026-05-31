"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { TAP2_COLORS, FONT, axisStyle, tooltipStyle } from "./chart-theme";

interface RankDataPoint {
  label: string;
  value: number;
  formatted?: string;
}

interface HorizontalRankChartProps {
  data: RankDataPoint[];
  height?: number;
  color?: string;
  valueFormatter?: (v: number) => string;
}

export function HorizontalRankChart({
  data,
  height,
  color = TAP2_COLORS.primary,
  valueFormatter,
}: HorizontalRankChartProps) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const chartHeight = height ?? Math.max(120, sorted.length * 36);

  const fmt = valueFormatter ?? ((v: number) => `${v}`);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        layout="vertical"
        data={sorted}
        margin={{ top: 4, right: 24, bottom: 4, left: 0 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={110}
          {...axisStyle}
          tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: FONT }}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(v: unknown) => [
            data.find(d => d.value === Number(v))?.formatted ?? fmt(Number(v)),
            "",
          ]}
        />
        <Bar
          dataKey="value"
          fill={color}
          barSize={8}
          radius={[0, 4, 4, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
