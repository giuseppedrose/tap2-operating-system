import { gmailFetch } from './client'
import type { GmailMessage } from './types'

export async function searchInvoiceEmails(
  accessToken: string,
  query = 'subject:(invoice OR factuur OR rekening) has:attachment'
): Promise<GmailMessage[]> {
  const listData = await gmailFetch(
    `/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`,
    accessToken
  )

  const messageIds: string[] = (listData.messages ?? []).map((m: { id: string }) => m.id)

  const messages = await Promise.all(
    messageIds.map((id) =>
      gmailFetch(`/users/me/messages/${id}?format=full`, accessToken)
    )
  )

  return messages as GmailMessage[]
}
