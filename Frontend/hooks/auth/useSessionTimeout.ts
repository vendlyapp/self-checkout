'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { SESSION_TIMEOUT } from '@/lib/supabase/client';
import { devError } from '@/lib/utils/logger';

/**
 * Hook para monitorear el tiempo de sesión y cerrar automáticamente después de 15 minutos.
 * Solo attachea event listeners cuando hay sesión activa (evita overhead en rutas públicas).
 */
export const useSessionTimeout = () => {
  const queryClient = useQueryClient();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const listenersAttachedRef = useRef(false);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handleSessionExpiry = async () => {
      try {
        const { clearAllSessionData } = await import('@/lib/utils/sessionUtils');
        await clearAllSessionData(queryClient);
      } catch (error) {
        devError('Error clearing session:', error);
        await supabase.auth.signOut().catch(() => {});
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
        }
      } finally {
        // Un único hard redirect — garantizado incluso si clearAllSessionData falla
        window.location.replace('/login?sessionExpired=true');
      }
    };

    const updateActivity = () => {
      lastActivityRef.current = Date.now();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(handleSessionExpiry, SESSION_TIMEOUT);
    };

    const attachListeners = () => {
      if (!listenersAttachedRef.current) {
        events.forEach(event => {
          window.addEventListener(event, updateActivity, { passive: true });
        });
        listenersAttachedRef.current = true;
      }
    };

    const detachListeners = () => {
      if (listenersAttachedRef.current) {
        events.forEach(event => {
          window.removeEventListener(event, updateActivity);
        });
        listenersAttachedRef.current = false;
      }
    };

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Solo attachear listeners cuando hay sesión activa
          attachListeners();

          if (!sessionStartRef.current) {
            sessionStartRef.current = Date.now();
            lastActivityRef.current = Date.now();
          }

          const timeSinceLastActivity = Date.now() - lastActivityRef.current;

          if (timeSinceLastActivity >= SESSION_TIMEOUT) {
            await handleSessionExpiry();
            return;
          }

          const remaining = SESSION_TIMEOUT - timeSinceLastActivity;
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(handleSessionExpiry, Math.max(remaining, 1000));
        } else {
          // Sin sesión: limpiar todo y no attachear listeners
          detachListeners();
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          sessionStartRef.current = null;
        }
      } catch (error) {
        devError('Error checking session:', error);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          sessionStartRef.current = Date.now();
          lastActivityRef.current = Date.now();
          attachListeners();

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(handleSessionExpiry, SESSION_TIMEOUT);
        } else if (event === 'SIGNED_OUT') {
          detachListeners();
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          sessionStartRef.current = null;
          lastActivityRef.current = Date.now();
          queryClient.clear();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          sessionStartRef.current = Date.now();
          lastActivityRef.current = Date.now();

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(handleSessionExpiry, SESSION_TIMEOUT);
        }
      }
    );

    // Verificar periódicamente (cada minuto)
    const intervalId = setInterval(checkSession, 60 * 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      clearInterval(intervalId);
      subscription.unsubscribe();
      detachListeners();
    };
  }, [queryClient]);
};
