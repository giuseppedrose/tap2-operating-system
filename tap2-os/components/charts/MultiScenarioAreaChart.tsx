"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import { FONT, axisStyle, gridStyle, tooltipStyle } from "./chart-theme";

interface ScenarioConfig {
  name: string;
  color: string;
}

interface ReferenceLine {
  value: number;
  label: string;
  color: string;
}

interface MultiScenarioAreaChartProps {
  data: Record<string, string | number>[];
  scenarios: ScenarioConfig[];
  height?: number;
  referenceLines?: ReferenceLine[];
}

function compactEuro(v: number): string {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(1)}k`;
  return `€${v}`;
}

export function MultiScenarioAreaChart({
  data,
  scenarios,
  height = 260,
  referenceLines,
}: MultiScenarioAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
        <defs>
          {scenarios.map(sc => (
            <linearGradient key={sc.name} id={`grad-${sc.name}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={sc.color} stopOpacity={0.04} />
              <stop offset="95%" stopColor={sc.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid {...gridStyle} />
        <XAxis
          dataKey="month"
          {...axisStyle}
          interval={2}
          tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: FONT }}
          tickFormatter={(v: string) => v.split(" ")[0]}
        />
        <YAxis
          {...axisStyle}
          tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: FONT }}
          tickFormatter={(v: unknown) => compactEuro(Number(v))}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(v: unknown) => [`€${Number(v).toLocaleString()}`, ""]}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, fontFamily: FONT, paddingTop: 8 }}
        />
        {referenceLines?.map(rl => (
          <ReferenceLine
            key={rl.label}
            y={rl.value}
            stroke={rl.color}
            strokeDasharray="4 4"
            label={{
              value: rl.label,
              fill: rl.color,
              fontSize: 10,
              fontFamily: FONT,
            }}
          />
        ))}
        {scenarios.map(sc => (
          <Area
            key={sc.name}
            type="monotone"
            dataKey={sc.name}
            stroke={sc.color}
            strokeWidth={1.5}
            fill={`url(#grad-${sc.name})`}
            dot={false}
            activeDot={{ r: 3, fill: sc.color }}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
