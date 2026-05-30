import { fathomFetch, isFathomConfigured } from './client'
import type { FathomRecording, FathomTranscriptSegment } from './types'

export async function syncRecordings(limit = 50): Promise<FathomRecording[]> {
  if (!isFathomConfigured) return []
  const data = await fathomFetch(`/recordings?limit=${limit}`)
  return data.recordings ?? []
}

export async function getTranscript(recordingId: string): Promise<FathomTranscriptSegment[]> {
  if (!isFathomConfigured) return []
  const data = await fathomFetch(`/recordings/${recordingId}/transcript`)
  return data.segments ?? []
}

export async function getRecordingSummary(recordingId: string): Promise<string | null> {
  if (!isFathomConfigured) return null
  try {
    const data = await fathomFetch(`/recordings/${recordingId}/summary`)
    return data.summary ?? null
  } catch {
    return null
  }
}
