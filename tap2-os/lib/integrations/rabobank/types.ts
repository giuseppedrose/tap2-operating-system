export interface RabobankTransaction {
  date: string
  description: string
  counterparty: string
  iban: string | null
  amount: number
  currency: string
  balanceAfter: number | null
}

export interface RabobankCsvRow {
  'Datum': string
  'Naam / Omschrijving': string
  'Rekening': string
  'Tegenrekening': string
  'Code': string
  'Af Bij': string
  'Bedrag (EUR)': string
  'Mutatiesoort': string
  'Mededelingen': string
}

export type TransactionCategory =
  | 'Payroll'
  | 'Contractor'
  | 'Development'
  | 'Marketing'
  | 'SaaS'
  | 'Legal'
  | 'Accounting'
  | 'Travel'
  | 'Office'
  | 'Tax'
  | 'Founder Expense'
  | 'Revenue'
  | 'Other'
  | 'Needs Review'

export interface CategorizationRule {
  pattern: RegExp
  category: TransactionCategory
  subcategory: string
}
