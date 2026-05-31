import { NextRequest, NextResponse } from 'next/server';
import { ENV, getEnvStatus } from '@/lib/config/env';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function checkAuth(req: NextRequest) {
  const s = req.cookies.get('tap2_admin_session');
  return Boolean(s?.value && s.value.length >= 32);
}

const KEY_TABLES = [
  'source_sync_runs', 'source_data_profiles', 'source_field_mappings',
  'raw_hubspot_companies', 'raw_hubspot_contacts', 'raw_hubspot_deals',
  'raw_hubspot_owners', 'raw_hubspot_properties',
  'raw_stripe_customers', 'raw_stripe_subscriptions', 'raw_stripe_invoices',
  'raw_instantly_campaigns', 'raw_instantly_campaign_analytics', 'raw_instantly_leads',
  'raw_fathom_meetings',
];

// Which Vercel custom names map to which standard key
const VERCEL_NAME_MAP: Record<string, string[]> = {
  STRIPE_SECRET_KEY:          ['SS', 'STRIPE_SECRET_KEY'],
  HUBSPOT_ACCESS_TOKEN:       ['Hubspot', 'HUBSPOT_ACCESS_TOKEN'],
  INSTANTLY_API_KEY:          ['instantl', 'instantly', 'INSTANTLY_API_KEY'],
  FATHOM_API_KEY:             ['Fathom', 'FATHOM_API_KEY'],
  SUPABASE_SERVICE_ROLE_KEY:  ['SUPABASE_SERVICE_ROLE_KEY'],
  ADMIN_USERNAME:             ['ADMIN_USERNAME'],
  ADMIN_PASSWORD:             ['ADMIN_PASSWORD'],
};

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error_code: 'auth_required', message: 'Log in at /admin/login first.' }, { status: 401 });
  }

  const issues: string[] = [];

  // ── Env var status ──────────────────────────────────────────────────────
  const envStatus = getEnvStatus();

  // Which Vercel name each key resolved from
  const vercelNameResolution: Record<string, string> = {};
  for (const [stdKey, candidates] of Object.entries(VERCEL_NAME_MAP)) {
    const resolved = candidates.find(name => Boolean(process.env[name]));
    vercelNameResolution[stdKey] = resolved ? `resolved from ${resolved}` : 'NOT FOUND';
    if (!resolved && ['STRIPE_SECRET_KEY', 'HUBSPOT_ACCESS_TOKEN', 'SUPABASE_SERVICE_ROLE_KEY', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'].includes(stdKey)) {
      issues.push(`${stdKey} missing — tried: ${candidates.join(', ')}`);
    }
  }

  // ── Supabase connectivity ────────────────────────────────────────────────
  let supabaseResult: Record<string, unknown> = { status: 'skipped', message: 'Service role key not configured' };
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbKey = ENV.SUPABASE_SERVICE_ROLE_KEY;

  if (sbUrl && sbKey) {
    try {
      const sb = createClient(sbUrl, sbKey, { auth: { persistSession: false, autoRefreshToken: false } });
      const { error } = await sb.from('source_sync_runs').select('id').limit(0);
      if (error) {
        const code = error.code === '42P01' ? 'missing_table' : error.code === '42501' ? 'rls_permission_denied' : 'supabase_error';
        supabaseResult = { status: 'error', error_code: code, message: error.message };
        issues.push(`Supabase ${code}: ${error.message}`);
      } else {
        supabaseResult = { status: 'ok', message: 'Connected — service role key valid' };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      supabaseResult = { status: 'error', error_code: 'supabase_error', message: msg };
      issues.push(`Supabase connection failed: ${msg}`);
    }
  } else {
    if (!sbUrl) issues.push('NEXT_PUBLIC_SUPABASE_URL missing');
    if (!sbKey) issues.push('SUPABASE_SERVICE_ROLE_KEY missing');
  }

  // ── Table existence check ────────────────────────────────────────────────
  const tableCheck: Record<string, string> = {};
  const missingTables: string[] = [];
  if (sbUrl && sbKey && supabaseResult.status === 'ok') {
    const sb = createClient(sbUrl, sbKey, { auth: { persistSession: false, autoRefreshToken: false } });
    await Promise.all(KEY_TABLES.map(async (t) => {
      const { error } = await sb.from(t).select('id').limit(0);
      if (error?.code === '42P01') {
        tableCheck[t] = 'missing';
        missingTables.push(t);
      } else if (error) {
        tableCheck[t] = `error: ${error.code}`;
      } else {
        tableCheck[t] = 'exists';
      }
    }));
    if (missingTables.length > 0) {
      issues.push(`${missingTables.length} table(s) missing — run Phase 9 migration in Supabase SQL Editor: ${missingTables.slice(0, 3).join(', ')}${missingTables.length > 3 ? '…' : ''}`);
    }
  }

  // ── HubSpot API ping ─────────────────────────────────────────────────────
  let hubspotPing: Record<string, unknown> = { status: 'skipped', message: 'HubSpot token not configured' };
  const hsToken = ENV.HUBSPOT_ACCESS_TOKEN;
  if (hsToken) {
    try {
      const res = await fetch('https://api.hubapi.com/crm/v3/owners?limit=1', {
        headers: { Authorization: `Bearer ${hsToken}` },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        hubspotPing = { status: 'ok', message: 'HubSpot API reachable — token valid' };
      } else {
        const code = res.status === 401 ? 'invalid_api_key' : res.status === 403 ? 'insufficient_api_scope' : 'upstream_api_error';
        hubspotPing = { status: 'error', error_code: code, http_status: res.status, message: `HubSpot returned ${res.status}` };
        issues.push(`HubSpot ${code}: HTTP ${res.status}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      hubspotPing = { status: 'error', error_code: 'upstream_api_error', message: `Network error: ${msg}` };
      issues.push(`HubSpot ping failed: ${msg}`);
    }
  }

  // ── Stripe API ping ──────────────────────────────────────────────────────
  let stripePing: Record<string, unknown> = { status: 'skipped', message: 'Stripe key not configured' };
  const stripeKey = ENV.STRIPE_SECRET_KEY;
  if (stripeKey) {
    try {
      const res = await fetch('https://api.stripe.com/v1/customers?limit=1', {
        headers: { Authorization: `Bearer ${stripeKey}`, 'Stripe-Version': '2023-10-16' },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        stripePing = { status: 'ok', message: 'Stripe API reachable — key valid' };
      } else {
        const errText = await res.text().catch(() => '');
        let errMsg = `Stripe returned ${res.status}`;
        try { const j = JSON.parse(errText) as Record<string, unknown>; const e = j.error as Record<string, unknown>; if (e?.message) errMsg = `Stripe ${res.status}: ${String(e.message)}`; } catch {}
        const code = res.status === 401 ? 'invalid_api_key' : res.status === 403 ? 'insufficient_api_scope' : 'upstream_api_error';
        stripePing = { status: 'error', error_code: code, message: errMsg };
        issues.push(`Stripe ${code}: ${errMsg}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      stripePing = { status: 'error', error_code: 'upstream_api_error', message: `Network error: ${msg}` };
      issues.push(`Stripe ping failed: ${msg}`);
    }
  }

  // ── Instantly API ping ───────────────────────────────────────────────────
  let instantlyPing: Record<string, unknown> = { status: 'skipped', message: 'Instantly key not configured' };
  const instantlyKey = ENV.INSTANTLY_API_KEY;
  if (instantlyKey) {
    try {
      // v1 uses api_key query param; v2 uses Bearer
      const v1Url = `https://api.instantly.ai/api/v1/campaign/list?api_key=${encodeURIComponent(instantlyKey)}&limit=1&skip=0`;
      const res = await fetch(v1Url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        instantlyPing = { status: 'ok', message: 'Instantly v1 API reachable — key valid' };
      } else if (res.status === 401 || res.status === 403) {
        // Try v2 Bearer
        const res2 = await fetch('https://api.instantly.ai/api/v2/campaigns?limit=1', {
          headers: { Authorization: `Bearer ${instantlyKey}` },
          signal: AbortSignal.timeout(8000),
        });
        if (res2.ok) {
          instantlyPing = { status: 'ok', message: 'Instantly v2 API reachable — key valid' };
        } else {
          instantlyPing = { status: 'error', error_code: 'invalid_api_key', message: `Instantly v1=${res.status} v2=${res2.status} — check API key in Vercel (instantl var)` };
          issues.push(`Instantly invalid_api_key: v1=${res.status} v2=${res2.status}`);
        }
      } else {
        instantlyPing = { status: 'error', error_code: 'upstream_api_error', message: `Instantly returned ${res.status}` };
        issues.push(`Instantly upstream_api_error: HTTP ${res.status}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown';
      instantlyPing = { status: 'error', error_code: 'upstream_api_error', message: `Network error: ${msg}` };
      issues.push(`Instantly ping failed: ${msg}`);
    }
  }

  // ── Admin auth check ─────────────────────────────────────────────────────
  const authCheck = {
    session_cookie: 'valid',
    admin_username_configured: Boolean(ENV.ADMIN_USERNAME),
    admin_password_configured: Boolean(ENV.ADMIN_PASSWORD),
  };
  if (!ENV.ADMIN_USERNAME || !ENV.ADMIN_PASSWORD) {
    issues.push('ADMIN_USERNAME or ADMIN_PASSWORD missing — admin login will fail');
  }

  return NextResponse.json({
    summary: {
      ready_for_discovery: issues.length === 0,
      issues,
    },
    env_vars: envStatus,
    vercel_name_resolution: vercelNameResolution,
    supabase: supabaseResult,
    table_check: tableCheck,
    missing_tables: missingTables,
    hubspot_ping: hubspotPing,
    stripe_ping: stripePing,
    instantly_ping: instantlyPing,
    auth: authCheck,
  });
}
