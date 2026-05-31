import { NextRequest, NextResponse } from 'next/server';
import { ENV, getEnvStatus } from '@/lib/config/env';

const INTEGRATIONS = [
  { id: 'supabase',  name: 'Supabase',           vars: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const, required: ['SUPABASE_SERVICE_ROLE_KEY'] as const },
  { id: 'stripe',    name: 'Stripe',              vars: ['STRIPE_SECRET_KEY'] as const, required: ['STRIPE_SECRET_KEY'] as const },
  { id: 'hubspot',   name: 'HubSpot',             vars: ['HUBSPOT_ACCESS_TOKEN'] as const, required: ['HUBSPOT_ACCESS_TOKEN'] as const },
  { id: 'instantly', name: 'Instantly AI',        vars: ['INSTANTLY_API_KEY'] as const, required: ['INSTANTLY_API_KEY'] as const },
  { id: 'fathom',    name: 'Fathom',              vars: ['FATHOM_API_KEY'] as const, required: ['FATHOM_API_KEY'] as const },
  { id: 'google',    name: 'Google',              vars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'] as const, required: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] as const },
  { id: 'anthropic', name: 'Anthropic',           vars: ['ANTHROPIC_API_KEY'] as const, required: ['ANTHROPIC_API_KEY'] as const },
];

export async function GET(_req: NextRequest) {
  const status = getEnvStatus();

  const integrations = INTEGRATIONS.map(int => {
    const requiredConfigured = int.required.every(v => status[v as keyof typeof ENV] === 'configured');
    const allConfigured = int.vars.every(v => status[v as keyof typeof ENV] === 'configured');
    const varStatus = Object.fromEntries(
      int.vars.map(v => [v, status[v as keyof typeof ENV] ?? 'missing'])
    );
    return {
      id: int.id,
      name: int.name,
      status: requiredConfigured ? (allConfigured ? 'fully_configured' : 'partially_configured') : 'missing',
      varStatus,
    };
  });

  // Also check NEXT_PUBLIC vars
  const publicVarStatus = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
  };

  return NextResponse.json({ integrations, publicVarStatus });
}
