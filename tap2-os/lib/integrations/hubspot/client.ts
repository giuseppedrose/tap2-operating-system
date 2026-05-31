// Server-side only — never import from client components
const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
export const HUBSPOT_BASE_URL = 'https://api.hubapi.com';

export function getHubSpotHeaders() {
  if (!accessToken) return null;
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

export async function hubspotFetch(path: string, options?: RequestInit) {
  const headers = getHubSpotHeaders();
  if (!headers) throw new Error('HubSpot not configured: missing HUBSPOT_ACCESS_TOKEN');

  const res = await fetch(`${HUBSPOT_BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });

  if (!res.ok) {
    // Safe error — status code only, no raw response body that might contain sensitive data
    throw new Error(`HubSpot API error: ${res.status}`);
  }

  return res.json();
}

export const isHubSpotConfigured = Boolean(accessToken);
