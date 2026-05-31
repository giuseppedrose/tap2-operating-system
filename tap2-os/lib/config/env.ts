/**
 * Central environment variable config.
 * Supports both standard names (STRIPE_SECRET_KEY) and
 * the actual Vercel variable names set by the operator.
 *
 * Priority: standard name → Vercel custom name
 * Never log or expose the actual values.
 */
export const ENV = {
  // Revenue truth
  STRIPE_SECRET_KEY:      process.env.STRIPE_SECRET_KEY      ?? process.env.SS,
  STRIPE_WEBHOOK_SECRET:  process.env.STRIPE_WEBHOOK_SECRET  ?? process.env.SSWebhook,

  // Pipeline truth
  HUBSPOT_ACCESS_TOKEN:   process.env.HUBSPOT_ACCESS_TOKEN   ?? process.env.Hubspot,

  // Outbound truth
  INSTANTLY_API_KEY:      process.env.INSTANTLY_API_KEY      ?? process.env.instantl   ?? process.env.instantly,

  // Meeting intelligence
  FATHOM_API_KEY:         process.env.FATHOM_API_KEY         ?? process.env.Fathom,
  FATHOM_WEBHOOK_SECRET:  process.env.FATHOM_WEBHOOK_SECRET  ?? process.env.Fathomwebhook,

  // Google OAuth
  GOOGLE_CLIENT_ID:       process.env.GOOGLE_CLIENT_ID       ?? process.env.ClientIDgoogle,
  GOOGLE_CLIENT_SECRET:   process.env.GOOGLE_CLIENT_SECRET   ?? process.env.GoogleClientSecret,
  GOOGLE_REDIRECT_URI:    process.env.GOOGLE_REDIRECT_URI    ?? process.env.GoogleRedirect  ?? process.env.GoogleRedirect2,

  // AI analysis layer
  ANTHROPIC_API_KEY:      process.env.ANTHROPIC_API_KEY      ?? process.env.AnthropicClaudeKey,

  // Database
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Admin auth
  ADMIN_USERNAME:         process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD:         process.env.ADMIN_PASSWORD,
} as const;

/** Presence-only check — never exposes values */
export function getEnvStatus() {
  return Object.fromEntries(
    Object.entries(ENV).map(([k, v]) => [k, v ? 'configured' : 'missing'])
  ) as Record<keyof typeof ENV, 'configured' | 'missing'>;
}

/** Check if a specific key is available */
export function hasKey(key: keyof typeof ENV): boolean {
  return Boolean(ENV[key]);
}
