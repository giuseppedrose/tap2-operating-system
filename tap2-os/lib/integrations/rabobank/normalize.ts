import type { RabobankCsvRow, RabobankTransaction, CategorizationRule, TransactionCategory } from './types'

const RULES: CategorizationRule[] = [
  { pattern: /stripe/i, category: 'Revenue', subcategory: 'Stripe Payout' },
  { pattern: /mollie/i, category: 'Revenue', subcategory: 'Mollie Payout' },
  { pattern: /salaris|salary|loon|payroll/i, category: 'Payroll', subcategory: 'Salary' },
  { pattern: /vercel/i, category: 'SaaS', subcategory: 'Hosting' },
  { pattern: /supabase/i, category: 'SaaS', subcategory: 'Database' },
  { pattern: /openai|anthropic|claude/i, category: 'SaaS', subcategory: 'AI Tools' },
  { pattern: /hubspot/i, category: 'SaaS', subcategory: 'CRM' },
  { pattern: /instantly/i, category: 'SaaS', subcategory: 'Email Outbound' },
  { pattern: /google (workspace|cloud)/i, category: 'SaaS', subcategory: 'Google' },
  { pattern: /github/i, category: 'Development', subcategory: 'Dev Tools' },
  { pattern: /freelan|contractor|zzp/i, category: 'Contractor', subcategory: 'Contractor' },
  { pattern: /notaris|advocat|legal|jurist/i, category: 'Legal', subcategory: 'Legal' },
  { pattern: /accountant|boekhouding|administratie/i, category: 'Accounting', subcategory: 'Accounting' },
  { pattern: /ns |trein|ov-chipkaart|taxi|uber|bolt/i, category: 'Travel', subcategory: 'Transport' },
  { pattern: /hotel|airbnb|booking/i, category: 'Travel', subcategory: 'Accommodation' },
  { pattern: /belasting|dutchtax|btw|ib aangifte/i, category: 'Tax', subcategory: 'Tax' },
  { pattern: /huur|kantoor|office|co-?working/i, category: 'Office', subcategory: 'Office' },
]

export function categorize(t: RabobankTransaction): { category: TransactionCategory; subcategory: string } {
  const text = `${t.description} ${t.counterparty}`.toLowerCase()
  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      return { category: rule.category, subcategory: rule.subcategory }
    }
  }
  return { category: t.amount > 0 ? 'Other' : 'Needs Review', subcategory: '' }
}

export function parseCsvRows(content: string): RabobankTransaction[] {
  const lines = content.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))

  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    const row = Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ''])) as unknown as RabobankCsvRow

    const rawAmount = (row['Bedrag (EUR)'] ?? '').replace('.', '').replace(',', '.')
    const amount =
      parseFloat(rawAmount) * (row['Af Bij']?.toUpperCase() === 'AF' ? -1 : 1)

    return {
      date: row['Datum'] ?? '',
      description: row['Mededelingen'] ?? row['Naam / Omschrijving'] ?? '',
      counterparty: row['Naam / Omschrijving'] ?? '',
      iban: row['Tegenrekening'] ?? null,
      amount: isNaN(amount) ? 0 : amount,
      currency: 'EUR',
      balanceAfter: null,
    }
  })
}
