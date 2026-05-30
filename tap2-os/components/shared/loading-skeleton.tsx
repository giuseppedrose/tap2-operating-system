import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  rows?: number;
  cols?: number;
  className?: string;
  cardClassName?: string;
}

export function LoadingSkeleton({
  rows = 2,
  cols = 4,
  className,
  cardClassName,
}: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 1 && "grid-cols-1",
        cols === 2 && "grid-cols-1 sm:grid-cols-2",
        cols === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        cols === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-sm",
            cardClassName
          )}
        >
          <div className="space-y-3">
            <div className="h-3 w-24 rounded bg-gray-200" />
            <div className="h-8 w-32 rounded bg-gray-200" />
            <div className="h-3 w-16 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-3 flex-1 rounded bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 animate-pulse">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 flex-1 rounded bg-gray-100" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
