import type { FathomRecording, FathomTranscriptSegment, ExtractedCallInsights } from './types'
import type { Meeting, CallInsight } from '@/lib/supabase/types'

export function normalizeFathomRecording(raw: FathomRecording): Partial<Meeting> {
  return {
    title: raw.title,
    fathom_call_id: raw.id,
    meeting_date: raw.call_date,
  }
}

export function buildCallInsightFromFathom(
  meetingId: string,
  recording: FathomRecording,
  extracted: ExtractedCallInsights
): Partial<CallInsight> {
  return {
    meeting_id: meetingId,
    summary: extracted.summary || recording.summary,
    objections: extracted.objections,
    buying_signals: extracted.buyingSignals,
    next_steps: extracted.nextSteps,
    sentiment: extracted.sentiment,
    ai_score: extracted.aiScore,
  }
}

// Extract text from a transcript to feed to Claude for insight extraction
export function buildTranscriptText(segments: FathomTranscriptSegment[]): string {
  return segments
    .map((s) => `[${s.speaker}]: ${s.text}`)
    .join('\n')
}

// Prompt template for Claude API to extract insights from a transcript
export function buildInsightExtractionPrompt(transcriptText: string): string {
  return `You are a sales intelligence assistant analyzing a B2B sales call transcript for Tap2, a wallet loyalty platform for HoReCa businesses.

Extract the following from this transcript:
1. A 2-3 sentence summary of the call
2. Objections raised by the prospect (list of strings)
3. Buying signals expressed (list of strings)
4. Agreed next steps (list of strings)
5. Overall sentiment: "positive", "neutral", or "negative"
6. AI deal score 0-100 based on engagement and likelihood to close

Respond ONLY with valid JSON matching this exact structure:
{
  "summary": "...",
  "objections": ["..."],
  "buyingSignals": ["..."],
  "nextSteps": ["..."],
  "sentiment": "positive|neutral|negative",
  "aiScore": 0
}

TRANSCRIPT:
${transcriptText}`
}
