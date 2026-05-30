const clientId = process.env.GOOGLE_CLIENT_ID
const clientSecret = process.env.GOOGLE_CLIENT_SECRET

export const GOOGLE_CALENDAR_BASE = 'https://www.googleapis.com/calendar/v3'

export function isGoogleConfigured() {
  return Boolean(clientId) && Boolean(clientSecret)
}

export async function googleCalendarFetch(
  path: string,
  accessToken: string,
  options?: RequestInit
) {
  const res = await fetch(`${GOOGLE_CALENDAR_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`Google Calendar API error ${res.status}: ${await res.text()}`)
  }

  return res.json()
}
