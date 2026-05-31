import type { ReactNode } from "react";

interface ChartFrameProps {
  title: string;
  question?: string;
  source?: string;
  sourceStatus?: "live" | "seed" | "manual" | "derived" | "pending";
  footnote?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  height?: number;
}

const STATUS_DOT: Record<string, string> = {
  live:    "bg-emerald-500",
  seed:    "bg-amber-400",
  manual:  "bg-purple-400",
  derived: "bg-blue-400",
  pending: "bg-gray-300",
};
const STATUS_TEXT: Record<string, string> = {
  live:    "text-emerald-700",
  seed:    "text-amber-700",
  manual:  "text-purple-700",
  derived: "text-blue-700",
  pending: "text-gray-400",
};
const STATUS_LABEL: Record<string, string> = {
  live: "Live", seed: "Seed", manual: "Manual", derived: "Derived", pending: "Pending",
};

export function ChartFrame({
  title, question, source, sourceStatus = "seed",
  footnote, children, className = "", action,
}: ChartFrameProps) {
  return (
    <div className={`border border-gray-200 bg-white ${className}`}>
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900 leading-snug">{title}</p>
          {question && (
            <p className="text-[11px] text-blue-600 mt-0.5">{question}</p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {action}
          {source && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${STATUS_TEXT[sourceStatus]}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[sourceStatus]}`} />
              {STATUS_LABEL[sourceStatus]} · {source}
            </span>
          )}
        </div>
      </div>
      <div className="px-4 pb-4">{children}</div>
      {footnote && (
        <div className="px-4 pb-3 border-t border-gray-50">
          <p className="text-[10px] text-gray-400 italic pt-2">{footnote}</p>
        </div>
      )}
    </div>
  );
}
