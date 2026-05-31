import { fathomFetch, isFathomConfigured } from './client';

export async function syncRecordings(limit = 50): Promise<unknown[]> {
  if (!isFathomConfigured()) return [];
  const data = await fathomFetch(`/calls?limit=${limit}`);
  return (data.calls ?? data.recordings ?? data.items ?? []) as unknown[];
}

export async function getRecordingSummary(recordingId: string): Promise<string | null> {
  if (!isFathomConfigured()) return null;
  try {
    const data = await fathomFetch(`/calls/${recordingId}/summary`);
    return (data.summary as string | undefined) ?? null;
  } catch { return null; }
}
