import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const SESSION_DURATION_MS = 15 * 60 * 1000;

let _client: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set (copy Frontend/.env.example to .env.local and fill in your project keys)'
    );
  }
  // Cookie-based session so Next.js middleware can read auth on server navigations
  _client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

/** Supabase browser client (cookies + SSR-compatible). */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as unknown as Record<string, unknown>)[prop as string];
  },
});

export const SESSION_TIMEOUT = SESSION_DURATION_MS;
