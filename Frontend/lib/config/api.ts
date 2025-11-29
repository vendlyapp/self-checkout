/**
 * Configuración de API
 * Centraliza la configuración de endpoints y opciones de la API
 */

export const API_CONFIG = {
  // URL base de la API
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  
  // Timeouts
  TIMEOUT: 10000, // 10 segundos
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Endpoints
  ENDPOINTS: {
    // Productos
    PRODUCTS: '/api/products',
    PRODUCT_BY_ID: (id: string) => `/api/products/${id}`,
    PRODUCT_BY_QR: (qrCode: string) => `/api/products/qr/${qrCode}`,
    PRODUCT_STOCK: (id: string) => `/api/products/${id}/stock`,
    PRODUCT_STATS: '/api/products/stats',
    
    // Store
    STORE_MY_STORE: '/api/store/my-store',
    STORE_BY_SLUG: (slug: string) => `/api/store/${slug}`,
    STORE_PRODUCTS: (slug: string) => `/api/store/${slug}/products`,
    STORE_STATUS: '/api/store/my-store/status',
    
    // Auth
    AUTH_PROFILE: '/api/auth/profile',
    AUTH_LOGOUT: '/api/auth/logout',
    
    // Health
    HEALTH: '/health',
  },
  
  // Configuración de paginación
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  
  // Configuración de reintentos
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 segundo
  },
  
  // Configuración de caché
  CACHE: {
    TTL: 5 * 60 * 1000, // 5 minutos
    ENABLED: true,
  },
} as const;

// Tipos para la configuración
export type ApiEndpoint = keyof typeof API_CONFIG.ENDPOINTS;
export type ApiConfig = typeof API_CONFIG;

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value.toString());
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// Función helper para obtener headers con autenticación
export const getAuthHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = { ...API_CONFIG.DEFAULT_HEADERS };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Función helper para manejar errores de API
export const handleApiError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) {
      return response.data.error;
    }
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }
  
  return 'Error desconocido en la API';
};

// Función helper para validar respuestas de API
export const validateApiResponse = <T>(response: unknown): T => {
  if (response && typeof response === 'object' && 'success' in response) {
    const apiResponse = response as { success: boolean; error?: string; data?: T };
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.error || 'Error en la respuesta de la API');
    }
    
    if (apiResponse.data === undefined) {
      throw new Error('Datos no encontrados en la respuesta');
    }
    
    return apiResponse.data;
  }
  
  throw new Error('Respuesta de API inválida');
};
