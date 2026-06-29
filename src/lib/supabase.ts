import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function createFallbackClient() {
  const noopResponse = { data: null, error: null };

  const chainable = {
    eq: () => chainable,
    order: () => chainable,
    limit: () => chainable,
    maybeSingle: async () => noopResponse,
    single: async () => noopResponse,
    then: (resolve: any) => resolve(noopResponse)
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => undefined,
          },
        },
      }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase is not configured') }),
      signUp: async () => ({ data: null, error: new Error('Supabase is not configured') }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => chainable,
      insert: () => chainable,
      update: () => chainable,
      delete: () => chainable,
    }),
    rpc: async (fn: string) => {
      if (fn === 'get_average_risk_score') return { data: 78, error: null };
      return noopResponse;
    }
  } as any;
}

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('Supabase environment variables are missing. Running in demo mode.');
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createFallbackClient();
