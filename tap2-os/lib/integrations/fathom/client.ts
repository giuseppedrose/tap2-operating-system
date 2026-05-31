import { ENV } from '@/lib/config/env';
// Server-side only
export const FATHOM_BASE_URL = 'https://api.fathom.video/v1';
export const isFathomConfigured = () => Boolean(ENV.FATHOM_API_KEY);

export async function fathomFetch(path: string, options?: RequestInit): Promise<Record<string, unknown>> {
  const key = ENV.FATHOM_API_KEY;
  if (!key) throw new Error('Fathom not configured');
  const res = await fetch(`${FATHOM_BASE_URL}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`Fathom API error: ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}
