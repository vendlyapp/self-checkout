'use client';

import { useSessionTimeout } from '@/hooks/auth/useSessionTimeout';

/**
 * Componente que gestiona el timeout de sesión automático
 * Se debe incluir en el layout principal de la aplicación
 */
export const SessionTimeoutManager = () => {
  useSessionTimeout();
  return null;
};

