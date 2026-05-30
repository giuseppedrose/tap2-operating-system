import type { GmailMessage, ParsedInvoice } from './types'

function getHeader(msg: GmailMessage, name: string): string {
  return (
    msg.payload.headers.find(
      (h) => h.name.toLowerCase() === name.toLowerCase()
    )?.value ?? ''
  )
}

const AMOUNT_PATTERN = /(?:€|EUR|eur)\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/i

export function normalizeGmailInvoice(msg: GmailMessage): ParsedInvoice {
  const subject = getHeader(msg, 'Subject')
  const sender = getHeader(msg, 'From')
  const date = getHeader(msg, 'Date')

  const amountMatch = msg.snippet.match(AMOUNT_PATTERN)
  let amount: number | null = null
  if (amountMatch) {
    const raw = amountMatch[1].replace(/\./g, '').replace(',', '.')
    amount = parseFloat(raw)
    if (isNaN(amount)) amount = null
  }

  const pdfPart = msg.payload.parts?.find(
    (p) => p.mimeType === 'application/pdf' && p.body.attachmentId
  )

  return {
    messageId: msg.id,
    sender,
    subject,
    date,
    amount,
    currency: 'EUR',
    description: msg.snippet,
    attachmentId: pdfPart?.body.attachmentId ?? null,
  }
}
