import { ENV } from '@/lib/config/env';
// Server-side only
export const HUBSPOT_BASE_URL = 'https://api.hubapi.com';
export const isHubSpotConfigured = () => Boolean(ENV.HUBSPOT_ACCESS_TOKEN);

export async function hsFetch(path: string, options?: RequestInit): Promise<Record<string, unknown>> {
  const token = ENV.HUBSPOT_ACCESS_TOKEN;
  if (!token) throw new Error('HubSpot not configured');
  const res = await fetch(`${HUBSPOT_BASE_URL}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`HubSpot API error: ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

export async function hsPost(path: string, body: unknown): Promise<Record<string, unknown>> {
  return hsFetch(path, { method: 'POST', body: JSON.stringify(body) });
}
