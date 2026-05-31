import { ENV } from '@/lib/config/env';
// Server-side only — requires OAuth flow
export const GOOGLE_CALENDAR_BASE = 'https://www.googleapis.com/calendar/v3';
export function isGoogleConfigured() { return Boolean(ENV.GOOGLE_CLIENT_ID && ENV.GOOGLE_CLIENT_SECRET); }

export async function googleCalendarFetch(path: string, accessToken: string, options?: RequestInit): Promise<Record<string, unknown>> {
  const res = await fetch(`${GOOGLE_CALENDAR_BASE}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`Google Calendar API error: ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}
