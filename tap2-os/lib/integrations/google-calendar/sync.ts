import { googleCalendarFetch } from './client'
import type { GoogleCalendarEvent } from './types'

export async function syncCalendarEvents(
  accessToken: string,
  calendarId = 'primary',
  timeMin?: string,
  timeMax?: string
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })
  if (timeMin) params.set('timeMin', timeMin)
  if (timeMax) params.set('timeMax', timeMax)

  const data = await googleCalendarFetch(
    `/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    accessToken
  )

  return (data.items ?? []) as GoogleCalendarEvent[]
}
