import { createClient } from '@supabase/supabase-js';

// Server-side only — uses service role key for admin writes
// Never expose SUPABASE_SERVICE_ROLE_KEY client-side
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase admin credentials not configured');
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function createSyncRun(source: string, runType = 'discovery') {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from('source_sync_runs')
    .insert({ source, run_type: runType, status: 'running' })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function completeSyncRun(
  runId: string,
  status: 'completed' | 'error' | 'partial',
  counts: { fetched: number; written: number; failed?: number },
  meta: Record<string, unknown> = {},
  errorMessage?: string
) {
  const sb = getSupabaseAdmin();
  await sb.from('source_sync_runs').update({
    status,
    completed_at: new Date().toISOString(),
    records_fetched: counts.fetched,
    records_written: counts.written,
    records_failed: counts.failed ?? 0,
    meta,
    error_message: errorMessage ?? null,
  }).eq('id', runId);
}

export async function upsertRawRecord(
  table: string,
  externalId: string,
  payload: Record<string, unknown>,
  syncRunId: string,
  extra: Record<string, unknown> = {}
) {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from(table).upsert(
    {
      external_id: externalId,
      raw_payload: payload,
      fetched_at: new Date().toISOString(),
      sync_run_id: syncRunId,
      ...extra,
    },
    { onConflict: 'external_id' }
  );
  if (error) throw error;
}
