export interface FathomRecording {
  id: string
  title: string
  call_date: string
  duration_seconds: number
  attendees: FathomAttendee[]
  summary: string | null
  action_items: string[]
}

export interface FathomAttendee {
  name: string
  email: string | null
  is_host: boolean
}

export interface FathomTranscriptSegment {
  speaker: string
  start_seconds: number
  end_seconds: number
  text: string
}

export interface ExtractedCallInsights {
  summary: string
  objections: string[]
  buyingSignals: string[]
  nextSteps: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  aiScore: number
}
