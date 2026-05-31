"use client";

import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import { axisStyle, tooltipStyle, BLUE, MUTED } from "./chart-theme";

interface QuadrantPoint {
  name: string;
  x: number;    // e.g. lead volume / activity score
  y: number;    // e.g. close rate / revenue score
  size?: number; // optional bubble size (weighted pipeline)
  color?: string;
}

interface ScatterQuadrantChartProps {
  data: QuadrantPoint[];
  xLabel: string;
  yLabel: string;
  xMid?: number;
  yMid?: number;
  height?: number;
  xFormatter?: (v: number) => string;
  yFormatter?: (v: number) => string;
  quadrantLabels?: { tl: string; tr: string; bl: string; br: string };
}

export function ScatterQuadrantChart({
  data, xLabel, yLabel, xMid, yMid, height = 260,
  xFormatter, yFormatter, quadrantLabels,
}: ScatterQuadrantChartProps) {
  const xFmt = xFormatter ?? ((v: number) => String(v));
  const yFmt = yFormatter ?? ((v: number) => String(v));
  const xMedian = xMid ?? Math.round(data.reduce((s, d) => s + d.x, 0) / data.length);
  const yMedian = yMid ?? Math.round(data.reduce((s, d) => s + d.y, 0) / data.length);

  return (
    <div className="relative">
      {quadrantLabels && (
        <>
          <span className="absolute top-2 left-12 text-[9px] text-gray-300 uppercase tracking-wide">{quadrantLabels.tl}</span>
          <span className="absolute top-2 right-2 text-[9px] text-gray-300 uppercase tracking-wide">{quadrantLabels.tr}</span>
          <span className="absolute bottom-6 left-12 text-[9px] text-gray-300 uppercase tracking-wide">{quadrantLabels.bl}</span>
          <span className="absolute bottom-6 right-2 text-[9px] text-gray-300 uppercase tracking-wide">{quadrantLabels.br}</span>
        </>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel}
            {...axisStyle}
            tickFormatter={xFmt}
            label={{ value: xLabel, position: "insideBottom", offset: -4, fontSize: 10, fill: MUTED }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            {...axisStyle}
            tickFormatter={yFmt}
            width={44}
            label={{ value: yLabel, angle: -90, position: "insideLeft", offset: 8, fontSize: 10, fill: MUTED }}
          />
          <Tooltip
            {...tooltipStyle}
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0]?.payload as QuadrantPoint;
              return (
                <div className="rounded-md px-3 py-2" style={{ background: "#0f172a", fontSize: 12, color: "#f8fafc" }}>
                  <p className="font-semibold mb-1">{d.name}</p>
                  <p className="text-gray-400">{xLabel}: <span className="text-white">{xFmt(d.x)}</span></p>
                  <p className="text-gray-400">{yLabel}: <span className="text-white">{yFmt(d.y)}</span></p>
                </div>
              );
            }}
          />
          <ReferenceLine x={xMedian} stroke="#e2e8f0" strokeWidth={1} />
          <ReferenceLine y={yMedian} stroke="#e2e8f0" strokeWidth={1} />
          <Scatter data={data}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.color ?? BLUE}
                fillOpacity={0.8}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      {/* Name labels overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ top: 16, right: 16, bottom: 28, left: 44 }}>
        {/* Labels positioned by value — just show below the scatter */}
      </div>
    </div>
  );
}
