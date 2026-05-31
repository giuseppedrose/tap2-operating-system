// Tap2 Chart Theme — Stripe-quality, minimal, high-precision

export const FONT = '"Inter", ui-sans-serif, system-ui, sans-serif';

export const TAP2_COLORS = {
  primary:   "#0358F1",
  secondary: "#1a1a2e",
  muted:     "#94a3b8",
  grid:      "#f1f5f9",
  gridLine:  "#e2e8f0",
  background: "#ffffff",
  cardBg:    "#f8fafc",
  success:   "#10b981",
  warning:   "#f59e0b",
  danger:    "#ef4444",
  text:      "#0f172a",
  textMuted: "#64748b",
};

export const SERIES_COLORS = [
  "#0358F1",
  "#06b6d4",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
];

// No grid lines — Stripe-style clean
export const axisStyle = {
  tick: { fontSize: 11, fill: "#94a3b8", fontFamily: FONT },
  tickLine: false as const,
  axisLine: false as const,
};

// Invisible grid — only faint horizontal rules
export const gridStyle = {
  strokeDasharray: "0" as const,
  stroke: "#f1f5f9",
  horizontal: true as const,
  vertical: false as const,
};

// Premium tooltip
export const tooltipStyle = {
  contentStyle: {
    background: "#0f172a",
    border: "none",
    borderRadius: 8,
    fontSize: 12,
    color: "#f8fafc",
    padding: "8px 12px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
    fontFamily: "Inter, sans-serif",
  },
  labelStyle: { color: "#94a3b8", fontSize: 11, marginBottom: 2, fontFamily: FONT },
  cursor: { stroke: "#f1f5f9", strokeWidth: 1 },
  itemStyle: { color: "#f8fafc", fontSize: 12, fontFamily: FONT },
};

// Standard dot style
export const activeDotStyle = {
  r: 4,
  fill: "#0358F1",
  stroke: "#ffffff",
  strokeWidth: 2,
};
