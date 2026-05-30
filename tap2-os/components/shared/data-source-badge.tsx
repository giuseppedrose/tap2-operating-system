"use client";
import type { DataSourceStatus } from "@/lib/mock-data/connected";

const CONFIG: Record<DataSourceStatus, { label: string; bg: string; text: string; dot: string }> = {
  live:      { label: 'Live',      bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500' },
  connected: { label: 'Connected', bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  mock:      { label: 'Mock',      bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400' },
  pending:   { label: 'Pending',   bg: 'bg-gray-100',  text: 'text-gray-500',   dot: 'bg-gray-400' },
  csv:       { label: 'CSV',       bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400' },
  manual:    { label: 'Manual',    bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
};

export function DataSourceBadge({ status, className = '' }: { status: DataSourceStatus; className?: string }) {
  const c = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${c.bg} ${c.text} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
