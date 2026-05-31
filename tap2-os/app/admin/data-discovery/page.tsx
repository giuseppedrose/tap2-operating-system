"use client";

import { useState, useEffect } from "react";
import { HUBSPOT_REQUIRED_CUSTOM_PROPERTIES, HUBSPOT_DEAL_MAPPINGS } from "@/lib/integrations/mapping/hubspot-mapper";
import { CONFIDENCE_CONFIG } from "@/lib/integrations/mapping/mapping-confidence";
import type { MappingConfidence } from "@/lib/integrations/mapping/types";

type SyncStatus = "idle" | "running" | "ok" | "error" | "no_credentials";
type ErrorCode =
  | "auth_required" | "missing_env_var" | "missing_table" | "rls_permission_denied"
  | "invalid_api_key" | "insufficient_api_scope" | "upstream_api_error" | "supabase_error";

interface StepResult { step: number; name: string; status: string; detail: string; error_code?: string; }

interface SourceState {
  status: SyncStatus;
  message?: string;
  errorCode?: ErrorCode;
  profile?: Record<string, unknown>;
  records_fetched?: number;
  steps?: StepResult[];
  last_check?: string;
}

interface DiagnosticsResult {
  summary?: { ready_for_discovery: boolean; issues: string[] };
  env_vars?: Record<string, string>;
  vercel_name_resolution?: Record<string, string>;
  supabase?: Record<string, unknown>;
  table_check?: Record<string, string>;
  missing_tables?: string[];
  hubspot_ping?: Record<string, unknown>;
  stripe_ping?: Record<string, unknown>;
  instantly_ping?: Record<string, unknown>;
  auth?: Record<string, unknown>;
}

const SOURCES = [
  { id: "stripe",   name: "Stripe",         priority: "critical" as const, impact: "MRR · ARR · Churn · Customers" },
  { id: "hubspot",  name: "HubSpot",         priority: "critical" as const, impact: "Pipeline · Deals · CRM · Partners" },
  { id: "instantly", name: "Instantly AI",   priority: "high" as const,     impact: "Campaigns · Attribution · Outbound" },
  { id: "fathom",   name: "Fathom",          priority: "high" as const,     impact: "Meetings · Objections · Summaries" },
  { id: "calendar", name: "Google Calendar", priority: "medium" as const,   impact: "Meeting schedule · Demo tracking" },
];

const PRIORITY_BADGE: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high:     "bg-amber-50 text-amber-700 border-amber-200",
  medium:   "bg-blue-50 text-blue-700 border-blue-200",
};

const ERROR_CODE_HELP: Record<string, { label: string; action: string; color: string }> = {
  auth_required:          { label: "Auth Required",          action: "Log out and log back in at /admin/login",                                           color: "text-gray-700" },
  missing_env_var:        { label: "Missing Env Var",        action: "Check Vercel → Settings → Environment Variables",                                   color: "text-amber-700" },
  missing_table:          { label: "Missing Table",          action: "Run migration 20260601000000_phase9_raw_sources.sql in Supabase SQL Editor",         color: "text-orange-700" },
  rls_permission_denied:  { label: "RLS Blocked",            action: "Disable RLS on raw_ tables or add policy allowing service_role to insert",          color: "text-red-700" },
  invalid_api_key:        { label: "Invalid API Key",        action: "API key rejected — check the value in Vercel env vars matches the real key",        color: "text-red-700" },
  insufficient_api_scope: { label: "Insufficient Scope",     action: "API key lacks required permissions — check scopes in HubSpot/Stripe/Instantly dashboard", color: "text-orange-700" },
  upstream_api_error:     { label: "API Error",              action: "The external API returned an error — check API key and account status",             color: "text-red-700" },
  supabase_error:         { label: "Supabase Error",         action: "Unexpected Supabase error — check service role key and project status",             color: "text-red-700" },
};

export default function DataDiscoveryPage() {
  const [states, setStates] = useState<Record<string, SourceState>>({});
  const [diagnostics, setDiagnostics] = useState<DiagnosticsResult | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);
  interface HubspotTestResult {
    status?: string;
    error_code?: string;
    message?: string;
    sync_run_id?: string;
    steps?: StepResult[];
  }
  const [hubspotTest, setHubspotTest] = useState<HubspotTestResult | null>(null);
  const [hubspotTestLoading, setHubspotTestLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    SOURCES.forEach(s => {
      if (s.id === "calendar") {
        fetch(`/api/admin/discovery/${s.id}`)
          .then(r => r.json())
          .then((data: Record<string, unknown>) => setStates(prev => ({ ...prev, [s.id]: { status: data.configured ? "idle" : "no_credentials", message: String(data.message ?? ""), last_check: new Date().toISOString() } })))
          .catch(() => {});
      } else {
        fetch(`/api/admin/discovery/${s.id}`)
          .then(r => r.json())
          .then((data: Record<string, unknown>) => {
            const lastRun = data.last_run as Record<string, unknown> | undefined;
            const lastRunDate = lastRun ? new Date(String(lastRun.completed_at ?? lastRun.started_at)).toLocaleDateString() : null;
            setStates(prev => ({ ...prev, [s.id]: {
              status: data.configured ? (lastRun ? "ok" : "idle") : "no_credentials",
              message: lastRunDate ? `Last run: ${lastRunDate}` : data.configured ? "Configured — not yet synced" : "Credentials missing",
              last_check: new Date().toISOString(),
            }}));
          })
          .catch(() => {});
      }
    });
  }, []);

  async function runDiagnostics() {
    setDiagLoading(true);
    try {
      const res = await fetch('/api/admin/diagnostics');
      setDiagnostics(await res.json() as DiagnosticsResult);
    } catch (err) {
      setDiagnostics({ summary: { ready_for_discovery: false, issues: [err instanceof Error ? err.message : 'Request failed'] } });
    } finally { setDiagLoading(false); }
  }

  async function runHubSpotTest() {
    setHubspotTestLoading(true);
    setHubspotTest(null);
    try {
      const res = await fetch('/api/admin/discovery/hubspot-test', { method: 'POST' });
      setHubspotTest(await res.json() as HubspotTestResult);
    } catch (err) {
      setHubspotTest({ status: 'error', error_code: 'upstream_api_error', message: err instanceof Error ? err.message : 'Request failed' });
    } finally { setHubspotTestLoading(false); }
  }

  async function runDiscovery(sourceId: string) {
    if (sourceId === "calendar") return;
    setStates(prev => ({ ...prev, [sourceId]: { ...prev[sourceId], status: "running", errorCode: undefined } }));
    try {
      const res = await fetch(`/api/admin/discovery/${sourceId}`, { method: "POST" });
      const data = await res.json() as Record<string, unknown>;
      const errorCode = data.error_code as ErrorCode | undefined;
      setStates(prev => ({ ...prev, [sourceId]: {
        status: data.status === "ok" ? "ok" : data.status === "no_credentials" ? "no_credentials" : "error",
        message: String(data.message ?? ""),
        errorCode,
        profile: data.profile as Record<string, unknown>,
        records_fetched: Number(data.records_fetched ?? 0),
        last_check: new Date().toISOString(),
      }}));
    } catch (err) {
      setStates(prev => ({ ...prev, [sourceId]: { status: "error", message: err instanceof Error ? err.message : "Request failed", errorCode: "upstream_api_error" } }));
    }
  }

  const activeState = states[activeTab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
        <p className="text-sm font-semibold text-blue-900">API Data Discovery — Read-Only</p>
        <p className="text-xs text-blue-700 mt-1">
          Connect sources in read-only mode. Seed dashboards remain unchanged until you approve restructuring.
        </p>
      </div>

      {/* Debug toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={runDiagnostics}
          disabled={diagLoading}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {diagLoading ? "Running diagnostics…" : "🔍 Run Diagnostics"}
        </button>
        <button
          onClick={runHubSpotTest}
          disabled={hubspotTestLoading}
          className="rounded-lg border border-[#0358F1] bg-blue-50 px-4 py-2 text-xs font-medium text-[#0358F1] hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          {hubspotTestLoading ? "Testing HubSpot…" : "🔗 Test HubSpot (safe, limit 10)"}
        </button>
        <span className="text-xs text-gray-400">Run diagnostics first to identify issues before running full discovery</span>
      </div>

      {/* Diagnostics output */}
      {diagnostics && (
        <div className={`rounded-xl border px-5 py-4 ${diagnostics.summary?.ready_for_discovery ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-semibold ${diagnostics.summary?.ready_for_discovery ? "text-emerald-800" : "text-amber-800"}`}>
              {diagnostics.summary?.ready_for_discovery ? "✓ All checks passed — ready for discovery" : `⚠ ${diagnostics.summary?.issues?.length ?? 0} issue(s) found`}
            </p>
            <button onClick={() => setDiagnostics(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
          </div>

          {diagnostics.summary?.issues && diagnostics.summary.issues.length > 0 && (
            <ul className="space-y-1 mb-3">
              {diagnostics.summary.issues.map((issue, i) => (
                <li key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                  <span className="text-amber-500 flex-shrink-0">→</span> {issue}
                </li>
              ))}
            </ul>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
            {/* Env vars */}
            {diagnostics.env_vars && (
              <div>
                <p className="font-bold text-gray-600 mb-1 uppercase tracking-wide text-[10px]">Env Vars</p>
                {Object.entries(diagnostics.env_vars).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-gray-600 font-mono truncate">{k.replace(/_/g, '_').slice(0,24)}</span>
                    <span className={v === 'configured' ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>{v}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Vercel name resolution */}
            {diagnostics.vercel_name_resolution && (
              <div>
                <p className="font-bold text-gray-600 mb-1 uppercase tracking-wide text-[10px]">Vercel Name Resolution</p>
                {Object.entries(diagnostics.vercel_name_resolution).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-gray-600">{k}</span>
                    <span className={v.includes('resolved') ? 'text-emerald-600' : 'text-red-500'}>{v}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Tables */}
            {diagnostics.table_check && (
              <div>
                <p className="font-bold text-gray-600 mb-1 uppercase tracking-wide text-[10px]">Key Tables</p>
                {Object.entries(diagnostics.table_check).slice(0, 8).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-gray-600 font-mono truncate text-[10px]">{k}</span>
                    <span className={v === 'exists' ? 'text-emerald-600' : 'text-red-500'}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* API ping results */}
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            {([
              { key: 'supabase', label: 'Supabase' },
              { key: 'hubspot_ping', label: 'HubSpot' },
              { key: 'stripe_ping', label: 'Stripe' },
              { key: 'instantly_ping', label: 'Instantly' },
            ] as { key: keyof DiagnosticsResult; label: string }[]).map(({ key, label }) => {
              const ping = diagnostics[key] as Record<string, unknown> | undefined;
              if (!ping) return null;
              const isOk = ping.status === 'ok';
              const isSkipped = ping.status === 'skipped';
              return (
                <div key={key} className={`rounded px-3 py-2 ${isOk ? 'bg-emerald-100 text-emerald-800' : isSkipped ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-800'}`}>
                  <span className="font-bold">{label}: </span>{String(ping.message ?? ping.error_code ?? '')}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HubSpot test output */}
      {hubspotTest && (
        <div className={`rounded-xl border px-5 py-4 ${hubspotTest.status === 'ok' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-semibold ${hubspotTest.status === 'ok' ? 'text-emerald-800' : 'text-red-800'}`}>
              HubSpot Test: {hubspotTest.status === 'ok' ? '✓ Passed' : `✗ Failed — ${String(hubspotTest.error_code ?? '')}`}
            </p>
            <button onClick={() => setHubspotTest(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
          </div>
          {hubspotTest.message !== undefined && <p className="text-xs text-gray-700 mb-3">{String(hubspotTest.message)}</p>}
          {/* Error code help */}
          {hubspotTest.error_code && ERROR_CODE_HELP[hubspotTest.error_code as string] && (
            <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 mb-3">
              <p className={`text-xs font-semibold ${ERROR_CODE_HELP[hubspotTest.error_code as string].color}`}>
                {ERROR_CODE_HELP[hubspotTest.error_code as string].label}
              </p>
              <p className="text-xs text-gray-700 mt-0.5">
                Action: {ERROR_CODE_HELP[hubspotTest.error_code as string].action}
              </p>
            </div>
          )}
          {/* Step-by-step results */}
          {Array.isArray(hubspotTest.steps) && (
            <div className="space-y-1">
              {(hubspotTest.steps as StepResult[]).map(s => (
                <div key={s.step} className="flex items-start gap-2 text-xs">
                  <span className={`flex-shrink-0 font-mono ${s.status === 'ok' ? 'text-emerald-600' : s.status === 'error' ? 'text-red-600' : 'text-gray-400'}`}>
                    {s.status === 'ok' ? '✓' : s.status === 'error' ? '✗' : '·'} {s.step}.
                  </span>
                  <span className="text-gray-600 font-medium">{s.name}</span>
                  <span className={`flex-1 ${s.status === 'error' ? 'text-red-700' : 'text-gray-500'}`}>{s.detail}</span>
                </div>
              ))}
            </div>
          )}
          {hubspotTest.status === 'ok' && (
            <p className="text-xs text-emerald-700 mt-3 font-medium">
              ✓ HubSpot test passed. You can now run full HubSpot discovery from the source grid above.
            </p>
          )}
        </div>
      )}

      {/* Source grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {SOURCES.map(src => {
          const state = states[src.id] ?? { status: "idle" as SyncStatus };
          const isRunning = state.status === "running";
          const errorHelp = state.errorCode ? ERROR_CODE_HELP[state.errorCode] : null;
          return (
            <div
              key={src.id}
              onClick={() => setActiveTab(src.id)}
              className={`rounded-xl border cursor-pointer transition-all ${activeTab === src.id ? "border-[#0358F1] bg-blue-50/40" : "border-gray-200 bg-white hover:border-gray-300"}`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">{src.name}</p>
                  <span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 ${PRIORITY_BADGE[src.priority]}`}>{src.priority}</span>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">{src.impact}</p>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`h-2 w-2 rounded-full ${
                    state.status === "ok" ? "bg-emerald-500" :
                    state.status === "running" ? "bg-blue-500 animate-pulse" :
                    state.status === "no_credentials" ? "bg-gray-300" :
                    state.status === "error" ? "bg-red-500" : "bg-gray-200"
                  }`} />
                  <span className="text-[10px] text-gray-500 truncate">
                    {state.status === "ok" ? `${state.records_fetched ?? 0} records` :
                     state.status === "running" ? "Running…" :
                     state.status === "no_credentials" ? "Not configured" :
                     state.status === "error" ? (state.errorCode ?? "Error") : "Ready"}
                  </span>
                </div>
                {/* Error code badge */}
                {state.status === "error" && errorHelp && (
                  <div className={`text-[10px] font-medium mb-2 ${errorHelp.color}`}>
                    {errorHelp.label}
                  </div>
                )}
                {src.id !== "calendar" && (
                  <button
                    onClick={e => { e.stopPropagation(); runDiscovery(src.id); }}
                    disabled={isRunning || state.status === "no_credentials"}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isRunning ? "Running…" : state.status === "ok" ? "Re-run" : "Run Discovery"}
                  </button>
                )}
                {src.id === "calendar" && (
                  <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-1">OAuth required</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Error guidance panel */}
      {Object.values(states).some(s => s.status === "error") && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-semibold text-red-800 mb-3">Discovery Errors — Diagnosis Guide</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Object.entries(states)
              .filter(([, s]) => s.status === "error")
              .map(([id, s]) => {
                const help = s.errorCode ? ERROR_CODE_HELP[s.errorCode] : null;
                return (
                  <div key={id} className="rounded border border-red-200 bg-white px-3 py-2">
                    <p className="text-xs font-semibold text-gray-800 mb-0.5">{SOURCES.find(src => src.id === id)?.name} — {s.errorCode ?? "error"}</p>
                    <p className="text-xs text-gray-600">{s.message}</p>
                    {help && <p className="text-xs text-amber-700 mt-1 font-medium">→ {help.action}</p>}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Detail panel tabs */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex gap-0 px-5 pt-3 border-b border-gray-100 overflow-x-auto">
          {["overview", ...SOURCES.map(s => s.id)].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px capitalize ${activeTab === tab ? "border-[#0358F1] text-[#0358F1]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {tab === "overview" ? "Overview" : SOURCES.find(s => s.id === tab)?.name ?? tab}
            </button>
          ))}
        </div>
        <div className="p-5">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">Required HubSpot Custom Properties</p>
                <div className="overflow-x-auto">
                  <table className="board-table">
                    <thead><tr>
                      <th className="text-left">Property</th><th className="text-left">Label</th><th className="text-left">Type</th><th className="text-left">Object</th><th className="text-left">Priority</th>
                    </tr></thead>
                    <tbody>
                      {HUBSPOT_REQUIRED_CUSTOM_PROPERTIES.map(p => (
                        <tr key={p.name}>
                          <td className="text-left font-mono text-[11px]">{p.name}</td>
                          <td className="text-left">{p.label}</td>
                          <td className="text-left text-gray-500">{p.type}</td>
                          <td className="text-left text-gray-500">{p.object}</td>
                          <td className="text-left"><span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 ${p.priority === "critical" ? "bg-red-50 text-red-700 border-red-200" : p.priority === "high" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>{p.priority}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">HubSpot Deal Field Mappings</p>
                <div className="overflow-x-auto">
                  <table className="board-table">
                    <thead><tr>
                      <th className="text-left">HubSpot Field</th><th className="text-left">Tap2 Field</th><th className="text-left">Confidence</th><th className="text-left">Notes</th>
                    </tr></thead>
                    <tbody>
                      {HUBSPOT_DEAL_MAPPINGS.map(m => {
                        const cfg = CONFIDENCE_CONFIG[m.confidence as MappingConfidence];
                        return (
                          <tr key={m.source_field}>
                            <td className="text-left font-mono text-[11px]">{m.source_field}</td>
                            <td className="text-left font-mono text-[11px] text-[#0358F1]">{m.tap2_field}</td>
                            <td className="text-left"><span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 ${cfg.color} ${cfg.bg} ${cfg.border}`}>{cfg.label}</span></td>
                            <td className="text-left text-[11px] text-gray-400">{m.notes ?? "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {activeTab !== "overview" && (
            <div className="space-y-4">
              {activeState?.status === "error" && activeState.errorCode && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-xs font-semibold text-red-800">{ERROR_CODE_HELP[activeState.errorCode]?.label ?? activeState.errorCode}</p>
                  <p className="text-xs text-red-700 mt-0.5">{activeState.message}</p>
                  <p className="text-xs text-amber-700 mt-1 font-medium">→ {ERROR_CODE_HELP[activeState.errorCode]?.action}</p>
                </div>
              )}
              {activeState?.profile && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2">Discovery Profile</p>
                  <pre className="text-[11px] font-mono bg-gray-900 text-green-400 rounded-xl p-4 overflow-x-auto max-h-96 leading-relaxed">
                    {JSON.stringify(activeState.profile, null, 2)}
                  </pre>
                </div>
              )}
              {!activeState?.profile && activeState?.status !== "error" && (
                <p className="text-sm text-gray-400">Run discovery to see profile data.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
