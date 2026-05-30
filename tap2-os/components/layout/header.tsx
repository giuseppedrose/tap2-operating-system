"use client";

import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const pageTitles: Record<string, string> = {
  "/": "Founder Dashboard",
  "/revenue": "Revenue",
  "/pipeline": "Sales Pipeline",
  "/partners": "Partner Performance",
  "/gtm": "GTM Channels",
  "/campaigns": "Outbound Campaigns",
  "/forecast": "Forecast",
  "/cash": "Cash & Burn",
  "/product": "Product Metrics",
  "/board": "Board Dashboard",
  "/admin": "Data Sources",
};

export function Header() {
  const pathname = usePathname();
  const [refreshing, setRefreshing] = useState(false);

  const title = pageTitles[pathname] ?? "Tap2 OS";
  const today = format(new Date(), "MMMM d, yyyy");

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 leading-tight">{title}</h1>
        <p className="text-xs text-gray-400">{today}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 border border-green-200">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          Live data
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
    </header>
  );
}
