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
 * Limpia el cache del navegador de forma exhaustiva
 */
const clearBrowserCache = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    // 1. Limpiar Service Workers y desregistrarlos
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map((registration) => registration.unregister())
        );
      } catch (error) {
        console.warn('Error al desregistrar Service Workers:', error);
      }
    }

    // 2. Limpiar Cache API (todos los caches)
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((name) => {
            try {
              return caches.delete(name);
            } catch (error) {
              console.warn(`Error al eliminar cache ${name}:`, error);
              return Promise.resolve(false);
            }
          })
        );
      } catch (error) {
        console.warn('Error al limpiar Cache API:', error);
      }
    }

    // 3. Limpiar IndexedDB completamente
    if ('indexedDB' in window) {
      try {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases.map((db) => {
            if (db.name) {
              return new Promise<void>((resolve) => {
                const deleteReq = indexedDB.deleteDatabase(db.name!);
                deleteReq.onsuccess = () => resolve();
                deleteReq.onerror = () => resolve(); // Continuar aunque falle
                deleteReq.onblocked = () => resolve(); // Continuar aunque esté bloqueado
                // Timeout de seguridad
                setTimeout(() => resolve(), 1000);
              });
            }
            return Promise.resolve();
          })
        );
      } catch (error) {
        console.warn('Error al limpiar IndexedDB:', error);
      }
    }

    // 4. Limpiar Web Storage (localStorage y sessionStorage ya se limpian por separado)
    // Pero asegurémonos de limpiar también las keys de Next.js
    if (typeof window !== 'undefined') {
      try {
        // Limpiar keys relacionadas con Next.js
        const nextKeys = Object.keys(localStorage).filter((key) =>
          key.startsWith('next-') || key.startsWith('__next')
        );
        nextKeys.forEach((key) => localStorage.removeItem(key));

        const nextSessionKeys = Object.keys(sessionStorage).filter((key) =>
          key.startsWith('next-') || key.startsWith('__next')
        );
        nextSessionKeys.forEach((key) => sessionStorage.removeItem(key));
      } catch (error) {
        console.warn('Error al limpiar keys de Next.js:', error);
      }
    }

    // 5. Limpiar cache de fetch del navegador (si está disponible)
    if ('fetch' in window && 'cache' in Request.prototype) {
      try {
        // Forzar no-cache en futuras peticiones
        const originalFetch = window.fetch;
        window.fetch = function (...args) {
          const [url, options = {}] = args;
          const newOptions = {
            ...options,
            cache: 'no-store' as RequestCache,
            headers: {
              ...options.headers,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
            },
          };
          return originalFetch(url, newOptions);
        };
        // Restaurar después de un momento
        setTimeout(() => {
          window.fetch = originalFetch;
        }, 1000);
      } catch (error) {
        console.warn('Error al configurar fetch no-cache:', error);
      }
    }
  } catch (error) {
    console.warn('Error general al limpiar cache del navegador:', error);
    // No lanzar error, continuar con la limpieza
  }
};

/**
 * Limpia todos los stores de Zustand
 */
const clearZustandStores = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    // Limpiar cartStore
    try {
      const { useCartStore } = await import('@/lib/stores/cartStore');
      useCartStore.getState().clearCart();
      // Intentar usar persist.clearStorage si está disponible
      const store = useCartStore as { persist?: { clearStorage?: () => void } };
      if (store.persist?.clearStorage) {
        store.persist.clearStorage();
      }
    } catch (error) {
      console.warn('Error al limpiar cartStore:', error);
    }

    // Limpiar storeState
    try {
      const { useStoreState } = await import('@/lib/stores/storeState');
      const store = useStoreState as { persist?: { clearStorage?: () => void } };
      if (store.persist?.clearStorage) {
        store.persist.clearStorage();
      }
    } catch (error) {
      console.warn('Error al limpiar storeState:', error);
    }

    // Limpiar scannedStoreStore
    try {
      const { useScannedStoreStore } = await import('@/lib/stores/scannedStoreStore');
      useScannedStoreStore.getState().clearStore();
      const store = useScannedStoreStore as { persist?: { clearStorage?: () => void } };
      if (store.persist?.clearStorage) {
        store.persist.clearStorage();
      }
    } catch (error) {
      console.warn('Error al limpiar scannedStoreStore:', error);
    }

    // Limpiar superAdminStore
    try {
      const { useSuperAdminStore } = await import('@/lib/stores/superAdminStore');
      useSuperAdminStore.getState().clearCache();
      const store = useSuperAdminStore as { persist?: { clearStorage?: () => void } };
      if (store.persist?.clearStorage) {
        store.persist.clearStorage();
      }
    } catch (error) {
      console.warn('Error al limpiar superAdminStore:', error);
    }

    // Limpiar productsAnalyticsStore
    try {
      const { useProductsAnalyticsStore } = await import('@/lib/stores/productsAnalyticsStore');
      useProductsAnalyticsStore.getState().clearData();
      const store = useProductsAnalyticsStore as { persist?: { clearStorage?: () => void } };
      if (store.persist?.clearStorage) {
        store.persist.clearStorage();
      }
    } catch (error) {
      console.warn('Error al limpiar productsAnalyticsStore:', error);
    }
  } catch (error) {
    console.warn('Error general al limpiar stores de Zustand:', error);
  }
};

/**
 * Limpia el cache de React Query
 */
const clearReactQueryCache = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    // Intentar obtener el queryClient del contexto si está disponible
    // Nota: Esto solo funcionará si se llama desde un componente con acceso al QueryClientProvider
    await import('@tanstack/react-query');
    
    // Si hay un queryClient global o en window, limpiarlo
    if (typeof window !== 'undefined') {
      const windowWithQueryClient = window as { __REACT_QUERY_CLIENT__?: { clear: () => void } };
      if (windowWithQueryClient.__REACT_QUERY_CLIENT__) {
        windowWithQueryClient.__REACT_QUERY_CLIENT__.clear();
      }
    }
  } catch (error) {
    console.warn('Error al limpiar cache de React Query:', error);
  }
};

/**
 * Limpia todas las cookies relacionadas con autenticación (Supabase, Google OAuth, etc.)
 */
const clearAllAuthCookies = (): void => {
  if (typeof document === 'undefined') return;

  const cookies = document.cookie.split(';');
  cookies.forEach((cookie) => {
    const [name] = cookie.split('=');
    const trimmedName = name.trim();
    
    // Limpiar cookies de Supabase
    if (
      trimmedName.startsWith('sb-') ||
      trimmedName.startsWith('supabase.') ||
      trimmedName.startsWith('vendly-')
    ) {
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      
      // Limpiar para subdominios
      const domainParts = window.location.hostname.split('.');
      if (domainParts.length > 1) {
        const rootDomain = '.' + domainParts.slice(-2).join('.');
        document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${rootDomain};`;
      }
    }
    
    // Limpiar cookies de Google OAuth
    if (
      trimmedName.includes('google') ||
      trimmedName.includes('oauth') ||
      trimmedName.includes('gid') ||
      trimmedName.includes('_ga') ||
      trimmedName.includes('_gid')
    ) {
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.google.com;`;
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.googleapis.com;`;
    }
  });
};

/**
 * Limpia todos los datos de autenticación y sesión
 * Esta función limpia completamente todo: Supabase, stores, React Query, localStorage, sessionStorage, cookies e IndexedDB
 */
export const clearAllSessionData = async (queryClient?: { clear: () => void }): Promise<void> => {
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
        const { buildApiUrl, getAuthHeaders } = await import('@/lib/config/api');
        const url = buildApiUrl('/api/auth/logout');
        const headers = getAuthHeaders(token, true); // true = no-cache
        await fetch(url, {
          method: 'POST',
          headers,
          cache: 'no-store' as RequestCache,
        }).catch((error) => {
          // Ignorar errores de red, el logout del cliente es suficiente
          console.warn('Error al notificar logout al backend (puede ignorarse):', error);
        });
      } catch (error) {
        // Ignorar errores, continuar con la limpieza local
        console.warn('Error al notificar logout al backend:', error);
      }
    }

    // 2. Limpiar React Query cache (si se proporciona queryClient)
    if (queryClient) {
      try {
        queryClient.clear();
      } catch (error) {
        console.warn('Error al limpiar React Query cache:', error);
      }
    }
    // También intentar limpiar de forma global
    await clearReactQueryCache();

    // 3. Limpiar stores de Zustand
    await clearZustandStores();

    // 4. Cerrar sesión en Supabase
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Error al cerrar sesión en Supabase:', error);
    }

    // 5. Limpiar localStorage (excepto tema si se quiere mantener)
    if (typeof window !== 'undefined') {
      // Guardar tema antes de limpiar (opcional, si quieres mantenerlo)
      const theme = localStorage.getItem('theme');
      
      // Limpiar todas las keys de Zustand del localStorage
      localStorage.removeItem('cart-storage-multi-store');
      localStorage.removeItem('store-state');
      localStorage.removeItem('scanned-store-storage');
      localStorage.removeItem('super-admin-storage');
      
      // Limpiar otros datos de autenticación
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('vendly-auth-token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('lastActivityTime');
      
      // Limpiar todo el localStorage
      localStorage.clear();
      
      // Restaurar tema si existe (opcional)
      if (theme) {
        localStorage.setItem('theme', theme);
      }
    }

    // 6. Limpiar sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }

    // 7. Limpiar todas las cookies (Supabase, Google OAuth, etc.)
    clearAllAuthCookies();

    // 8. Limpiar cache del navegador (Service Workers, IndexedDB, Cache API, etc.)
    await clearBrowserCache();

    // 9. Limpiar router cache de Next.js y variables globales
    if (typeof window !== 'undefined') {
      try {
        // Limpiar router cache de Next.js (si está disponible)
        const windowWithNext = window as { next?: { router?: { refresh?: () => void } } };
        if (windowWithNext.next?.router) {
          const router = windowWithNext.next.router;
          if (router && typeof router.refresh === 'function') {
            router.refresh();
          }
        }

        // Limpiar variables globales relacionadas con autenticación y cache
        const windowWithGlobals = window as {
          __AUTH_STATE__?: unknown;
          __USER_DATA__?: unknown;
          __SESSION_CACHE__?: unknown;
          __NEXT_DATA_CACHE__?: unknown;
          __REACT_QUERY_STATE__?: unknown;
        };
        delete windowWithGlobals.__AUTH_STATE__;
        delete windowWithGlobals.__USER_DATA__;
        delete windowWithGlobals.__SESSION_CACHE__;
        delete windowWithGlobals.__NEXT_DATA_CACHE__;
        delete windowWithGlobals.__REACT_QUERY_STATE__;

        // Limpiar cache de Next.js en el objeto performance (si existe)
        if ('performance' in window && 'clearResourceTimings' in window.performance) {
          try {
            window.performance.clearResourceTimings();
          } catch {
            // Ignorar errores
          }
        }
      } catch (error) {
        console.warn('Error al limpiar router cache y variables globales:', error);
      }
    }
  } catch (error) {
    console.error('Error al limpiar datos de sesión:', error);
    // Forzar limpieza básica en caso de error
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    clearAllAuthCookies();
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
 * Verifica si la sesión ha expirado (15 minutos de inactividad)
 */
export const isSessionExpired = (): boolean => {
  const lastActivity = getLastActivityTime();
  if (!lastActivity) return false;

  const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutos en milisegundos
  const now = Date.now();
  const timeSinceLastActivity = now - lastActivity;

  return timeSinceLastActivity >= SESSION_TIMEOUT;
};

/**
 * Fuerza una recarga de la página sin cache
 */
export const forceReloadWithoutCache = (url?: string): void => {
  if (typeof window === 'undefined') return;
  
  const targetUrl = url || window.location.pathname;
  const separator = targetUrl.includes('?') ? '&' : '?';
  const timestamp = Date.now();
  const finalUrl = `${targetUrl}${separator}_nocache=${timestamp}`;
  
  // Usar location.replace para evitar que quede en el historial
  window.location.replace(finalUrl);
};

/**
 * Limpia el cache de Next.js y fuerza recarga
 */
export const clearNextJsCacheAndReload = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    // Limpiar cache del router
    const windowWithNext = window as { next?: { router?: { refresh?: () => void } } };
    if (windowWithNext.next?.router) {
      const router = windowWithNext.next.router;
      if (router && typeof router.refresh === 'function') {
        router.refresh();
      }
    }

    // Limpiar variables de Next.js
    const windowWithNextData = window as { __NEXT_DATA__?: unknown; __NEXT_DATA_CACHE__?: unknown };
    delete windowWithNextData.__NEXT_DATA__;
    delete windowWithNextData.__NEXT_DATA_CACHE__;

    // Forzar recarga sin cache
    forceReloadWithoutCache();
  } catch (error) {
    console.warn('Error al limpiar cache de Next.js:', error);
    // Forzar recarga de todas formas
    forceReloadWithoutCache();
  }
};

