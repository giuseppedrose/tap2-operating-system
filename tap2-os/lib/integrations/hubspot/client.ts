const accessToken = process.env.HUBSPOT_ACCESS_TOKEN

export function getHubSpotHeaders() {
  if (!accessToken) return null
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }
}

export const HUBSPOT_BASE_URL = 'https://api.hubapi.com'

export async function hubspotFetch(path: string, options?: RequestInit) {
  const headers = getHubSpotHeaders()
  if (!headers) throw new Error('HubSpot not configured: missing HUBSPOT_ACCESS_TOKEN')

  const res = await fetch(`${HUBSPOT_BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  })

  if (!res.ok) {
    throw new Error(`HubSpot API error ${res.status}: ${await res.text()}`)
  }

  return res.json()
}

export const isHubSpotConfigured = Boolean(accessToken)
