export const TAP2_COLORS = {
  primary: "#0358F1",
  secondary: "#333333",
  muted: "#878787",
  grid: "#DADADA",
  background: "#FFFFFF",
  cardBg: "#F5F5F5",
  lightGray: "#DADADA",
  mediumGray: "#878787",
  darkGray: "#333333",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
};

export const SERIES_COLORS = [
  TAP2_COLORS.primary,
  TAP2_COLORS.secondary,
  TAP2_COLORS.muted,
  "#5B8BF5",
  "#A0B4F9",
];

export const axisStyle = {
  tick: { fontSize: 11, fill: TAP2_COLORS.muted },
  tickLine: false as const,
  axisLine: false as const,
};

export const tooltipStyle = {
  contentStyle: {
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
};

export const gridStyle = {
  strokeDasharray: "3 3" as const,
  stroke: TAP2_COLORS.grid,
};
