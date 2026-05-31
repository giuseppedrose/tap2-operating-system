"use client";

import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { DataStatusBadge, type DataStatus } from "@/components/shared/data-status-badge";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/":          { title: "Command Center",          subtitle: "Business state · Actions · Signals" },
  "/revenue":   { title: "Revenue Intelligence",    subtitle: "MRR · Growth quality · Path to €100k ARR" },
  "/pipeline":  { title: "Pipeline Decisions",      subtitle: "Close risk · Stale deals · Action required" },
  "/partners":  { title: "Partner Performance",     subtitle: "Activity · Conversion · Revenue impact" },
  "/gtm":       { title: "GTM Efficiency",          subtitle: "Which channel is working and should be scaled" },
  "/campaigns": { title: "Outbound Attribution",    subtitle: "Email → meeting → deal → MRR" },
  "/lifecycle": { title: "Conversion Analysis",     subtitle: "Where prospects drop off and why" },
  "/meetings":  { title: "Meeting Intelligence",    subtitle: "Objections · Buying signals · Deal velocity" },
  "/cash":      { title: "Cash & Runway",           subtitle: "Burn rate · Runway · Upload Rabobank CSV" },
  "/product":   { title: "Product Metrics",         subtitle: "Wallet installs · Active cards · Engagement" },
  "/forecast":  { title: "Growth Forecast",         subtitle: "Scenarios · Milestones · Capital requirements" },
  "/investor":  { title: "Investor View",           subtitle: "Operating system overview" },
  "/board":     { title: "Board Dashboard",         subtitle: "Executive summary" },
  "/admin":                   { title: "Integration Hub",          subtitle: "Connect Stripe · HubSpot · Instantly · Rabobank" },
  "/admin/data-discovery":   { title: "Data Discovery",           subtitle: "Profile real API data before restructuring dashboards" },
  "/admin/restructure-plan": { title: "Restructure Plan",         subtitle: "What changes when real data is connected" },
};

const pageDataStatus: Record<string, { status: DataStatus; integration?: string }> = {
  "/":          { status: "seed", integration: "All Integrations Pending" },
  "/revenue":   { status: "seed", integration: "Stripe Pending" },
  "/pipeline":  { status: "seed", integration: "HubSpot Pending" },
  "/partners":  { status: "seed" },
  "/gtm":       { status: "seed", integration: "HubSpot + Instantly Pending" },
  "/campaigns": { status: "seed", integration: "Instantly Pending" },
  "/forecast":  { status: "seed", integration: "Stripe + HubSpot Pending" },
  "/cash":      { status: "manual", integration: "Rabobank CSV Pending" },
  "/product":   { status: "seed", integration: "Product Sync Pending" },
  "/lifecycle": { status: "seed", integration: "HubSpot Pending" },
  "/meetings":  { status: "seed", integration: "Calendar + Fathom Pending" },
  "/board":     { status: "seed" },
  "/admin":     { status: "connected", integration: "Supabase" },
};

export function Header() {
  const pathname = usePathname();
  const [refreshing, setRefreshing] = useState(false);

  const page = pageTitles[pathname] ?? { title: "Tap2 OS", subtitle: "" };
  const today = format(new Date(), "MMMM d, yyyy");
  const dataStatus = pageDataStatus[pathname];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur px-6">
      <div>
        <h1 className="text-base font-semibold text-gray-900 leading-tight">{page.title}</h1>
        {page.subtitle && <p className="text-xs text-gray-400 mt-0.5">{page.subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {dataStatus && (
          <span className="hidden sm:flex">
            <DataStatusBadge status={dataStatus.status} integration={dataStatus.integration} />
          </span>
        )}
        <span className="hidden md:block text-xs text-gray-300">{today}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1200); }}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline text-xs">Refresh</span>
        </Button>
      </div>
    </header>
  );
}
