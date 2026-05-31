/**
 * Central environment variable config.
 * Supports both standard names and Vercel custom names.
 *
 * sanitizeKey() strips any character outside printable ASCII (0x20-0x7E).
 * This removes U+2028 LINE SEPARATOR, U+2029 PARAGRAPH SEPARATOR, and other
 * Unicode chars that silently enter values via clipboard and cause
 * "Cannot convert argument to ByteString" errors in Node.js fetch.
 */

function sanitizeKey(value: string | undefined): string | undefined {
  if (!value) return undefined;
  // eslint-disable-next-line no-control-regex
  return value.replace(/[^\x20-\x7E]/g, '').trim();
}

export const ENV = {
  // Revenue truth
  STRIPE_SECRET_KEY:     sanitizeKey(process.env.STRIPE_SECRET_KEY     ?? process.env.SS),
  STRIPE_WEBHOOK_SECRET: sanitizeKey(process.env.STRIPE_WEBHOOK_SECRET ?? process.env.SSWebhook),

  // Pipeline truth
  HUBSPOT_ACCESS_TOKEN:  sanitizeKey(process.env.HUBSPOT_ACCESS_TOKEN  ?? process.env.Hubspot),

  // Outbound truth
  INSTANTLY_API_KEY:     sanitizeKey(process.env.INSTANTLY_API_KEY     ?? process.env.instantl ?? process.env.instantly),

  // Meeting intelligence
  FATHOM_API_KEY:        sanitizeKey(process.env.FATHOM_API_KEY        ?? process.env.Fathom),
  FATHOM_WEBHOOK_SECRET: sanitizeKey(process.env.FATHOM_WEBHOOK_SECRET ?? process.env.Fathomwebhook),

  // Google OAuth
  GOOGLE_CLIENT_ID:      sanitizeKey(process.env.GOOGLE_CLIENT_ID      ?? process.env.ClientIDgoogle),
  GOOGLE_CLIENT_SECRET:  sanitizeKey(process.env.GOOGLE_CLIENT_SECRET  ?? process.env.GoogleClientSecret),
  GOOGLE_REDIRECT_URI:   sanitizeKey(process.env.GOOGLE_REDIRECT_URI   ?? process.env.GoogleRedirect ?? process.env.GoogleRedirect2),

  // AI analysis layer
  ANTHROPIC_API_KEY:     sanitizeKey(process.env.ANTHROPIC_API_KEY     ?? process.env.AnthropicClaudeKey),

  // Database (service role — server only)
  SUPABASE_SERVICE_ROLE_KEY: sanitizeKey(process.env.SUPABASE_SERVICE_ROLE_KEY),

  // Admin auth
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
} as const;

export type EnvKey = keyof typeof ENV;

export function getEnvStatus(): Record<EnvKey, 'configured' | 'missing'> {
  return Object.fromEntries(
    Object.entries(ENV).map(([k, v]) => [k, v ? 'configured' : 'missing'])
  ) as Record<EnvKey, 'configured' | 'missing'>;
}

export function hasKey(key: EnvKey): boolean {
  return Boolean(ENV[key]);
}
