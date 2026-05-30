export const GMAIL_BASE_URL = 'https://www.googleapis.com/gmail/v1'

export async function gmailFetch(
  path: string,
  accessToken: string,
  options?: RequestInit
) {
  const res = await fetch(`${GMAIL_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`Gmail API error ${res.status}: ${await res.text()}`)
  }

  return res.json()
}
