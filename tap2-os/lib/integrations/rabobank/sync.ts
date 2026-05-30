import { parseCsvRows } from './normalize'
import type { RabobankTransaction } from './types'

export async function parseBankStatementFile(fileContent: string): Promise<RabobankTransaction[]> {
  return parseCsvRows(fileContent)
}

export async function categorizeBatch(
  transactions: RabobankTransaction[]
): Promise<Array<RabobankTransaction & { category: string; subcategory: string }>> {
  const { categorize } = await import('./normalize')
  return transactions.map((t) => ({ ...t, ...categorize(t) }))
}
