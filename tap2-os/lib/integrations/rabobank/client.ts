// Rabobank integration uses CSV file uploads — no live API available.
// Files are uploaded via the /admin page and parsed server-side.

export const RABOBANK_CSV_ENCODING = 'utf-8'
export const RABOBANK_DATE_FORMAT = 'yyyy-MM-dd'

export function isRabobankCsv(filename: string): boolean {
  return filename.toLowerCase().endsWith('.csv')
}
