import { isHubSpotConfigured, hsFetch, hsPost } from './client';

export async function syncHubSpotDeals(): Promise<unknown[]> {
  if (!isHubSpotConfigured()) return [];
  const data = await hsPost('/crm/v3/objects/deals/search', { limit: 100 });
  return (data.results as unknown[]) ?? [];
}

export async function syncHubSpotCompanies(): Promise<unknown[]> {
  if (!isHubSpotConfigured()) return [];
  const data = await hsPost('/crm/v3/objects/companies/search', { limit: 100 });
  return (data.results as unknown[]) ?? [];
}
