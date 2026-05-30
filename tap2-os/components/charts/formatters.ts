export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `€${(value / 1_000).toFixed(1)}k`;
    return `€${value}`;
  }
  return `€${value.toLocaleString("nl-NL")}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return `${value}`;
}

export function formatMonth(month: string): string {
  return month.split(" ")[0];
}

export const currencyFormatter = (v: unknown) =>
  [`€${Number(v).toLocaleString("nl-NL")}`] as [string];

export const percentFormatter = (v: unknown) =>
  [`${Number(v).toFixed(1)}%`] as [string];
