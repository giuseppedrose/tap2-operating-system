"use client";

import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { DataStatusBadge, type DataStatus } from "@/components/shared/data-status-badge";

const pageTitles: Record<string, string> = {
  "/": "Founder Dashboard",
  "/revenue": "Revenue",
  "/pipeline": "Sales Pipeline",
  "/partners": "Partner Performance",
  "/gtm": "GTM Channels",
  "/campaigns": "Outbound Campaigns",
  "/forecast": "Forecast",
  "/cash": "Cash & Runway",
  "/product": "Product Metrics",
  "/lifecycle": "Customer Lifecycle",
  "/meetings": "Meetings & Objections",
  "/board": "Board Dashboard",
  "/admin": "Integration Hub",
};

const pageDataStatus: Record<string, { status: DataStatus; integration?: string }> = {
  "/": { status: "seed", integration: "All Integrations Pending" },
  "/revenue": { status: "seed", integration: "Stripe Pending" },
  "/pipeline": { status: "seed", integration: "HubSpot Pending" },
  "/partners": { status: "seed" },
  "/gtm": { status: "seed", integration: "All Sources Pending" },
  "/campaigns": { status: "seed", integration: "Instantly Pending" },
  "/forecast": { status: "seed", integration: "Stripe + HubSpot Pending" },
  "/cash": { status: "manual", integration: "Rabobank CSV Pending" },
  "/product": { status: "seed", integration: "Product Sync Pending" },
  "/lifecycle": { status: "seed", integration: "HubSpot Pending" },
  "/meetings": { status: "seed", integration: "Calendar + Fathom Pending" },
  "/board": { status: "seed" },
  "/admin": { status: "connected", integration: "Supabase" },
};

export function Header() {
  const pathname = usePathname();
  const [refreshing, setRefreshing] = useState(false);

  const title = pageTitles[pathname] ?? "Tap2 OS";
  const today = format(new Date(), "MMMM d, yyyy");
  const dataStatus = pageDataStatus[pathname];

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
        {dataStatus && (
          <span className="hidden sm:flex">
            <DataStatusBadge
              status={dataStatus.status}
              integration={dataStatus.integration}
            />
          </span>
        )}
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
