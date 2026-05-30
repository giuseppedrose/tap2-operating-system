const secretKey = process.env.STRIPE_SECRET_KEY

export function getStripeClient() {
  if (!secretKey) {
    return null
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require('stripe')
    return new Stripe(secretKey, { apiVersion: '2024-11-20.acacia' })
  } catch {
    console.warn('Stripe SDK not available. Run: npm install stripe')
    return null
  }
}

export const isStripeConfigured = Boolean(secretKey)
