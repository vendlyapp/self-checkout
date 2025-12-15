import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkkvxzigqqvolbyeybgr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_w5YLhoNEwZViKFH8HoiEOg_Hru9YwGv';

// Configurar sesión de 15 minutos (900 segundos)
const SESSION_DURATION = 15 * 60 * 1000; // 15 minutos en milisegundos

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: false, // Deshabilitar auto-refresh para controlar el timeout manualmente
    detectSessionInUrl: true,
    storageKey: 'vendly-auth-token',
    // Configurar el tiempo de expiración del token (10 minutos)
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'x-client-info': 'vendly-checkout',
    },
  },
});

// Exportar duración de sesión para uso en otros componentes
export const SESSION_TIMEOUT = SESSION_DURATION;
