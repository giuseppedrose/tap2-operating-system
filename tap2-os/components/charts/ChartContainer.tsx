import { type ReactNode } from "react";
import { DataStatusBadge, type DataStatus } from "@/components/shared/data-status-badge";

interface ChartContainerProps {
  title: string;
  question?: string;
  description?: string;
  status?: DataStatus;
  statusIntegration?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function ChartContainer({
  title,
  question,
  description,
  status,
  statusIntegration,
  children,
  className = "",
  action,
}: ChartContainerProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-snug">{title}</p>
          {question && (
            <p className="mt-0.5 text-xs font-medium text-blue-600">{question}</p>
          )}
          {description && !question && (
            <p className="mt-0.5 text-xs text-gray-400">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {action}
          {status && (
            <DataStatusBadge status={status} integration={statusIntegration} />
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
