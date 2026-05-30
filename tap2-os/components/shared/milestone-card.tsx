"use client";

export function MilestoneCard({
  label, current, target, unit = '€', color = '#0358F1'
}: {
  label: string; current: number; target: number; unit?: string; color?: string;
}) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full mb-3">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Now: <strong className="text-gray-900">{unit}{current.toLocaleString()}</strong></span>
        <span>Target: <strong className="text-gray-900">{unit}{target.toLocaleString()}</strong></span>
      </div>
    </div>
  );
}
