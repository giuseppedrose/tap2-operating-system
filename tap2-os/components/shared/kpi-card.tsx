import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subvalue?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
  accent?: boolean;
}

export function KpiCard({
  title,
  value,
  subvalue,
  trend,
  trendLabel,
  loading = false,
  className,
  accent = false,
}: KpiCardProps) {
  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;

  return (
    <div className={cn(
      "rounded-xl border bg-white p-5",
      accent ? "border-[#0358F1]/20 bg-[#0358F1]/[0.02]" : "border-gray-200",
      className
    )}>
      {loading ? (
        <div className="animate-pulse space-y-2.5">
          <div className="h-3 w-20 rounded bg-gray-100" />
          <div className="h-7 w-28 rounded bg-gray-100" />
          <div className="h-3 w-16 rounded bg-gray-100" />
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{title}</p>
          <p className={cn(
            "text-2xl font-semibold tracking-tight",
            accent ? "text-[#0358F1]" : "text-gray-900"
          )}>
            {value}
          </p>
          <div className="flex items-center gap-1.5 pt-0.5 min-h-[20px]">
            {trend !== undefined && (
              <span className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                trendPositive ? "text-emerald-600" : trendNegative ? "text-red-500" : "text-gray-400"
              )}>
                {trendPositive && <TrendingUp className="h-3 w-3" />}
                {trendNegative && <TrendingDown className="h-3 w-3" />}
                {trendPositive ? "+" : ""}{trend}%
              </span>
            )}
            {trendLabel && <span className="text-xs text-gray-400">{trendLabel}</span>}
            {subvalue && <span className="text-xs text-gray-400">{subvalue}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
