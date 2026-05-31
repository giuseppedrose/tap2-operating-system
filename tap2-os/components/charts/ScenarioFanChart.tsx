"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";
import { axisStyle, tooltipStyle, MARGIN_WITH_YAXIS } from "./chart-theme";

interface ScenarioData {
  month: string;
  [scenarioName: string]: string | number;
}

interface ScenarioLine {
  key: string;
  label: string;
  color: string;
  opacity?: number;
  dashed?: boolean;
}

interface ScenarioFanChartProps {
  data: ScenarioData[];
  scenarios: ScenarioLine[];
  height?: number;
  valueFormatter?: (v: number) => string;
  referenceLines?: { value: number; label: string }[];
  tickFormatter?: (v: string) => string;
}

export function ScenarioFanChart({
  data, scenarios, height = 260, valueFormatter,
  referenceLines, tickFormatter,
}: ScenarioFanChartProps) {
  const fmt = valueFormatter ?? ((v: number) => `€${v.toLocaleString()}`);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={MARGIN_WITH_YAXIS}>
        <defs>
          {scenarios.map(s => (
            <linearGradient key={s.key} id={`fan-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={s.opacity ?? 0.08} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="month" {...axisStyle} tickFormatter={tickFormatter} interval={3} />
        <YAxis {...axisStyle} tickFormatter={fmt} width={56} />
        <Tooltip {...tooltipStyle} formatter={(v: unknown) => [fmt(Number(v)), ""]} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8", paddingTop: 8 }} />
        {referenceLines?.map(r => (
          <ReferenceLine
            key={r.value}
            y={r.value}
            stroke="#0358F1"
            strokeDasharray="4 3"
            strokeWidth={1}
            label={{ value: r.label, fill: "#0358F1", fontSize: 10, position: "insideTopRight" }}
          />
        ))}
        {scenarios.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={i === 1 ? 2 : 1.5}   // Expected scenario is bolder
            strokeDasharray={s.dashed ? "4 3" : undefined}
            fill={`url(#fan-${s.key})`}
            dot={false}
            activeDot={{ r: 3 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
