// Supabase client — returns a real client when env vars are set,
// or a stub that throws clearly when methods are called without credentials.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  // Dynamically import to avoid bundling @supabase/supabase-js when not installed
  // Install with: npm install @supabase/supabase-js
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@supabase/supabase-js')
    return createClient(supabaseUrl, supabaseAnonKey)
  } catch {
    console.warn('Supabase client not available. Install @supabase/supabase-js and set env vars.')
    return null
  }
}

export function getSupabaseServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return null
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@supabase/supabase-js')
    return createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    })
  } catch {
    console.warn('Supabase service client not available.')
    return null
  }
}

export const isSupabaseConfigured =
  Boolean(supabaseUrl) && Boolean(supabaseAnonKey)
