'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { SESSION_TIMEOUT } from '@/lib/supabase/client';

/**
 * Hook para monitorear el tiempo de sesión y cerrar automáticamente después de 10 minutos
 * También limpia el cache de React Query al cerrar la sesión
 */
export const useSessionTimeout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Si es la primera vez que detectamos una sesión, guardar el tiempo de inicio
          if (!sessionStartRef.current) {
            sessionStartRef.current = Date.now();
          }

          // Calcular tiempo transcurrido
          const elapsed = Date.now() - (sessionStartRef.current || Date.now());
          
          // Si han pasado más de 10 minutos, cerrar sesión
          if (elapsed >= SESSION_TIMEOUT) {
            await handleSessionExpiry();
            return;
          }

          // Programar verificación del timeout restante
          const remaining = SESSION_TIMEOUT - elapsed;
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
        // Limpiar cache de React Query
        queryClient.clear();
        
        // Cerrar sesión en Supabase
        await supabase.auth.signOut();
        
        // Limpiar localStorage y sessionStorage
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
          
          // Limpiar cookies de Supabase
          const cookies = document.cookie.split(';');
          cookies.forEach(cookie => {
            const [name] = cookie.split('=');
            const trimmedName = name.trim();
            if (trimmedName.startsWith('sb-') || trimmedName.startsWith('supabase.')) {
              document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
              document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
            }
          });
        }
        
        // Redirigir a login
        router.push('/login?sessionExpired=true');
      } catch (error) {
        console.error('Error handling session expiry:', error);
      }
    };

    // Verificar sesión inicial
    checkSession();

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Nueva sesión iniciada, resetear el tiempo de inicio
          sessionStartRef.current = Date.now();
          
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
          
          // Limpiar cache
          queryClient.clear();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Token refrescado, resetear el tiempo de inicio
          sessionStartRef.current = Date.now();
          
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
    };
  }, [queryClient, router]);
};

