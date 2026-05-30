import type { GoogleCalendarEvent } from './types'
import type { Meeting } from '@/lib/supabase/types'

function getEventStart(event: GoogleCalendarEvent): string {
  const s = event.start
  return 'dateTime' in s ? s.dateTime : `${s.date}T00:00:00Z`
}

const SALES_KEYWORDS = ['demo', 'discovery', 'follow-up', 'proposal', 'trial', 'negotiation']

export function classifyMeetingType(summary: string): Meeting['meeting_type'] {
  const lower = summary.toLowerCase()
  if (lower.includes('demo')) return 'Demo'
  if (lower.includes('discovery') || lower.includes('intake')) return 'Discovery'
  if (lower.includes('follow') || lower.includes('check-in')) return 'Follow-up'
  if (lower.includes('investor') || lower.includes('vc') || lower.includes('pitch')) return 'Investor'
  if (lower.includes('partner')) return 'Partner'
  if (lower.includes('onboard') || lower.includes('success') || lower.includes('client')) return 'Client Success'
  return 'Other'
}

export function isSalesMeeting(event: GoogleCalendarEvent): boolean {
  const text = `${event.summary} ${event.description ?? ''}`.toLowerCase()
  return SALES_KEYWORDS.some((kw) => text.includes(kw))
}

export function normalizeCalendarEvent(event: GoogleCalendarEvent): Partial<Meeting> {
  return {
    title: event.summary,
    calendar_event_id: event.id,
    meeting_type: classifyMeetingType(event.summary),
    meeting_date: getEventStart(event),
    created_at: event.created,
  }
}
