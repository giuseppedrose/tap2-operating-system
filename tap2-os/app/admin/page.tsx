"use client";

import { ExecutiveInsight } from "@/components/shared/executive-insight";
import { DataStatusBadge } from "@/components/shared/data-status-badge";
import {
  CreditCard, Users, Mail, Building, Calendar, BarChart3, Inbox, Database, Bot,
  CheckCircle, Clock, AlertCircle, RefreshCw, Upload,
} from "lucide-react";

const BLUE = "#0358F1";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "pending" | "configured" | "error";
  dataType: string;
  tablesAffected: string[];
  lastSync: string | null;
  recordsSynced: number | null;
  envVars: string[];
  securityNote: string;
}

const integrations: Integration[] = [
  {
    id: "supabase",
    name: "Supabase",
    description: "Unified data layer — all Tap2 OS tables",
    icon: <Database className="h-5 w-5" />,
    status: "configured",
    dataType: "Database",
    tablesAffected: ["All tables"],
    lastSync: "Active",
    recordsSynced: null,
    envVars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
    securityNote: "SUPABASE_SERVICE_ROLE_KEY is server-side only. Never prefix with NEXT_PUBLIC.",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Revenue truth — MRR, subscriptions, invoices",
    icon: <CreditCard className="h-5 w-5" />,
    status: "pending",
    dataType: "Revenue",
    tablesAffected: ["clients", "transactions", "sync_logs"],
    lastSync: null,
    recordsSynced: null,
    envVars: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    securityNote: "Server-side only. Never expose in client code or NEXT_PUBLIC variables.",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Pipeline truth — deals, contacts, CRM",
    icon: <Users className="h-5 w-5" />,
    status: "pending",
    dataType: "CRM / Pipeline",
    tablesAffected: ["deals", "contacts", "sales_activities"],
    lastSync: null,
    recordsSynced: null,
    envVars: ["HUBSPOT_ACCESS_TOKEN"],
    securityNote: "Server-side only. OAuth token — rotate if exposed.",
  },
  {
    id: "instantly",
    name: "Instantly AI",
    description: "Outbound truth — campaigns, open/reply rates",
    icon: <Mail className="h-5 w-5" />,
    status: "pending",
    dataType: "Campaigns",
    tablesAffected: ["campaigns", "campaign_sends"],
    lastSync: null,
    recordsSynced: null,
    envVars: ["INSTANTLY_API_KEY"],
    securityNote: "Server-side only. Read-only API key preferred for security.",
  },
  {
    id: "rabobank",
    name: "Rabobank CSV",
    description: "Cash truth — bank balance, transactions",
    icon: <Building className="h-5 w-5" />,
    status: "pending",
    dataType: "Cash / Banking",
    tablesAffected: ["transactions"],
    lastSync: null,
    recordsSynced: null,
    envVars: ["Manual CSV upload — no API key required"],
    securityNote: "CSV contains sensitive financial data. Upload via secure admin UI only. Never commit CSV files to git.",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Meeting truth — demos, follow-ups, calls",
    icon: <Calendar className="h-5 w-5" />,
    status: "pending",
    dataType: "Meetings",
    tablesAffected: ["meetings", "sales_activities"],
    lastSync: null,
    recordsSynced: null,
    envVars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI"],
    securityNote: "OAuth flow required. GOOGLE_CLIENT_SECRET is server-side only.",
  },
  {
    id: "fathom",
    name: "Fathom",
    description: "Objection intelligence — meeting transcripts, summaries",
    icon: <BarChart3 className="h-5 w-5" />,
    status: "pending",
    dataType: "Meetings / Transcripts",
    tablesAffected: ["meetings", "objections"],
    lastSync: null,
    recordsSynced: null,
    envVars: ["FATHOM_API_KEY"],
    securityNote: "Server-side only. Transcripts may contain sensitive customer information.",
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Invoice scanning and financial back-office",
    icon: <Inbox className="h-5 w-5" />,
    status: "pending",
    dataType: "Email / Invoices",
    tablesAffected: ["transactions", "sync_logs"],
    lastSync: null,
    recordsSynced: null,
    envVars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    securityNote: "OAuth scope should be read-only. Never request send/modify permissions unless required.",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "AI layer — insight generation, objection analysis",
    icon: <Bot className="h-5 w-5" />,
    status: "pending",
    dataType: "AI / Analysis",
    tablesAffected: ["sync_logs"],
    lastSync: null,
    recordsSynced: null,
    envVars: ["ANTHROPIC_API_KEY"],
    securityNote: "Server-side only. Never expose API key in client code.",
  },
];

const phase2Tables = [
  "customer_lifecycle_events",
  "objections",
  "sales_activities",
  "data_source_status",
  "investor_metrics_snapshots",
];

const baseTables = [
  "clients", "deals", "partners", "gtm_channels", "campaigns",
  "campaign_sends", "transactions", "product_metrics", "wallet_installs",
  "meetings", "integrations", "sync_logs", "users", "settings",
];

function StatusIcon({ status }: { status: Integration["status"] }) {
  if (status === "configured") return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (status === "error") return <AlertCircle className="h-4 w-4 text-red-500" />;
  return <Clock className="h-4 w-4 text-gray-400" />;
}

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <ExecutiveInsight
        insight="Integration Hub — all API keys are prepared and environment variables are defined. Connect integrations one by one to replace seed data with live data."
        nextStep="Connect Supabase first, then Stripe for revenue, then HubSpot for pipeline."
      />

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">1</p>
          <p className="text-xs text-green-600 mt-1">Configured</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">8</p>
          <p className="text-xs text-amber-600 mt-1">Pending</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">9</p>
          <p className="text-xs text-gray-500 mt-1">Total Integrations</p>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <div key={integration.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0"
                style={{ background: "#e8effd", color: BLUE }}
              >
                {integration.icon}
              </div>
              <DataStatusBadge
                status={integration.status === "configured" ? "connected" : "pending"}
              />
            </div>

            <h3 className="text-sm font-semibold text-gray-900">{integration.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5 mb-3">{integration.description}</p>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-gray-400">Data type: </span>
                <span className="text-gray-700 font-medium">{integration.dataType}</span>
              </div>
              <div>
                <span className="text-gray-400">Tables: </span>
                <span className="text-gray-600">{integration.tablesAffected.join(", ")}</span>
              </div>
              <div>
                <span className="text-gray-400">Last sync: </span>
                <span className="text-gray-600">{integration.lastSync ?? "Not yet synced"}</span>
              </div>
              <div>
                <span className="text-gray-400">Records: </span>
                <span className="text-gray-600">{integration.recordsSynced != null ? integration.recordsSynced.toLocaleString() : "—"}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Required env vars</p>
              <div className="space-y-1">
                {integration.envVars.map((v) => (
                  <code key={v} className="block text-xs font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-600 truncate">
                    {v}
                  </code>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
              <p className="text-xs text-amber-700">
                <span className="font-medium">Security: </span>
                {integration.securityNote}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <StatusIcon status={integration.status} />
                <span className="text-xs text-gray-500">
                  {integration.status === "configured" ? "Active" : "Awaiting configuration"}
                </span>
              </div>
              <button
                disabled={integration.status !== "configured"}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border border-gray-200 bg-white text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Sync
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CSV Upload Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-900">CSV Import</p>
          <p className="text-xs text-gray-400 mt-0.5">Upload bank transaction CSV files from Rabobank</p>
        </div>
        <div>
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
            <Upload className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">Drop Rabobank CSV here</p>
            <p className="text-xs text-gray-400 mt-1">or click to browse — supports MT940 and CSV export formats</p>
            <button className="mt-3 rounded-lg px-4 py-2 text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              Choose File
            </button>
          </div>
        </div>
      </div>

      {/* Database Schema */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Database Schema</h3>
            <p className="text-xs text-gray-400 mt-0.5">Supabase tables — Phase 1 + Phase 2 migration applied</p>
          </div>
          <DataStatusBadge status="connected" integration="Supabase" />
        </div>

        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Phase 1 — Core Tables</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {baseTables.map((table) => (
              <div key={table} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <Database className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-xs font-mono text-gray-700 truncate">{table}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Phase 2 — Lifecycle & Intelligence</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {phase2Tables.map((table) => (
              <div key={table} className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                <Database className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                <span className="text-xs font-mono text-blue-700 truncate">{table}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Environment Variables Reference */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Environment Variables</h3>
            <p className="text-xs text-gray-400 mt-0.5">Reference for .env.local — never commit real keys to git</p>
          </div>
        </div>
        <pre className="text-xs font-mono bg-gray-900 text-green-400 rounded-xl p-4 overflow-x-auto leading-relaxed">
{`# Public (safe for client-side)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-side only (never use NEXT_PUBLIC_ prefix)
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
HUBSPOT_ACCESS_TOKEN=
INSTANTLY_API_KEY=
FATHOM_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
ANTHROPIC_API_KEY=`}
        </pre>
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Values shown above are blank placeholders. Real keys are stored in .env.local (git-ignored) and Vercel environment settings. Never log, print, or commit real API keys.
        </p>
      </div>
    </div>
  );
}
