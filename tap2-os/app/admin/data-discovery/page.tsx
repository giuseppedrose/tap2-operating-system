"use client";

import { useState, useEffect } from "react";
import { HUBSPOT_REQUIRED_CUSTOM_PROPERTIES, HUBSPOT_DEAL_MAPPINGS } from "@/lib/integrations/mapping/hubspot-mapper";
import { CONFIDENCE_CONFIG } from "@/lib/integrations/mapping/mapping-confidence";
import type { MappingConfidence } from "@/lib/integrations/mapping/types";

const SOURCES = [
  { id: "stripe",   name: "Stripe",         priority: "critical", impact: "MRR · ARR · Churn · Customers" },
  { id: "hubspot",  name: "HubSpot",         priority: "critical", impact: "Pipeline · Deals · CRM · Partners" },
  { id: "instantly", name: "Instantly AI",   priority: "high",     impact: "Campaigns · Attribution · Outbound" },
  { id: "fathom",   name: "Fathom",          priority: "high",     impact: "Meetings · Objections · Summaries" },
  { id: "calendar", name: "Google Calendar", priority: "medium",   impact: "Meeting schedule · Demo tracking" },
];

type SyncStatus = "idle" | "running" | "ok" | "error" | "no_credentials";

interface DiscoveryState {
  status: SyncStatus;
  message?: string;
  profile?: Record<string, unknown>;
  records_fetched?: number;
  sync_run_id?: string;
  last_check?: string;
}

const PRIORITY_BADGE = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high:     "bg-amber-50 text-amber-700 border-amber-200",
  medium:   "bg-blue-50 text-blue-700 border-blue-200",
};

export default function DataDiscoveryPage() {
  const [states, setStates] = useState<Record<string, DiscoveryState>>({});
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Check current status of each source
  useEffect(() => {
    SOURCES.forEach(s => {
      if (s.id === "calendar") {
        fetch(`/api/admin/discovery/${s.id}`)
          .then(r => r.json())
          .then(data => {
            setStates(prev => ({
              ...prev,
              [s.id]: {
                status: data.configured ? "idle" : "no_credentials",
                message: data.message,
                last_check: new Date().toISOString(),
                profile: data,
              }
            }));
          })
          .catch(() => {});
      } else {
        fetch(`/api/admin/discovery/${s.id}`)
          .then(r => r.json())
          .then(data => {
            setStates(prev => ({
              ...prev,
              [s.id]: {
                status: data.configured ? (data.last_run ? "ok" : "idle") : "no_credentials",
                message: data.last_run ? `Last run: ${new Date(data.last_run.completed_at ?? data.last_run.started_at).toLocaleDateString()}` : data.configured ? "Configured — not yet synced" : "Credentials missing",
                last_check: new Date().toISOString(),
                profile: data.last_run?.meta,
              }
            }));
          })
          .catch(() => {});
      }
    });
  }, []);

  async function runDiscovery(sourceId: string) {
    if (sourceId === "calendar") return; // Calendar requires OAuth, handle separately
    setStates(prev => ({ ...prev, [sourceId]: { ...prev[sourceId], status: "running" } }));
    try {
      const res = await fetch(`/api/admin/discovery/${sourceId}`, { method: "POST" });
      const data = await res.json() as Record<string, unknown>;
      setStates(prev => ({
        ...prev,
        [sourceId]: {
          status: data.status === "ok" ? "ok" : data.status === "no_credentials" ? "no_credentials" : "error",
          message: String(data.message ?? ""),
          profile: data.profile as Record<string, unknown>,
          records_fetched: Number(data.records_fetched ?? 0),
          sync_run_id: String(data.sync_run_id ?? ""),
          last_check: new Date().toISOString(),
        }
      }));
    } catch (err) {
      setStates(prev => ({ ...prev, [sourceId]: { status: "error", message: err instanceof Error ? err.message : "Request failed" } }));
    }
  }

  const activeSource = SOURCES.find(s => s.id === activeTab);
  const activeState = states[activeTab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
        <p className="text-sm font-semibold text-blue-900">API Data Discovery — Read-Only Profiling</p>
        <p className="text-xs text-blue-700 mt-1">
          Connect sources in read-only mode to profile available fields, record counts, and mapping quality.
          Seed dashboards remain unchanged until you explicitly approve restructuring.
        </p>
      </div>

      {/* Source grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {SOURCES.map(src => {
          const state = states[src.id] ?? { status: "idle" };
          const isRunning = state.status === "running";
          return (
            <div
              key={src.id}
              onClick={() => setActiveTab(src.id)}
              className={`rounded-xl border cursor-pointer transition-all ${activeTab === src.id ? "border-[#0358F1] bg-blue-50/40" : "border-gray-200 bg-white hover:border-gray-300"}`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">{src.name}</p>
                  <span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 ${PRIORITY_BADGE[src.priority as keyof typeof PRIORITY_BADGE]}`}>
                    {src.priority}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">{src.impact}</p>
                {/* Status indicator */}
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${
                    state.status === "ok" ? "bg-emerald-500" :
                    state.status === "running" ? "bg-blue-500 animate-pulse" :
                    state.status === "no_credentials" ? "bg-gray-300" :
                    state.status === "error" ? "bg-red-500" :
                    "bg-gray-200"
                  }`} />
                  <span className="text-[10px] text-gray-500 truncate">
                    {state.status === "ok" ? `${state.records_fetched ?? 0} records` :
                     state.status === "running" ? "Running…" :
                     state.status === "no_credentials" ? "Not configured" :
                     state.status === "error" ? "Error" : "Ready"}
                  </span>
                </div>
                {/* Run button */}
                {src.id !== "calendar" && (
                  <button
                    onClick={e => { e.stopPropagation(); runDiscovery(src.id); }}
                    disabled={isRunning || state.status === "no_credentials"}
                    className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isRunning ? "Running…" : state.status === "ok" ? "Re-run Discovery" : "Run Discovery"}
                  </button>
                )}
                {src.id === "calendar" && (
                  <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-2 py-1.5 text-[10px] text-amber-700">
                    Requires OAuth setup first
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex gap-0 px-5 pt-3 border-b border-gray-100 overflow-x-auto">
          {["overview", ...SOURCES.map(s => s.id)].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px capitalize ${
                activeTab === tab ? "border-[#0358F1] text-[#0358F1]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "overview" ? "Overview" : SOURCES.find(s => s.id === tab)?.name ?? tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">Discovery Status Summary</p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {SOURCES.map(src => {
                    const state = states[src.id] ?? { status: "idle" };
                    return (
                      <div key={src.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-center">
                        <p className="text-xs font-semibold text-gray-700">{src.name}</p>
                        <p className={`text-[11px] mt-1 font-medium ${
                          state.status === "ok" ? "text-emerald-600" :
                          state.status === "no_credentials" ? "text-gray-400" :
                          state.status === "error" ? "text-red-500" : "text-gray-400"
                        }`}>
                          {state.status === "ok" ? "✓ Discovered" :
                           state.status === "no_credentials" ? "Not configured" :
                           state.status === "error" ? "Error" : "Pending"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">HubSpot Custom Properties Required</p>
                <div className="overflow-x-auto">
                  <table className="board-table">
                    <thead>
                      <tr>
                        <th className="text-left">Property Name</th>
                        <th className="text-left">Label</th>
                        <th className="text-left">Type</th>
                        <th className="text-left">Object</th>
                        <th className="text-left">Priority</th>
                        <th className="text-left">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {HUBSPOT_REQUIRED_CUSTOM_PROPERTIES.map(p => (
                        <tr key={p.name}>
                          <td className="text-left font-mono text-[11px]">{p.name}</td>
                          <td className="text-left">{p.label}</td>
                          <td className="text-left text-gray-500">{p.type}</td>
                          <td className="text-left text-gray-500">{p.object}</td>
                          <td className="text-left">
                            <span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 ${
                              p.priority === "critical" ? "bg-red-50 text-red-700 border-red-200" :
                              p.priority === "high" ? "bg-amber-50 text-amber-700 border-amber-200" :
                              "bg-gray-50 text-gray-600 border-gray-200"
                            }`}>{p.priority}</span>
                          </td>
                          <td className="text-left text-[11px] text-gray-400">{p.note ?? "—"}</td>
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
                    <thead>
                      <tr>
                        <th className="text-left">HubSpot Field</th>
                        <th className="text-left">Tap2 Field</th>
                        <th className="text-left">Confidence</th>
                        <th className="text-left">Action</th>
                        <th className="text-left">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {HUBSPOT_DEAL_MAPPINGS.map(m => {
                        const cfg = CONFIDENCE_CONFIG[m.confidence as MappingConfidence];
                        return (
                          <tr key={m.source_field}>
                            <td className="text-left font-mono text-[11px]">{m.source_field}</td>
                            <td className="text-left font-mono text-[11px] text-[#0358F1]">{m.tap2_field}</td>
                            <td className="text-left">
                              <span className={`text-[10px] font-semibold border rounded px-1.5 py-0.5 ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                                {cfg.label}
                              </span>
                            </td>
                            <td className="text-left text-[11px] text-gray-500">{m.action ?? "—"}</td>
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

          {activeTab !== "overview" && activeSource && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{activeSource.name} Discovery Results</p>
                  <p className="text-xs text-gray-400 mt-0.5">{activeSource.impact}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${
                    activeState?.status === "ok" ? "bg-emerald-500" :
                    activeState?.status === "running" ? "bg-blue-500 animate-pulse" :
                    activeState?.status === "no_credentials" ? "bg-gray-300" :
                    "bg-red-400"
                  }`} />
                  <span className="text-xs text-gray-600 capitalize">{activeState?.status ?? "idle"}</span>
                </div>
              </div>

              {activeState?.message && (
                <div className={`rounded-lg border px-4 py-3 ${
                  activeState.status === "no_credentials" ? "border-amber-200 bg-amber-50" :
                  activeState.status === "error" ? "border-red-200 bg-red-50" :
                  activeState.status === "ok" ? "border-emerald-200 bg-emerald-50" :
                  "border-blue-200 bg-blue-50"
                }`}>
                  <p className="text-sm text-gray-800">{activeState.message}</p>
                  {activeState.status === "no_credentials" && (
                    <p className="text-xs text-amber-700 mt-1">
                      Add the API key to Vercel → Settings → Environment Variables, then redeploy.
                    </p>
                  )}
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

              {activeState?.status === "no_credentials" && activeTab === "calendar" && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">OAuth Setup Steps</p>
                  {Boolean((activeState.profile as Record<string, unknown>)?.setup_steps) &&
                    ((activeState.profile as Record<string, unknown>).setup_steps as string[]).map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className="h-4 w-4 rounded-full bg-gray-200 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                        {step}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
