import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subvalue?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function KpiCard({
  title,
  value,
  subvalue,
  trend,
  trendLabel,
  icon,
  loading = false,
  className,
}: KpiCardProps) {
  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;
  const trendNeutral = trend !== undefined && trend === 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-6 shadow-sm",
        className
      )}
    >
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-8 w-32 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-200" />
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">
              {value}
            </p>
            {(trend !== undefined || subvalue) && (
              <div className="flex items-center gap-2">
                {trend !== undefined && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      trendPositive && "text-green-600",
                      trendNegative && "text-red-500",
                      trendNeutral && "text-gray-400"
                    )}
                  >
                    {trendPositive && <TrendingUp className="h-3.5 w-3.5" />}
                    {trendNegative && <TrendingDown className="h-3.5 w-3.5" />}
                    {trendNeutral && <Minus className="h-3.5 w-3.5" />}
                    <span>
                      {trendPositive ? "+" : ""}
                      {trend}%
                    </span>
                  </div>
                )}
                {trendLabel && (
                  <span className="text-xs text-gray-400">{trendLabel}</span>
                )}
                {subvalue && !trendLabel && (
                  <span className="text-xs text-gray-500">{subvalue}</span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0358F1]">
              {icon}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
