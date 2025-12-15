'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { SESSION_TIMEOUT } from '@/lib/supabase/client';

/**
 * Hook para monitorear el tiempo de sesión y cerrar automáticamente después de 15 minutos
 * También limpia completamente todos los datos: React Query, Zustand stores, localStorage, sessionStorage, cookies e IndexedDB
 */
export const useSessionTimeout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    // Actualizar última actividad en eventos de usuario y reprogramar timeout
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      
      // Reprogramar timeout cuando hay actividad
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(async () => {
        await handleSessionExpiry();
      }, SESSION_TIMEOUT);
    };

    // Escuchar eventos de actividad del usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Si es la primera vez que detectamos una sesión, guardar el tiempo de inicio
          if (!sessionStartRef.current) {
            sessionStartRef.current = Date.now();
            lastActivityRef.current = Date.now();
          }

          // Calcular tiempo transcurrido desde la última actividad
          const timeSinceLastActivity = Date.now() - lastActivityRef.current;
          
          // Si han pasado más de 15 minutos sin actividad, cerrar sesión
          if (timeSinceLastActivity >= SESSION_TIMEOUT) {
            await handleSessionExpiry();
            return;
          }

          // Programar verificación del timeout restante
          const remaining = SESSION_TIMEOUT - timeSinceLastActivity;
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          timeoutRef.current = setTimeout(async () => {
            await handleSessionExpiry();
          }, Math.max(remaining, 1000)); // Mínimo 1 segundo para evitar timeouts inmediatos
        } else {
          // No hay sesión, limpiar referencias
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          sessionStartRef.current = null;
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    const handleSessionExpiry = async () => {
      try {
        // Usar la función de limpieza completa
        const { clearAllSessionData } = await import('@/lib/utils/sessionUtils');
        await clearAllSessionData(queryClient);
        
        // Limpiar router cache y redirigir a login sin cache
        router.refresh(); // Limpiar cache del router
        router.push('/login?sessionExpired=true');
        
        // Forzar recarga sin cache después de un breve delay
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/login?sessionExpired=true&_t=' + Date.now();
          }
        }, 100);
      } catch (error) {
        console.error('Error handling session expiry:', error);
        // Forzar limpieza básica en caso de error
        try {
          await supabase.auth.signOut();
          if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
          }
          router.push('/login?sessionExpired=true');
        } catch (e) {
          console.error('Error en limpieza de emergencia:', e);
        }
      }
    };

    // Verificar sesión inicial
    checkSession();

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Nueva sesión iniciada, resetear el tiempo de inicio y última actividad
          sessionStartRef.current = Date.now();
          lastActivityRef.current = Date.now();
          
          // Programar timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          timeoutRef.current = setTimeout(async () => {
            await handleSessionExpiry();
          }, SESSION_TIMEOUT);
        } else if (event === 'SIGNED_OUT') {
          // Sesión cerrada, limpiar referencias
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          sessionStartRef.current = null;
          lastActivityRef.current = Date.now();
          
          // Limpiar cache
          queryClient.clear();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Token refrescado, resetear el tiempo de inicio y última actividad
          sessionStartRef.current = Date.now();
          lastActivityRef.current = Date.now();
          
          // Reprogramar timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          timeoutRef.current = setTimeout(async () => {
            await handleSessionExpiry();
          }, SESSION_TIMEOUT);
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
      // Remover listeners de eventos
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [queryClient, router]);
};

