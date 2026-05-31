// Tap2 Chart Theme — Stripe/JP Morgan quality
// Single source of truth for all chart styling

export const BLUE  = "#0358F1";
export const BLUE2 = "#3b82f6";   // secondary series
export const SLATE = "#334155";   // dark line
export const MUTED = "#94a3b8";   // muted / axis text
export const GREEN = "#10b981";
export const AMBER = "#f59e0b";
export const RED   = "#ef4444";

export const TAP2_COLORS = {
  primary:   BLUE,
  secondary: SLATE,
  muted:     MUTED,
  success:   GREEN,
  warning:   AMBER,
  danger:    RED,
  grid:      "#f1f5f9",
};

export const FONT = "Inter, ui-sans-serif, system-ui, sans-serif";

// Axis: no lines, small muted tick labels
export const axisStyle = {
  tick:     { fontSize: 11, fill: MUTED, fontFamily: FONT },
  tickLine: false as const,
  axisLine: false as const,
};

// Minimal grid — only faint horizontal lines
export const gridStyle = {
  strokeDasharray: "0" as const,
  stroke: "#f1f5f9",
  vertical: false as const,
  horizontal: true as const,
};

// Premium dark tooltip — matches Stripe / Linear
export const tooltipStyle = {
  contentStyle: {
    background: "#0f172a",
    border: "none",
    borderRadius: 6,
    fontSize: 12,
    color: "#f8fafc",
    padding: "8px 12px",
    fontFamily: FONT,
    boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
  },
  labelStyle:  { color: "#94a3b8", fontSize: 11, marginBottom: 4 },
  itemStyle:   { color: "#f8fafc" },
  cursor:      { stroke: "#e2e8f0", strokeWidth: 1 },
};

// Standard gradient IDs used across area charts
export const GRADIENT_BLUE    = "tap2-grad-blue";
export const GRADIENT_GREEN   = "tap2-grad-green";
export const GRADIENT_SLATE   = "tap2-grad-slate";

// Standard chart margins
export const MARGIN_DEFAULT   = { top: 8, right: 8, bottom: 0, left: 0 };
export const MARGIN_WITH_YAXIS = { top: 8, right: 16, bottom: 0, left: 0 };
