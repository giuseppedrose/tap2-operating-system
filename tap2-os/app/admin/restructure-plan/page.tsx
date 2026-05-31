import { HUBSPOT_REQUIRED_CUSTOM_PROPERTIES } from "@/lib/integrations/mapping/hubspot-mapper";

interface PagePlan {
  route: string;
  title: string;
  primarySource: string;
  readyToGoLive: boolean;
  blockers: string[];
  stripeFields?: string[];
  hubspotFields?: string[];
  missingFields?: string[];
  recommendation: string;
}

const PAGE_PLANS: PagePlan[] = [
  {
    route: "/revenue",
    title: "Revenue Intelligence",
    primarySource: "Stripe",
    readyToGoLive: false,
    blockers: ["STRIPE_SECRET_KEY not configured", "No customers or subscriptions synced yet"],
    stripeFields: ["subscriptions[].items[0].price.unit_amount → MRR", "subscriptions[].status → active/churned/trial", "subscriptions[].customer → customer ID", "customers[].email → customer email", "customers[].metadata → custom fields (market, partner)", "invoices[].amount_paid → revenue collected", "invoices[].created → payment timing"],
    missingFields: ["Market/country not in Stripe by default — add to customer metadata", "Partner owner not in Stripe — comes from HubSpot association", "Segment not in Stripe — comes from HubSpot company properties"],
    recommendation: "Connect Stripe first. Add metadata fields to Stripe customer objects: market, partner_owner, hubspot_company_id. This enables revenue-to-CRM reconciliation.",
  },
  {
    route: "/pipeline",
    title: "Pipeline Decisions",
    primarySource: "HubSpot",
    readyToGoLive: false,
    blockers: ["HUBSPOT_ACCESS_TOKEN not configured", "No deals synced yet", "9 custom properties need to be created in HubSpot"],
    hubspotFields: ["deals.dealname → deal_name", "deals.dealstage → deal_stage (stage IDs need mapping)", "deals.amount → pipeline_value", "deals.hubspot_owner_id → owner (resolve via owners endpoint)", "deals.closedate → close_date", "deals.pipeline → pipeline_id", "deals.hs_probability → probability", "deals.hs_lastmodifieddate → last_activity_date"],
    missingFields: HUBSPOT_REQUIRED_CUSTOM_PROPERTIES.filter(p => p.object === "deals").map(p => `${p.name} (${p.label}) — must be created in HubSpot`),
    recommendation: "Create all custom HubSpot properties listed in the data-discovery tab before connecting. Without them, deal quality scoring, partner attribution, and use-case segmentation will not work.",
  },
  {
    route: "/gtm",
    title: "GTM Efficiency",
    primarySource: "HubSpot + Instantly",
    readyToGoLive: false,
    blockers: ["HubSpot source attribution requires hs_analytics_source to be populated", "Instantly campaign IDs need to be stored in HubSpot deal property tap2_campaign_id", "Attribution chain requires Instantly + HubSpot to be connected simultaneously"],
    hubspotFields: ["deals.hs_analytics_source → source (auto-tracked UTM)", "deals.tap2_campaign_id → campaign attribution (custom)", "companies.country → market", "deals.tap2_market → market override (custom)"],
    recommendation: "Standardise Instantly campaign naming to MARKET-SEGMENT-PERIOD format. Store Instantly campaign ID in HubSpot deal tap2_campaign_id custom property at the point of first reply.",
  },
  {
    route: "/campaigns",
    title: "Outbound Attribution",
    primarySource: "Instantly",
    readyToGoLive: false,
    blockers: ["INSTANTLY_API_KEY not configured", "Campaign naming does not yet follow recommended convention", "HubSpot attribution link (tap2_campaign_id) not yet implemented"],
    recommendation: "Rename Instantly campaigns to MARKET-SEGMENT-PERIOD format. Implement a webhook or daily sync that writes the Instantly campaign ID into HubSpot deals when a reply is received.",
  },
  {
    route: "/partners",
    title: "Partner Performance",
    primarySource: "HubSpot",
    readyToGoLive: false,
    blockers: ["HubSpot hubspot_owner_id maps to Tap2 owner — but tap2_partner_owner custom property is needed for reseller/agent partners", "No activity/call data synced yet"],
    hubspotFields: ["owners.firstName + lastName → partner name", "deals.hubspot_owner_id → deal owner (= partner in Tap2 model)", "deals.tap2_partner_owner → reseller/agency partner override (custom)"],
    recommendation: "Use HubSpot owner as the primary partner attribution. Create tap2_partner_owner custom property for cases where the deal owner ≠ the referral partner.",
  },
  {
    route: "/lifecycle",
    title: "Conversion Analysis",
    primarySource: "HubSpot + Stripe",
    readyToGoLive: false,
    blockers: ["Requires both HubSpot (deal stages) and Stripe (subscription status) to be connected", "customer_lifecycle_events table needs to be populated from both sources"],
    recommendation: "After connecting HubSpot and Stripe, build a lifecycle sync that writes stage transitions to customer_lifecycle_events. This enables end-to-end funnel analytics.",
  },
  {
    route: "/meetings",
    title: "Meeting Intelligence",
    primarySource: "Fathom + Google Calendar",
    readyToGoLive: false,
    blockers: ["FATHOM_API_KEY not configured", "Google Calendar requires OAuth flow (separate from API key)", "HubSpot meeting-to-deal matching not yet implemented"],
    recommendation: "Connect Fathom first (simpler auth). Match Fathom meetings to HubSpot deals by attendee email → HubSpot contact → associated deal. Build email domain matching fallback.",
  },
  {
    route: "/cash",
    title: "Cash & Runway",
    primarySource: "Rabobank CSV (manual)",
    readyToGoLive: false,
    blockers: ["No Rabobank API — CSV upload is the only path", "CSV upload workflow not yet implemented in admin", "Transaction categorisation model needs to be built"],
    recommendation: "Build CSV upload endpoint at /api/admin/rabobank-import. Parse MT940 or CSV format, write to bank_transactions table, auto-categorise using description pattern matching, flag unknowns for manual review.",
  },
  {
    route: "/forecast",
    title: "Growth Forecast",
    primarySource: "Stripe + HubSpot (derived)",
    readyToGoLive: false,
    blockers: ["Starting MRR must come from live Stripe subscription data", "Pipeline conversion rates will be more accurate from HubSpot won/lost history"],
    recommendation: "After Stripe is connected, replace the hardcoded €1,400 MRR baseline with live REVENUE.currentMRR from Stripe subscriptions. HubSpot win rate history improves scenario accuracy.",
  },
  {
    route: "/product",
    title: "Product Metrics",
    primarySource: "Custom product analytics (not yet defined)",
    readyToGoLive: false,
    blockers: ["No product analytics API defined yet", "Tap2 wallet/NFC scan data source needs to be identified", "May require custom API endpoint from Tap2 product backend"],
    recommendation: "Define the product backend's data export mechanism. Options: webhook events, daily database export, custom API endpoint. Build product_usage_snapshots sync once source is defined.",
  },
];

export default function RestructurePlanPage() {
  const ready = PAGE_PLANS.filter(p => p.readyToGoLive).length;
  const blocked = PAGE_PLANS.filter(p => !p.readyToGoLive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
        <p className="text-sm font-semibold text-gray-900">Dashboard Restructuring Plan</p>
        <p className="text-xs text-gray-500 mt-1">
          Based on API discovery analysis, this page maps what real data each dashboard needs and what must be done before going live.
          Seed dashboards remain active until each page is explicitly restructured.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">{ready}</p>
          <p className="text-xs text-emerald-600 mt-1">Ready to go live</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-amber-700">{blocked}</p>
          <p className="text-xs text-amber-600 mt-1">Blocked — needs config</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-gray-700">{PAGE_PLANS.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total pages tracked</p>
        </div>
      </div>

      {/* Priority integration sequence */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">Recommended Integration Sequence</p>
        <div className="space-y-2">
          {[
            { step: 1, source: "Stripe",         action: "Connect STRIPE_SECRET_KEY → unlocks /revenue (MRR, ARR, churn), /cash (revenue line), /forecast (live baseline)", priority: "critical" },
            { step: 2, source: "HubSpot",         action: "Create custom properties → connect HUBSPOT_ACCESS_TOKEN → unlocks /pipeline, /partners, /gtm, /lifecycle", priority: "critical" },
            { step: 3, source: "Instantly AI",    action: "Connect INSTANTLY_API_KEY + standardise campaign naming → unlocks /campaigns attribution", priority: "high" },
            { step: 4, source: "Rabobank CSV",    action: "Build CSV upload endpoint → upload monthly exports → unlocks /cash (real burn, runway)", priority: "high" },
            { step: 5, source: "Fathom",          action: "Connect FATHOM_API_KEY → build meeting-deal matching → unlocks /meetings objection intelligence", priority: "medium" },
            { step: 6, source: "Google Calendar", action: "Implement OAuth flow → connect calendar → supplements Fathom with meeting metadata", priority: "medium" },
            { step: 7, source: "Product Backend", action: "Define product analytics source → build wallet/scan sync → unlocks /product metrics", priority: "future" },
          ].map(step => (
            <div key={step.step} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                step.priority === "critical" ? "bg-red-100 text-red-700" :
                step.priority === "high" ? "bg-amber-100 text-amber-700" :
                step.priority === "future" ? "bg-gray-100 text-gray-400" :
                "bg-blue-100 text-blue-700"
              }`}>{step.step}</div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-gray-800">{step.source}: </span>
                <span className="text-xs text-gray-600">{step.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-page plans */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Per-Page Restructuring Plan</p>
        {PAGE_PLANS.map(plan => (
          <div key={plan.route} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <code className="text-xs font-mono text-[#0358F1] bg-blue-50 px-2 py-0.5 rounded">{plan.route}</code>
                <p className="text-sm font-semibold text-gray-900">{plan.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{plan.primarySource}</span>
                <span className={`text-[10px] font-semibold border rounded px-2 py-0.5 ${plan.readyToGoLive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                  {plan.readyToGoLive ? "Ready" : "Seed"}
                </span>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              {/* Recommendation */}
              <p className="text-xs text-gray-700 italic border-l-2 border-[#0358F1] pl-3">{plan.recommendation}</p>

              {/* Blockers */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Blockers</p>
                <div className="space-y-1">
                  {plan.blockers.map((b, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-red-600">
                      <span className="text-red-400 flex-shrink-0">✗</span>
                      {b}
                    </div>
                  ))}
                </div>
              </div>

              {/* Available fields */}
              {(plan.stripeFields ?? plan.hubspotFields) && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Available Real Fields</p>
                  <div className="flex flex-wrap gap-1">
                    {[...(plan.stripeFields ?? []), ...(plan.hubspotFields ?? [])].map((f, i) => (
                      <span key={i} className="text-[10px] font-mono bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 text-gray-600">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing fields */}
              {plan.missingFields?.length ? (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Missing / To Create</p>
                  <div className="space-y-0.5">
                    {plan.missingFields.map((f, i) => (
                      <p key={i} className="text-[11px] text-amber-600">→ {f}</p>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
