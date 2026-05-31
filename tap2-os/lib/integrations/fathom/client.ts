// Server-side only — never import from client components
const apiKey = process.env.FATHOM_API_KEY;
export const FATHOM_BASE_URL = 'https://api.fathom.video/v1';

export async function fathomFetch(path: string, options?: RequestInit) {
  if (!apiKey) throw new Error('Fathom not configured: missing FATHOM_API_KEY');

  const res = await fetch(`${FATHOM_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Fathom API error: ${res.status}`);
  }

  return res.json();
}

export const isFathomConfigured = Boolean(apiKey);
