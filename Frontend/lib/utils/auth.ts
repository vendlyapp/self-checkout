/**
 * Utilidades para autenticación y URLs de redirección
 */

/**
 * Obtiene la URL base de la aplicación
 * En producción, usa la variable de entorno NEXT_PUBLIC_SITE_URL
 * En desarrollo, usa window.location.origin
 */
export const getSiteUrl = (): string => {
  // En el servidor (SSR), usar variable de entorno
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  }

  // En el cliente, preferir variable de entorno, pero usar window.location.origin como fallback
  return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
};

/**
 * Construye la URL de callback para autenticación OAuth
 */
export const getAuthCallbackUrl = (): string => {
  return `${getSiteUrl()}/auth/callback`;
};

/**
 * Construye la URL completa de una ruta
 */
export const getFullUrl = (path: string): string => {
  const baseUrl = getSiteUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
