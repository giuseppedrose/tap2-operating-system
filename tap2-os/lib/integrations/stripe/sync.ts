import { isStripeConfigured, stripeFetch } from './client';

export async function syncStripeCustomers(): Promise<unknown[]> {
  if (!isStripeConfigured()) return [];
  const data = await stripeFetch('/customers', { limit: '100' });
  return (data.data as unknown[]) ?? [];
}

export async function syncStripeSubscriptions(): Promise<unknown[]> {
  if (!isStripeConfigured()) return [];
  const data = await stripeFetch('/subscriptions', { limit: '100', status: 'all' });
  return (data.data as unknown[]) ?? [];
}
