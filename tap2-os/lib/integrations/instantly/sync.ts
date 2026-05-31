import { isInstantlyConfigured, instantlyFetch } from './client';

export async function syncInstantlyCampaigns(): Promise<unknown[]> {
  if (!isInstantlyConfigured()) return [];
  const data = await instantlyFetch('/campaign/list?limit=100&skip=0');
  return ((data.campaigns ?? data.data ?? data.items ?? []) as unknown[]);
}
