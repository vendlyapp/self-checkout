/**
 * Handles automatic session timeout (logs out after 10 min inactivity).
 * @deprecated Use hooks/auth/useSessionTimeout.ts which also clears React Query cache.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { clearAllSessionData, updateLastActivityTime, isSessionExpired, getLastActivityTime } from '@/lib/utils/sessionUtils';

const SESSION_TIMEOUT_MS = 10 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 1000;

interface UseSessionTimeoutOptions {
  onSessionExpired?: () => void;
  enabled?: boolean;
}

export const useSessionTimeout = (options: UseSessionTimeoutOptions = {}) => {
  const { onSessionExpired, enabled = true } = options;
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSessionExpired = useCallback(async () => {
    try {
      await clearAllSessionData();
      if (onSessionExpired) onSessionExpired();
      router.push('/login');
      setTimeout(() => { window.location.href = '/login'; }, 100);
    } catch (error) {
      console.error('Session expiry handler failed:', error);
      window.location.href = '/login';
    }
  }, [router, onSessionExpired]);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    updateLastActivityTime();
    if (!enabled) return;
    timeoutRef.current = setTimeout(handleSessionExpired, SESSION_TIMEOUT_MS);
  }, [handleSessionExpired, enabled]);

  useEffect(() => {
    if (!enabled) return;

    if (isSessionExpired()) {
      handleSessionExpired();
      return;
    }

    const lastActivity = getLastActivityTime();
    if (!lastActivity) {
      updateLastActivityTime();
    }

    // Establecer timeout inicial
    resetTimeout();

    // Configurar intervalo para verificar periódicamente
    checkIntervalRef.current = setInterval(() => {
      if (isSessionExpired()) {
        handleSessionExpired();
      }
    }, CHECK_INTERVAL_MS);

    // Eventos de actividad del usuario
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    const handleActivity = () => {
      resetTimeout();
    };

    // Agregar listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, resetTimeout, handleSessionExpired]);

  return {
    resetTimeout,
  };
};

