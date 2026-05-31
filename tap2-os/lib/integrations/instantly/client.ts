// Server-side only — never import from client components
const apiKey = process.env.INSTANTLY_API_KEY;
export const INSTANTLY_BASE_URL = 'https://api.instantly.ai/api/v2';

export async function instantlyFetch(path: string, options?: RequestInit) {
  if (!apiKey) throw new Error('Instantly not configured: missing INSTANTLY_API_KEY');

  // Use Authorization header — NOT URL query param (keys in URLs appear in server logs)
  const res = await fetch(`${INSTANTLY_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    // Return safe error — do not bubble raw API response which may contain request metadata
    throw new Error(`Instantly API error: ${res.status}`);
  }

  return res.json();
}

export const isInstantlyConfigured = Boolean(apiKey);
