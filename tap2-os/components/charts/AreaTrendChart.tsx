"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
  type TooltipProps,
} from "recharts";
import { axisStyle, tooltipStyle, MARGIN_WITH_YAXIS, BLUE, GRADIENT_BLUE } from "./chart-theme";

interface DataPoint { [key: string]: string | number; }

interface AreaTrendChartProps {
  data: DataPoint[];
  xKey: string;
  yKey: string;
  height?: number;
  color?: string;
  valueFormatter?: (v: number) => string;
  referenceValue?: number;
  referenceLabel?: string;
  showDots?: boolean;
  tickFormatter?: (v: string) => string;
}

const GradientDef = ({ id, color }: { id: string; color: string }) => (
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stopColor={color} stopOpacity={0.12} />
      <stop offset="100%" stopColor={color} stopOpacity={0} />
    </linearGradient>
  </defs>
);

export function AreaTrendChart({
  data, xKey, yKey, height = 200, color = BLUE,
  valueFormatter, referenceValue, referenceLabel,
  showDots = false, tickFormatter,
}: AreaTrendChartProps) {
  const gradId = `grad-${yKey}`;
  const fmt = valueFormatter ?? ((v: number) => String(v));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={MARGIN_WITH_YAXIS}>
        <GradientDef id={gradId} color={color} />
        <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey={xKey}
          {...axisStyle}
          tickFormatter={tickFormatter}
        />
        <YAxis
          {...axisStyle}
          tickFormatter={(v) => fmt(Number(v))}
          width={48}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(v: unknown) => [fmt(Number(v)), ""]}
        />
        {referenceValue !== undefined && (
          <ReferenceLine
            y={referenceValue}
            stroke={BLUE}
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{ value: referenceLabel ?? "", fill: BLUE, fontSize: 10, position: "insideTopRight" }}
          />
        )}
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={showDots ? { r: 3, fill: color, strokeWidth: 0 } : false}
          activeDot={{ r: 4, fill: color, stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
