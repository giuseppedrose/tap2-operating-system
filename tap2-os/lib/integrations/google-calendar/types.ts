export interface GoogleCalendarEvent {
  id: string
  summary: string
  description: string | null
  location: string | null
  start: { dateTime: string; timeZone: string } | { date: string }
  end: { dateTime: string; timeZone: string } | { date: string }
  attendees: GoogleCalendarAttendee[]
  status: 'confirmed' | 'tentative' | 'cancelled'
  created: string
  updated: string
}

export interface GoogleCalendarAttendee {
  email: string
  displayName: string | null
  organizer: boolean
  self: boolean
  responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction'
}

export interface GoogleCalendarList {
  id: string
  summary: string
  primary: boolean
}
