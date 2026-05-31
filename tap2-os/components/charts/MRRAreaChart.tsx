"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { TAP2_COLORS, FONT, axisStyle, gridStyle, tooltipStyle } from "./chart-theme";

interface MRRDataPoint {
  month: string;
  mrr: number;
}

interface MRRAreaChartProps {
  data: MRRDataPoint[];
  height?: number;
  referenceValue?: number;
  referenceLabel?: string;
}

function compactEuro(v: number): string {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(1)}k`;
  return `€${v}`;
}

export function MRRAreaChart({ data, height = 200, referenceValue, referenceLabel }: MRRAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="mrrAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TAP2_COLORS.primary} stopOpacity={0.08} />
            <stop offset="95%" stopColor={TAP2_COLORS.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridStyle} />
        <XAxis
          dataKey="month"
          {...axisStyle}
          tickFormatter={(v: string) => v.split(" ")[0]}
        />
        <YAxis
          {...axisStyle}
          tickFormatter={(v: unknown) => compactEuro(Number(v))}
          tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: FONT }}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(v: unknown) => [`€${Number(v).toLocaleString()}`, "MRR"]}
        />
        {referenceValue != null && (
          <ReferenceLine
            y={referenceValue}
            stroke="#d97706"
            strokeDasharray="4 4"
            label={{
              value: referenceLabel ?? `€${referenceValue.toLocaleString()}`,
              fill: "#d97706",
              fontSize: 10,
              fontFamily: FONT,
            }}
          />
        )}
        <Area
          type="monotone"
          dataKey="mrr"
          stroke={TAP2_COLORS.primary}
          strokeWidth={1.5}
          fill="url(#mrrAreaGrad)"
          dot={false}
          activeDot={{ r: 3, fill: TAP2_COLORS.primary }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
