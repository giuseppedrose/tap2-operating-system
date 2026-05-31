interface OperatingInsightProps {
  label: string;
  body: string;
  action?: string;
  type?: "finding" | "risk" | "opportunity" | "neutral";
}

const TYPE_CONFIG = {
  finding:     { border: "border-l-gray-400",  bg: "bg-gray-50",  labelColor: "text-gray-500" },
  risk:        { border: "border-l-red-400",   bg: "bg-red-50/40", labelColor: "text-red-600" },
  opportunity: { border: "border-l-[#0358F1]", bg: "bg-blue-50/30", labelColor: "text-[#0358F1]" },
  neutral:     { border: "border-l-gray-300",  bg: "bg-white",    labelColor: "text-gray-400" },
};

export function OperatingInsight({ label, body, action, type = "neutral" }: OperatingInsightProps) {
  const cfg = TYPE_CONFIG[type];
  return (
    <div className={`border-l-2 pl-3 py-1 ${cfg.border} ${cfg.bg}`}>
      <p className={`text-[10px] font-bold uppercase tracking-[0.1em] mb-0.5 ${cfg.labelColor}`}>{label}</p>
      <p className="text-xs text-gray-700 leading-relaxed">{body}</p>
      {action && (
        <p className="text-[10px] font-semibold text-gray-500 mt-1">→ {action}</p>
      )}
    </div>
  );
}
