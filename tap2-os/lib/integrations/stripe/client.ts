import { ENV } from '@/lib/config/env';
// Server-side only
export function getStripeKey(): string | undefined { return ENV.STRIPE_SECRET_KEY; }
export const isStripeConfigured = () => Boolean(ENV.STRIPE_SECRET_KEY);

export async function stripeFetch(path: string, params?: Record<string, string>): Promise<Record<string, unknown>> {
  const key = ENV.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe not configured');
  const url = new URL(`https://api.stripe.com/v1${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${key}`, 'Stripe-Version': '2023-10-16' },
  });
  if (!res.ok) throw new Error(`Stripe API error: ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}
