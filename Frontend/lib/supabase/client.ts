import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkkvxzigqqvolbyeybgr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_w5YLhoNEwZViKFH8HoiEOg_Hru9YwGv';

const SESSION_DURATION_MS = 15 * 60 * 1000;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: true,
    storageKey: 'vendly-auth-token',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'x-client-info': 'vendly-checkout',
    },
  },
});

export const SESSION_TIMEOUT = SESSION_DURATION_MS;
