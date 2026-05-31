import { NextResponse } from 'next/server';

// Server-side env var presence check — never exposes values, only configured/missing
const INTEGRATIONS = [
  {
    id: 'supabase',
    name: 'Supabase',
    vars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
    required: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    vars: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
    required: ['STRIPE_SECRET_KEY'],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    vars: ['HUBSPOT_ACCESS_TOKEN'],
    required: ['HUBSPOT_ACCESS_TOKEN'],
  },
  {
    id: 'instantly',
    name: 'Instantly AI',
    vars: ['INSTANTLY_API_KEY'],
    required: ['INSTANTLY_API_KEY'],
  },
  {
    id: 'google',
    name: 'Google (Calendar + Gmail)',
    vars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'],
    required: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  },
  {
    id: 'fathom',
    name: 'Fathom',
    vars: ['FATHOM_API_KEY'],
    required: ['FATHOM_API_KEY'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    vars: ['ANTHROPIC_API_KEY'],
    required: ['ANTHROPIC_API_KEY'],
  },
];

export async function GET() {
  const status = INTEGRATIONS.map(integration => {
    const varStatus = integration.vars.reduce<Record<string, 'configured' | 'missing'>>((acc, varName) => {
      acc[varName] = process.env[varName] ? 'configured' : 'missing';
      return acc;
    }, {});

    const requiredConfigured = integration.required.every(v => process.env[v]);
    const allConfigured = integration.vars.every(v => process.env[v]);

    return {
      id: integration.id,
      name: integration.name,
      status: requiredConfigured ? (allConfigured ? 'fully_configured' : 'partially_configured') : 'missing',
      varStatus,
    };
  });

  return NextResponse.json({ integrations: status });
}
