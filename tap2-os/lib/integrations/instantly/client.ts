import { ENV } from '@/lib/config/env';
// Server-side only — uses Authorization header (never URL query param)
export const INSTANTLY_BASE_URL = 'https://api.instantly.ai/api/v1';
export const isInstantlyConfigured = () => Boolean(ENV.INSTANTLY_API_KEY);

export async function instantlyFetch(path: string, options?: RequestInit): Promise<Record<string, unknown>> {
  const key = ENV.INSTANTLY_API_KEY;
  if (!key) throw new Error('Instantly not configured');
  const res = await fetch(`${INSTANTLY_BASE_URL}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`Instantly API error: ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}
