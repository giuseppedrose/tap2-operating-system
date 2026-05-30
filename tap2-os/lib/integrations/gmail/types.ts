export interface GmailMessage {
  id: string
  threadId: string
  snippet: string
  payload: GmailMessagePayload
  internalDate: string
}

export interface GmailMessagePayload {
  headers: Array<{ name: string; value: string }>
  parts: GmailMessagePart[]
  body: { data: string | null; size: number }
  mimeType: string
}

export interface GmailMessagePart {
  partId: string
  mimeType: string
  filename: string
  body: { attachmentId: string | null; data: string | null; size: number }
}

export interface ParsedInvoice {
  messageId: string
  sender: string
  subject: string
  date: string
  amount: number | null
  currency: string
  description: string
  attachmentId: string | null
}
