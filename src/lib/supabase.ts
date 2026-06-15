import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function createFallbackClient() {
  const noopResponse = { data: null, error: null };

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
      select: () => ({
        eq: () => ({
          maybeSingle: async () => noopResponse,
          single: async () => noopResponse,
        }),
        maybeSingle: async () => noopResponse,
        single: async () => noopResponse,
      }),
      insert: async () => noopResponse,
      update: async () => noopResponse,
      delete: async () => noopResponse,
    }),
  } as any;
}

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('Supabase environment variables are missing. Running in demo mode.');
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createFallbackClient();
