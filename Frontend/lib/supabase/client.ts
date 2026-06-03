import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const SESSION_DURATION_MS = 15 * 60 * 1000;

let _client: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    const hint =
      process.env.NODE_ENV === 'production'
        ? 'In Vercel → Environment Variables: NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY setzen, dann Redeploy.'
        : 'Kopiere Frontend/.env.example nach .env.local und trage die Supabase-Keys ein.';
    throw new Error(`Supabase-Konfiguration fehlt. ${hint}`);
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
