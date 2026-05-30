const apiKey = process.env.INSTANTLY_API_KEY
export const INSTANTLY_BASE_URL = 'https://api.instantly.ai/api/v1'

export async function instantlyFetch(path: string, options?: RequestInit) {
  if (!apiKey) throw new Error('Instantly not configured: missing INSTANTLY_API_KEY')

  const url = new URL(`${INSTANTLY_BASE_URL}${path}`)
  url.searchParams.set('api_key', apiKey)

  const res = await fetch(url.toString(), {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })

  if (!res.ok) {
    throw new Error(`Instantly API error ${res.status}: ${await res.text()}`)
  }

  return res.json()
}

export const isInstantlyConfigured = Boolean(apiKey)
