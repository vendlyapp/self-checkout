/**
 * Session utilities: clear localStorage, sessionStorage, cookies, and caches on logout.
 */

import { supabase } from '@/lib/supabase/client';

/** Clears all Supabase-related cookies. */
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
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      const domainParts = window.location.hostname.split('.');
      if (domainParts.length > 1) {
        const rootDomain = '.' + domainParts.slice(-2).join('.');
        document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${rootDomain};`;
      }
    }
  });
};

/** Clears browser caches: Service Workers, Cache API, IndexedDB, Next.js keys. */
const clearBrowserCache = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map((registration) => registration.unregister())
        );
      } catch (error) {
        console.warn('Failed to unregister Service Workers:', error);
      }
    }
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((name) => {
            try {
              return caches.delete(name);
            } catch (error) {
              console.warn(`Failed to delete cache ${name}:`, error);
              return Promise.resolve(false);
            }
          })
        );
      } catch (error) {
        console.warn('Failed to clear Cache API:', error);
      }
    }
    if ('indexedDB' in window) {
      try {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases.map((db) => {
            if (db.name) {
              return new Promise<void>((resolve) => {
                const deleteReq = indexedDB.deleteDatabase(db.name!);
                deleteReq.onsuccess = () => resolve();
                deleteReq.onerror = () => resolve();
                deleteReq.onblocked = () => resolve();
                setTimeout(() => resolve(), 1000);
              });
            }
            return Promise.resolve();
          })
        );
      } catch (error) {
        console.warn('Failed to clear IndexedDB:', error);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const nextKeys = Object.keys(localStorage).filter((key) =>
          key.startsWith('next-') || key.startsWith('__next')
        );
        nextKeys.forEach((key) => localStorage.removeItem(key));
        const nextSessionKeys = Object.keys(sessionStorage).filter((key) =>
          key.startsWith('next-') || key.startsWith('__next')
        );
        nextSessionKeys.forEach((key) => sessionStorage.removeItem(key));
      } catch (error) {
        console.warn('Failed to clear Next.js keys:', error);
      }
    }

    if ('fetch' in window && 'cache' in Request.prototype) {
      try {
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
        setTimeout(() => {
          window.fetch = originalFetch;
        }, 1000);
      } catch (error) {
        console.warn('Failed to set fetch no-cache:', error);
      }
    }
  } catch (error) {
    console.warn('Browser cache clear failed (continuing):', error);
  }
};

/** Clears all Zustand stores (cart, store state, scanned store, super admin, products analytics). */
const clearZustandStores = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    try {
      const { useCartStore } = await import('@/lib/stores/cartStore');
      useCartStore.getState().clearCart();
      const store = useCartStore as { persist?: { clearStorage?: () => void } };
      if (store.persist?.clearStorage) {
        store.persist.clearStorage();
      }
    } catch (error) {
      console.warn('Failed to clear cartStore:', error);
    }
    try {
      const { useStoreState } = await import('@/lib/stores/storeState');
      const store = useStoreState as { persist?: { clearStorage?: () => void } };
      if (store.persist?.clearStorage) {
        store.persist.clearStorage();
      }
    } catch (error) {
      console.warn('Failed to clear storeState:', error);
    }
    try {
      const { useScannedStoreStore } = await import('@/lib/stores/scannedStoreStore');
      useScannedStoreStore.getState().clearStore();
      const store = useScannedStoreStore as { persist?: { clearStorage?: () => void } };
      if (store.persist?.clearStorage) {
        store.persist.clearStorage();
      }
    } catch (error) {
      console.warn('Failed to clear scannedStoreStore:', error);
    }
    try {
      const { useSuperAdminStore } = await import('@/lib/stores/superAdminStore');
      useSuperAdminStore.getState().clearCache();
      const store = useSuperAdminStore as { persist?: { clearStorage?: () => void } };
      if (store.persist?.clearStorage) {
        store.persist.clearStorage();
      }
    } catch (error) {
      console.warn('Failed to clear superAdminStore:', error);
    }
    try {
      const { useProductsAnalyticsStore } = await import('@/lib/stores/productsAnalyticsStore');
      useProductsAnalyticsStore.getState().clearData();
      const store = useProductsAnalyticsStore as { persist?: { clearStorage?: () => void } };
      if (store.persist?.clearStorage) {
        store.persist.clearStorage();
      }
    } catch (error) {
      console.warn('Failed to clear productsAnalyticsStore:', error);
    }
  } catch (error) {
    console.warn('Failed to clear Zustand stores:', error);
  }
};

/** Clears React Query cache (works when called from a component with QueryClientProvider). */
const clearReactQueryCache = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  try {
    await import('@tanstack/react-query');
    if (typeof window !== 'undefined') {
      const windowWithQueryClient = window as { __REACT_QUERY_CLIENT__?: { clear: () => void } };
      if (windowWithQueryClient.__REACT_QUERY_CLIENT__) {
        windowWithQueryClient.__REACT_QUERY_CLIENT__.clear();
      }
    }
  } catch (error) {
    console.warn('Failed to clear React Query cache:', error);
  }
};

/** Clears all auth-related cookies (Supabase, Google OAuth). */
const clearAllAuthCookies = (): void => {
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
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      const domainParts = window.location.hostname.split('.');
      if (domainParts.length > 1) {
        const rootDomain = '.' + domainParts.slice(-2).join('.');
        document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${rootDomain};`;
      }
    }
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
 * Clears all auth/session data: Supabase, Zustand stores, React Query, localStorage,
 * sessionStorage, cookies, IndexedDB. Optionally notifies backend of logout.
 */
export const clearAllSessionData = async (queryClient?: { clear: () => void }): Promise<void> => {
  try {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || null;
      } catch (error) {
        console.warn('Failed to get token for logout:', error);
      }
    }

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
          console.warn('Backend logout notification failed (ignored):', error);
        });
      } catch (error) {
        console.warn('Backend logout notification failed:', error);
      }
    }

    if (queryClient) {
      try {
        queryClient.clear();
      } catch (error) {
        console.warn('Failed to clear React Query cache:', error);
      }
    }
    await clearReactQueryCache();
    await clearZustandStores();

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Supabase signOut failed:', error);
    }

    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('theme');
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
      localStorage.clear();
      if (theme) {
        localStorage.setItem('theme', theme);
      }
    }

    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
    clearAllAuthCookies();
    await clearBrowserCache();

    if (typeof window !== 'undefined') {
      try {
        const windowWithNext = window as { next?: { router?: { refresh?: () => void } } };
        if (windowWithNext.next?.router) {
          const router = windowWithNext.next.router;
          if (router && typeof router.refresh === 'function') {
            router.refresh();
          }
        }
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
        if ('performance' in window && 'clearResourceTimings' in window.performance) {
          try {
            window.performance.clearResourceTimings();
          } catch {
            /* no-op */
          }
        }
      } catch (error) {
        console.warn('Failed to clear router cache and globals:', error);
      }
    }
  } catch (error) {
    console.error('Session clear failed:', error);
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    clearAllAuthCookies();
  }
};

/** Clears only auth data (Supabase, auth keys); leaves other app state intact. */
export const clearAuthData = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('vendly-auth-token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.clear();
    }
    clearSupabaseCookies();
  } catch (error) {
    console.error('Auth data clear failed:', error);
  }
};

export const getLastActivityTime = (): number | null => {
  if (typeof window === 'undefined') return null;
  const timestamp = localStorage.getItem('lastActivityTime');
  return timestamp ? parseInt(timestamp, 10) : null;
};

export const updateLastActivityTime = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('lastActivityTime', Date.now().toString());
};

/** Returns true if session is expired (15 min inactivity). */
export const isSessionExpired = (): boolean => {
  const lastActivity = getLastActivityTime();
  if (!lastActivity) return false;
  const SESSION_TIMEOUT_MS = 15 * 60 * 1000;
  const now = Date.now();
  const timeSinceLastActivity = now - lastActivity;
  return timeSinceLastActivity >= SESSION_TIMEOUT_MS;
};

/** Forces a full reload without cache (uses location.replace). */
export const forceReloadWithoutCache = (url?: string): void => {
  if (typeof window === 'undefined') return;
  const targetUrl = url || window.location.pathname;
  const separator = targetUrl.includes('?') ? '&' : '?';
  window.location.replace(`${targetUrl}${separator}_nocache=${Date.now()}`);
};

/** Clears Next.js router cache and forces reload. */
export const clearNextJsCacheAndReload = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  try {
    const windowWithNext = window as { next?: { router?: { refresh?: () => void } } };
    if (windowWithNext.next?.router) {
      const router = windowWithNext.next.router;
      if (router && typeof router.refresh === 'function') {
        router.refresh();
      }
    }

    const windowWithNextData = window as { __NEXT_DATA__?: unknown; __NEXT_DATA_CACHE__?: unknown };
    delete windowWithNextData.__NEXT_DATA__;
    delete windowWithNextData.__NEXT_DATA_CACHE__;
    forceReloadWithoutCache();
  } catch (error) {
    console.warn('Next.js cache clear failed, forcing reload:', error);
    forceReloadWithoutCache();
  }
};

