interface SourceOfTruthBadgeProps {
  source: string;
  status: "live" | "seed" | "manual" | "derived" | "pending";
  className?: string;
}

const STATUS_CONFIG = {
  live:    { label: "Live", dot: "bg-emerald-500", text: "text-emerald-700" },
  seed:    { label: "Seed", dot: "bg-amber-400",   text: "text-amber-700" },
  manual:  { label: "Manual", dot: "bg-purple-400", text: "text-purple-700" },
  derived: { label: "Derived", dot: "bg-blue-400", text: "text-blue-700" },
  pending: { label: "Pending", dot: "bg-gray-300",  text: "text-gray-400" },
};

export function SourceOfTruthBadge({ source, status, className = "" }: SourceOfTruthBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium ${cfg.text} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label} · {source}
    </span>
  );
}
