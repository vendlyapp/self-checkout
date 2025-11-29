/**
 * Utilidades para gestión de sesión
 * Limpia completamente localStorage, sessionStorage, cookies y cache
 */

import { supabase } from '@/lib/supabase/client';

/**
 * Limpia todas las cookies relacionadas con Supabase
 */
const clearSupabaseCookies = (): void => {
  if (typeof document === 'undefined') return;

  const cookies = document.cookie.split(';');
  cookies.forEach((cookie) => {
    const [name] = cookie.split('=');
    const trimmedName = name.trim();
    if (
      trimmedName.startsWith('sb-') ||
      trimmedName.startsWith('supabase.') ||
      trimmedName.startsWith('vendly-')
    ) {
      // Limpiar para path raíz
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      // Limpiar para el dominio actual
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      // Limpiar para subdominios
      const domainParts = window.location.hostname.split('.');
      if (domainParts.length > 1) {
        const rootDomain = '.' + domainParts.slice(-2).join('.');
        document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${rootDomain};`;
      }
    }
  });
};

/**
 * Limpia el cache del navegador
 */
const clearBrowserCache = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    // Limpiar cache de Service Workers si existe
    if ('serviceWorker' in navigator && 'caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    // Limpiar IndexedDB si existe
    if ('indexedDB' in window) {
      const databases = await indexedDB.databases();
      await Promise.all(
        databases.map((db) => {
          if (db.name) {
            return new Promise<void>((resolve, reject) => {
              const deleteReq = indexedDB.deleteDatabase(db.name!);
              deleteReq.onsuccess = () => resolve();
              deleteReq.onerror = () => reject(deleteReq.error);
              deleteReq.onblocked = () => resolve(); // Continuar aunque esté bloqueado
            });
          }
          return Promise.resolve();
        })
      );
    }
  } catch (error) {
    console.warn('Error al limpiar cache:', error);
    // No lanzar error, continuar con la limpieza
  }
};

/**
 * Limpia todos los datos de autenticación y sesión
 */
export const clearAllSessionData = async (): Promise<void> => {
  try {
    // 0. Obtener token antes de limpiar (para notificar al backend)
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || null;
      } catch (error) {
        console.warn('Error al obtener token para logout:', error);
      }
    }

    // 1. Notificar al backend del logout (opcional, no bloquea si falla)
    if (token && typeof window !== 'undefined') {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        await fetch(`${apiUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch((error) => {
          // Ignorar errores de red, el logout del cliente es suficiente
          console.warn('Error al notificar logout al backend (puede ignorarse):', error);
        });
      } catch (error) {
        // Ignorar errores, continuar con la limpieza local
        console.warn('Error al notificar logout al backend:', error);
      }
    }

    // 2. Cerrar sesión en Supabase
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Error al cerrar sesión en Supabase:', error);
    }

    // 3. Limpiar localStorage
    if (typeof window !== 'undefined') {
      // Guardar tema antes de limpiar (opcional, si quieres mantenerlo)
      const theme = localStorage.getItem('theme');
      
      localStorage.clear();
      
      // Restaurar tema si existe (opcional)
      if (theme) {
        localStorage.setItem('theme', theme);
      }
    }

    // 4. Limpiar sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }

    // 5. Limpiar cookies
    clearSupabaseCookies();

    // 6. Limpiar cache del navegador
    await clearBrowserCache();
  } catch (error) {
    console.error('Error al limpiar datos de sesión:', error);
    // Forzar limpieza básica en caso de error
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    clearSupabaseCookies();
  }
};

/**
 * Limpia datos específicos de autenticación sin afectar otras configuraciones
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    // Cerrar sesión en Supabase
    await supabase.auth.signOut();

    if (typeof window !== 'undefined') {
      // Limpiar solo datos de autenticación
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('vendly-auth-token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Limpiar sessionStorage
      sessionStorage.clear();
    }

    // Limpiar cookies
    clearSupabaseCookies();
  } catch (error) {
    console.error('Error al limpiar datos de autenticación:', error);
  }
};

/**
 * Obtiene el timestamp de la última actividad
 */
export const getLastActivityTime = (): number | null => {
  if (typeof window === 'undefined') return null;
  const timestamp = localStorage.getItem('lastActivityTime');
  return timestamp ? parseInt(timestamp, 10) : null;
};

/**
 * Actualiza el timestamp de la última actividad
 */
export const updateLastActivityTime = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('lastActivityTime', Date.now().toString());
};

/**
 * Verifica si la sesión ha expirado (30 minutos de inactividad)
 */
export const isSessionExpired = (): boolean => {
  const lastActivity = getLastActivityTime();
  if (!lastActivity) return false;

  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos en milisegundos
  const now = Date.now();
  const timeSinceLastActivity = now - lastActivity;

  return timeSinceLastActivity >= SESSION_TIMEOUT;
};

