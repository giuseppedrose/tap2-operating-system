"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataStatusBadge } from "@/components/shared/data-status-badge";
import {
  CreditCard, Users, Mail, Building, Calendar, Mic, Inbox, Database, Bot,
  CheckCircle, Clock, XCircle, RefreshCw, Upload, AlertTriangle, LogOut,
  ChevronDown, ChevronUp, Shield,
} from "lucide-react";

const BLUE = "#0358F1";

// ─── Real schema from migrations ───────────────────────────────────────────────
const PHASE1_TABLES = [
  "partners", "gtm_sources", "customers", "subscriptions", "deals",
  "outbound_campaigns", "campaign_leads", "meetings", "call_insights",
  "bank_transactions", "cash_snapshots", "product_metrics", "forecasts",
];
const PHASE2_TABLES = [
  "customer_lifecycle_events", "objections", "sales_activities",
  "data_source_status", "investor_metrics_snapshots",
];

// ─── Integration definitions ───────────────────────────────────────────────────
type IntegrationStatus = "fully_configured" | "partially_configured" | "missing";

interface IntegrationDef {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  dataType: string;
  tables: string[];
  envVars: string[];
  securityNote: string;
  syncImplemented: boolean;
  requiredScopes?: string[];
  customProps?: string[];
  activationChecklist: string[];
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    id: "supabase",
    name: "Supabase",
    description: "Unified data layer — all Tap2 OS tables",
    icon: <Database className="h-5 w-5" />,
    dataType: "Database",
    tables: ["All tables"],
    envVars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
    securityNote: "SUPABASE_SERVICE_ROLE_KEY must never appear in client code or NEXT_PUBLIC variables.",
    syncImplemented: true,
    activationChecklist: [
      "Create Supabase project",
      "Run Phase 1 migration SQL",
      "Run Phase 2 migration SQL",
      "Set NEXT_PUBLIC_SUPABASE_URL in Vercel",
      "Set NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel",
      "Set SUPABASE_SERVICE_ROLE_KEY in Vercel (server-side only)",
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Revenue truth — MRR, subscriptions, invoices, customers",
    icon: <CreditCard className="h-5 w-5" />,
    dataType: "Revenue / Billing",
    tables: ["customers", "subscriptions", "bank_transactions"],
    envVars: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    securityNote: "Server-side only. Never expose in client code. Rotate if leaked.",
    syncImplemented: false,
    activationChecklist: [
      "Create Stripe restricted API key with read access to customers, subscriptions, invoices",
      "Set STRIPE_SECRET_KEY in Vercel (server-side only, never NEXT_PUBLIC)",
      "Configure Stripe webhook → /api/webhooks/stripe",
      "Set STRIPE_WEBHOOK_SECRET in Vercel",
      "Implement sync route: /api/sync/stripe",
    ],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Pipeline truth — deals, contacts, companies, activities",
    icon: <Users className="h-5 w-5" />,
    dataType: "CRM / Pipeline",
    tables: ["customers", "deals", "sales_activities", "customer_lifecycle_events"],
    envVars: ["HUBSPOT_ACCESS_TOKEN"],
    securityNote: "Use a private app token with minimal scopes. Rotate if leaked.",
    syncImplemented: false,
    requiredScopes: ["crm.objects.contacts.read", "crm.objects.companies.read", "crm.objects.deals.read"],
    customProps: [
      "tap2_partner_owner", "tap2_expected_mrr", "tap2_use_case", "tap2_market",
      "tap2_campaign_id", "tap2_deal_quality", "tap2_next_step", "tap2_lost_reason",
      "tap2_competitor", "tap2_icp_fit",
    ],
    activationChecklist: [
      "Create HubSpot private app with CRM read scopes",
      "Create custom properties listed above in HubSpot",
      "Set HUBSPOT_ACCESS_TOKEN in Vercel (server-side only)",
      "Implement sync route: /api/sync/hubspot",
      "Map HubSpot deal stages to Tap2 OS stages",
    ],
  },
  {
    id: "instantly",
    name: "Instantly AI",
    description: "Outbound truth — campaigns, sequences, reply tracking",
    icon: <Mail className="h-5 w-5" />,
    dataType: "Outbound Campaigns",
    tables: ["outbound_campaigns", "campaign_leads"],
    envVars: ["INSTANTLY_API_KEY"],
    securityNote: "Read-only API key preferred. Server-side only.",
    syncImplemented: false,
    activationChecklist: [
      "Generate Instantly API key from dashboard",
      "Set INSTANTLY_API_KEY in Vercel",
      "Implement sync route: /api/sync/instantly",
      "Map Instantly campaign IDs to outbound_campaigns table",
    ],
  },
  {
    id: "rabobank",
    name: "Rabobank CSV",
    description: "Cash truth — bank balance, transactions, burn",
    icon: <Building className="h-5 w-5" />,
    dataType: "Banking / Cash",
    tables: ["bank_transactions", "cash_snapshots"],
    envVars: [],
    securityNote: "CSV contains sensitive financial data. Upload via admin only. Never commit CSV files.",
    syncImplemented: false,
    activationChecklist: [
      "Export monthly CSV from Rabobank (MT940 or CSV format)",
      "Upload via CSV import workflow below",
      "Review auto-categorization",
      "Confirm monthly burn figure",
      "Update runway calculation",
    ],
  },
  {
    id: "google",
    name: "Google Calendar + Gmail",
    description: "Meeting truth — demos, calls + invoice scanning",
    icon: <Calendar className="h-5 w-5" />,
    dataType: "Meetings / Invoices",
    tables: ["meetings", "bank_transactions"],
    envVars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI"],
    securityNote: "GOOGLE_CLIENT_SECRET is server-side only. Request read-only scopes only.",
    syncImplemented: false,
    activationChecklist: [
      "Create Google Cloud project and OAuth 2.0 credentials",
      "Set GOOGLE_CLIENT_ID in Vercel",
      "Set GOOGLE_CLIENT_SECRET in Vercel (server-side only)",
      "Set GOOGLE_REDIRECT_URI to /api/auth/google/callback",
      "Request scopes: calendar.readonly, gmail.readonly",
      "Implement OAuth flow: /api/auth/google",
    ],
  },
  {
    id: "fathom",
    name: "Fathom",
    description: "Objection intelligence — transcripts, summaries, action items",
    icon: <Mic className="h-5 w-5" />,
    dataType: "Meeting Intelligence",
    tables: ["meetings", "objections", "call_insights"],
    envVars: ["FATHOM_API_KEY"],
    securityNote: "Server-side only. Transcripts may contain confidential customer information.",
    syncImplemented: false,
    activationChecklist: [
      "Generate Fathom API key",
      "Set FATHOM_API_KEY in Vercel (server-side only)",
      "Implement sync route: /api/sync/fathom",
      "Link Fathom calls to HubSpot meetings via calendar event ID",
    ],
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Invoice scanning and financial thread tracking",
    icon: <Inbox className="h-5 w-5" />,
    dataType: "Email / Invoices",
    tables: ["bank_transactions"],
    envVars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    securityNote: "Read-only scope only. Never request send or modify permissions.",
    syncImplemented: false,
    activationChecklist: [
      "Reuse Google OAuth credentials from Calendar integration",
      "Request gmail.readonly scope",
      "Implement invoice detection: /api/sync/gmail-invoices",
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    description: "AI insight layer — objection analysis, deal scoring, GTM recommendations",
    icon: <Bot className="h-5 w-5" />,
    dataType: "AI Analysis",
    tables: ["call_insights", "objections"],
    envVars: ["ANTHROPIC_API_KEY"],
    securityNote: "Server-side only. Never expose in client bundles. Monitor usage and set spend limits.",
    syncImplemented: false,
    activationChecklist: [
      "Create Anthropic API key",
      "Set ANTHROPIC_API_KEY in Vercel (server-side only)",
      "Set API spend limits in Anthropic console",
      "Implement insight generation: /api/insights/generate",
    ],
  },
];

// ─── Seed sync logs ────────────────────────────────────────────────────────────
const SEED_SYNC_LOGS = [
  { integration: "Supabase", status: "success", started_at: "2026-05-31 08:00", completed_at: "2026-05-31 08:00", records: 0, failed: 0, message: "Schema validated. No data synced — all data is seed." },
  { integration: "Stripe", status: "not_implemented", started_at: "—", completed_at: "—", records: 0, failed: 0, message: "Integration not yet activated." },
  { integration: "HubSpot", status: "not_implemented", started_at: "—", completed_at: "—", records: 0, failed: 0, message: "Integration not yet activated." },
  { integration: "Instantly AI", status: "not_implemented", started_at: "—", completed_at: "—", records: 0, failed: 0, message: "Integration not yet activated." },
  { integration: "Rabobank CSV", status: "not_implemented", started_at: "—", completed_at: "—", records: 0, failed: 0, message: "No CSV uploaded yet." },
];

// ─── CSV upload state ──────────────────────────────────────────────────────────
type CSVStep = "idle" | "preview" | "categorize" | "review" | "confirm";

interface LiveStatus {
  integrations: {
    id: string;
    status: IntegrationStatus;
    varStatus: Record<string, "configured" | "missing">;
  }[];
}

function StatusPill({ status }: { status: IntegrationStatus | undefined }) {
  if (!status) return <span className="text-xs text-gray-400">—</span>;
  if (status === "fully_configured") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-medium text-green-700">
      <CheckCircle className="h-3 w-3" /> Configured
    </span>
  );
  if (status === "partially_configured") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">
      <AlertTriangle className="h-3 w-3" /> Partial
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 text-xs font-medium text-gray-500">
      <XCircle className="h-3 w-3" /> Missing
    </span>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [liveStatus, setLiveStatus] = useState<LiveStatus | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [csvStep, setCsvStep] = useState<CSVStep>("idle");

  useEffect(() => {
    fetch("/api/admin/integration-status")
      .then(r => r.json())
      .then(setLiveStatus)
      .catch(() => null);
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  function getLiveStatusFor(id: string) {
    return liveStatus?.integrations.find(i => i.id === id);
  }

  const configuredCount = liveStatus?.integrations.filter(i => i.status !== "missing").length ?? 0;
  const totalCount = INTEGRATIONS.length;

  return (
    <div className="space-y-8">
      {/* Internal only banner */}
      <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Shield className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Internal Admin — Not Investor Facing</p>
            <p className="text-xs text-amber-700 mt-0.5">
              This page is protected by credentials. Environment variables, sync controls, and schema details are internal only.
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors flex-shrink-0"
        >
          <LogOut className="h-3.5 w-3.5" /> Log out
        </button>
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{configuredCount}</p>
          <p className="text-xs text-green-600 mt-1">Configured</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{totalCount - configuredCount}</p>
          <p className="text-xs text-gray-500 mt-1">Pending activation</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">{totalCount}</p>
          <p className="text-xs text-gray-500 mt-1">Total integrations</p>
        </div>
      </div>

      {/* Integration cards */}
      <div>
        <p className="page-section-header">Integration Status</p>
        <div className="space-y-2">
          {INTEGRATIONS.map(integration => {
            const live = getLiveStatusFor(integration.id);
            const isExpanded = expandedId === integration.id;

            return (
              <div key={integration.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                {/* Header row */}
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : integration.id)}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0" style={{ background: "#e8effd", color: BLUE }}>
                    {integration.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{integration.name}</p>
                    <p className="text-xs text-gray-400 truncate">{integration.description}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="hidden sm:block text-xs text-gray-400">{integration.dataType}</span>
                    <StatusPill status={live?.status} />
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/40 space-y-5">
                    {/* Tables + Env vars */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tables Affected</p>
                        <div className="flex flex-wrap gap-1.5">
                          {integration.tables.map(t => (
                            <span key={t} className="inline-flex items-center gap-1 rounded bg-white border border-gray-200 px-2 py-1 text-xs font-mono text-gray-600">
                              <Database className="h-3 w-3 text-gray-400" />{t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Environment Variables</p>
                        <div className="space-y-1">
                          {integration.envVars.length > 0 ? integration.envVars.map(v => {
                            const varStatus = live?.varStatus[v];
                            return (
                              <div key={v} className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-1.5">
                                <code className="text-xs font-mono text-gray-600 truncate">{v}</code>
                                {varStatus === "configured"
                                  ? <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                  : varStatus === "missing"
                                  ? <XCircle className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                                  : <Clock className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />}
                              </div>
                            );
                          }) : (
                            <p className="text-xs text-gray-400">No API key required — manual CSV upload.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* HubSpot custom properties */}
                    {integration.customProps && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Required HubSpot Custom Properties</p>
                        <div className="flex flex-wrap gap-1.5">
                          {integration.customProps.map(p => (
                            <code key={p} className="rounded bg-white border border-gray-200 px-2 py-1 text-xs font-mono text-gray-600">{p}</code>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* HubSpot required scopes */}
                    {integration.requiredScopes && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Required OAuth Scopes</p>
                        <div className="flex flex-wrap gap-1.5">
                          {integration.requiredScopes.map(s => (
                            <code key={s} className="rounded bg-white border border-gray-200 px-2 py-1 text-xs font-mono text-gray-600">{s}</code>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Security note */}
                    <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5">
                      <p className="text-xs text-amber-700"><span className="font-semibold">Security: </span>{integration.securityNote}</p>
                    </div>

                    {/* Activation checklist */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Activation Checklist</p>
                      <ol className="space-y-1">
                        {integration.activationChecklist.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-gray-500 font-semibold text-[10px] flex-shrink-0 mt-0.5">{i + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Sync button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {live?.status === "fully_configured" || live?.status === "partially_configured"
                          ? <CheckCircle className="h-4 w-4 text-green-500" />
                          : <Clock className="h-4 w-4 text-gray-300" />}
                        <span className="text-xs text-gray-500">
                          {live?.status === "fully_configured" || live?.status === "partially_configured"
                            ? "Credentials detected"
                            : "Awaiting configuration"}
                        </span>
                      </div>
                      <button
                        disabled
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-400 cursor-not-allowed opacity-60"
                        title={integration.syncImplemented ? "Sync now" : "Sync not yet implemented"}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        {integration.syncImplemented ? "Sync Now" : "Not implemented yet"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Rabobank CSV workflow */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Rabobank CSV Import Workflow</p>
              <p className="text-xs text-gray-400 mt-0.5">Preview → categorize → review → confirm → update cash dashboard</p>
            </div>
            <DataStatusBadge status="manual" integration="Rabobank CSV" />
          </div>
        </div>

        <div className="px-5 py-5">
          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-6">
            {(["idle", "preview", "categorize", "review", "confirm"] as CSVStep[]).map((step, i) => {
              const stepLabels = ["Upload", "Preview", "Categorize", "Review", "Confirm"];
              const stepIndex = ["idle", "preview", "categorize", "review", "confirm"].indexOf(csvStep);
              const isActive = step === csvStep;
              const isDone = i < stepIndex;
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      isDone ? "bg-green-500 text-white" :
                      isActive ? "bg-[#0358F1] text-white" :
                      "bg-gray-100 text-gray-400"
                    }`}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    <span className={`text-xs mt-1 ${isActive ? "font-semibold text-[#0358F1]" : isDone ? "text-green-600" : "text-gray-400"}`}>
                      {stepLabels[i]}
                    </span>
                  </div>
                  {i < 4 && <div className={`h-px flex-1 mb-5 ${isDone ? "bg-green-400" : "bg-gray-200"}`} />}
                </div>
              );
            })}
          </div>

          {csvStep === "idle" && (
            <div>
              <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                <Upload className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">Drop Rabobank CSV or MT940 export here</p>
                <p className="text-xs text-gray-400 mt-1">Supports MT940 (.mt940), CSV (.csv), and CAMT.053 formats</p>
                <button
                  onClick={() => setCsvStep("preview")}
                  className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Choose file (demo mode)
                </button>
              </div>
              <div className="mt-4 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
                <p className="text-xs text-amber-700">
                  <span className="font-semibold">Important:</span> CSV files contain sensitive financial data.
                  Files are processed server-side only. Never commit CSV exports to git or share them outside the admin panel.
                </p>
              </div>
            </div>
          )}

          {csvStep !== "idle" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-xs text-blue-700 font-medium">
                  Demo mode — no real file uploaded. This shows the planned workflow.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {csvStep !== "confirm" && (
                  <button
                    onClick={() => {
                      const steps: CSVStep[] = ["idle", "preview", "categorize", "review", "confirm"];
                      const i = steps.indexOf(csvStep);
                      if (i < steps.length - 1) setCsvStep(steps[i + 1]);
                    }}
                    className="rounded-lg bg-[#0358F1] px-4 py-2 text-xs font-medium text-white hover:bg-[#0247c9] transition-colors"
                  >
                    Continue →
                  </button>
                )}
                {csvStep === "confirm" && (
                  <button
                    onClick={() => setCsvStep("idle")}
                    className="rounded-lg bg-green-600 px-4 py-2 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                  >
                    ✓ Confirm Import (demo)
                  </button>
                )}
                <button
                  onClick={() => setCsvStep("idle")}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Database schema */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Database Schema</p>
            <p className="text-xs text-gray-400 mt-0.5">Phase 1 + Phase 2 migrations applied — live Supabase tables</p>
          </div>
          <DataStatusBadge status="connected" integration="Supabase" />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Phase 1 — Core Schema</p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
              {PHASE1_TABLES.map(t => (
                <div key={t} className="flex items-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5">
                  <Database className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-xs font-mono text-gray-600 truncate">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Phase 2 — Lifecycle & Intelligence</p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
              {PHASE2_TABLES.map(t => (
                <div key={t} className="flex items-center gap-1.5 rounded border border-blue-200 bg-blue-50 px-2.5 py-1.5">
                  <Database className="h-3 w-3 text-blue-400 flex-shrink-0" />
                  <span className="text-xs font-mono text-blue-700 truncate">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sync logs */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-900">Recent Sync Activity</p>
            <p className="text-xs text-gray-400 mt-0.5">Seed data — real logs will appear once integrations are connected</p>
          </div>
          <DataStatusBadge status="seed" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Integration</th>
                <th>Status</th>
                <th>Started</th>
                <th>Completed</th>
                <th>Records</th>
                <th>Failed</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {SEED_SYNC_LOGS.map((log, i) => (
                <tr key={i}>
                  <td className="font-medium text-gray-800">{log.integration}</td>
                  <td>
                    {log.status === "success" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded px-2 py-0.5">
                        <CheckCircle className="h-3 w-3" /> Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-0.5">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="text-gray-400">{log.started_at}</td>
                  <td className="text-gray-400">{log.completed_at}</td>
                  <td className="text-gray-600">{log.records}</td>
                  <td className="text-gray-400">{log.failed}</td>
                  <td className="text-gray-500 max-w-[240px] truncate">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Env var reference */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-sm font-semibold text-gray-900 mb-1">Environment Variable Reference</p>
        <p className="text-xs text-gray-400 mb-4">Configure in Vercel → Settings → Environment Variables. Never commit real values to git.</p>
        <pre className="text-xs font-mono bg-gray-900 text-green-400 rounded-xl p-4 overflow-x-auto leading-relaxed">
{`# Public (safe for client-side)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Admin auth
ADMIN_USERNAME=
ADMIN_PASSWORD=

# Server-side only — never NEXT_PUBLIC_
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
          All values above are blank placeholders. Real keys live in Vercel environment settings only. Never log, print, or commit real API keys.
        </p>
      </div>
    </div>
  );
}
