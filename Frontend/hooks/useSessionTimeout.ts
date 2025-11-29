/**
 * Hook para manejar el timeout de sesión automático
 * Cierra la sesión después de 30 minutos de inactividad
 */

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { clearAllSessionData, updateLastActivityTime, isSessionExpired, getLastActivityTime } from '@/lib/utils/sessionUtils';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos en milisegundos
const CHECK_INTERVAL = 60 * 1000; // Verificar cada minuto

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
      // Limpiar toda la sesión
      await clearAllSessionData();

      // Ejecutar callback personalizado si existe
      if (onSessionExpired) {
        onSessionExpired();
      }

      // Redirigir al login
      router.push('/login');
      
      // Forzar recarga para limpiar cualquier estado residual
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error) {
      console.error('Error al manejar sesión expirada:', error);
      // Forzar redirección de todas formas
      window.location.href = '/login';
    }
  }, [router, onSessionExpired]);

  const resetTimeout = useCallback(() => {
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Actualizar timestamp de actividad
    updateLastActivityTime();

    if (!enabled) return;

    // Establecer nuevo timeout
    timeoutRef.current = setTimeout(() => {
      handleSessionExpired();
    }, SESSION_TIMEOUT);
  }, [handleSessionExpired, enabled]);

  // Verificar si la sesión ya expiró al montar
  useEffect(() => {
    if (!enabled) return;

    if (isSessionExpired()) {
      handleSessionExpired();
      return;
    }

    // Inicializar timestamp si no existe
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
    }, CHECK_INTERVAL);

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

