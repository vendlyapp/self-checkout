/**
 * Servicio de Órdenes
 * Encargado de crear órdenes en el backend utilizando la sesión de Supabase.
 */

import { API_CONFIG } from '@/lib/config/api';

export type OrderItemPayload = {
  productId: string;
  quantity: number;
  price?: number;
};

export type OrderMetadata = Record<string, unknown>;

export interface GuestCustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CreateOrderInput {
  items: OrderItemPayload[];
  paymentMethod?: string;
  total?: number;
  metadata?: OrderMetadata;
  storeId?: string;
  storeSlug?: string;
  customer?: GuestCustomerInfo;
}

interface OrderItemResponse {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

interface OrderResponse {
  id: string;
  userId: string;
  total: number;
  status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod?: string;
  storeId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
  invoiceId?: string | null;
  invoiceNumber?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const getAuthContext = async (): Promise<{
  token: string | null;
  userId: string | null;
}> => {
  const { supabase } = await import('@/lib/supabase/client');
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    token: session?.access_token ?? null,
    userId: session?.user?.id ?? null,
  };
};

// Helper function to make authenticated requests
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const { buildApiUrl, getAuthHeaders } = await import('@/lib/config/api');
    const { supabase } = await import('@/lib/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const url = buildApiUrl(endpoint);
    const headers = getAuthHeaders(token);
    
    // Si ya hay un signal en options, usar ese (React Query lo proporciona)
    const controller = options.signal ? null : new AbortController();
    const timeoutId = controller ? setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT) : null;
    
    // Usar el signal de options si existe (React Query), sino usar el del controller
    const signal = options.signal || controller?.signal;
    
    const response = await fetch(url, {
      headers,
      signal,
      ...options,
    });
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // Si el error no tiene mensaje, probablemente es una cancelación de React Query
      if (!error.message || error.message === 'signal is aborted without reason' || error.message.includes('aborted')) {
        // No loggear cancelaciones de React Query - es comportamiento normal
        // Silenciosamente retornar error de cancelación
        return {
          success: false,
          error: 'Request cancelled',
        };
      }
      // Solo loggear timeouts reales (no cancelaciones)
      console.warn('Connection timeout:', error.message);
      return {
        success: false,
        error: 'Connection timeout - please try again',
      };
    }
    
    // Solo loggear errores que no sean cancelaciones
    // Verificar que no sea un error de cancelación antes de loggear
    if (error instanceof Error && (
      error.message.includes('aborted') || 
      error.message.includes('cancelled') ||
      error.name === 'AbortError'
    )) {
      return {
        success: false,
        error: 'Request cancelled',
      };
    }
    
    // Solo loggear errores de conexión si no son cancelaciones
    if (error instanceof Error) {
      // Verificar si es un error de conexión (backend no disponible)
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED') || error.message.includes('NetworkError')) {
        // No loggear en producción para evitar spam en consola
        if (process.env.NODE_ENV === 'development') {
          console.warn('Backend no disponible. Asegúrate de que el servidor esté corriendo en el puerto 5000.');
        }
        return {
          success: false,
          error: 'Backend no disponible',
        };
      }
      console.error('Error en la llamada al backend:', error);
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  recentOrders: number;
  uniqueCustomers: number;
}

export interface RecentOrder {
  id: string;
  userId: string;
  total: number;
  status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod?: string;
  storeId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userEmail?: string;
  items?: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    productName?: string;
    productSku?: string;
  }>;
}

export const OrderService = {
  createOrder: async (input: CreateOrderInput): Promise<OrderResponse> => {
    if (!input.items || input.items.length === 0) {
      throw new Error('Ihr Warenkorb ist leer.');
    }

    const normalizedItems = input.items
      .map((item) => ({
        productId: item.productId.trim(),
        quantity: Math.max(0, Math.floor(item.quantity)),
        price: typeof item.price === 'number' ? Number(item.price) : undefined,
      }))
      .filter((item) => item.productId.length > 0 && item.quantity > 0);

    if (normalizedItems.length === 0) {
      throw new Error('Fügen Sie gültige Produkte hinzu, bevor Sie bezahlen.');
    }

    const { token, userId } = await getAuthContext();

    const response = await fetch(`${API_CONFIG.BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        userId: userId ?? undefined,
        items: normalizedItems,
        paymentMethod: input.paymentMethod,
        total: input.total,
        metadata: input.metadata,
        storeId: input.storeId,
        storeSlug: input.storeSlug,
        customer: input.customer,
      }),
    });

    const payload = (await response.json()) as ApiResponse<OrderResponse>;

    if (!response.ok || !payload.success || !payload.data) {
      const apiMessage = payload.error || payload.message;
      throw new Error(apiMessage || `Fehler ${response.status} beim Erstellen der Bestellung.`);
    }

    return payload.data;
  },

  /**
   * Obtener estadísticas de órdenes
   * @param date - Fecha en formato YYYY-MM-DD para filtrar por día (opcional)
   * @param ownerId - ID del usuario/tienda para filtrar (opcional)
   * @param requestOptions - Opciones adicionales incluyendo signal de React Query
   */
  getStats: async (date?: string, ownerId?: string, requestOptions?: { signal?: AbortSignal }): Promise<ApiResponse<OrderStats>> => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (ownerId) params.append('ownerId', ownerId);
    
    const queryString = params.toString();
    const endpoint = queryString ? `${API_CONFIG.ENDPOINTS.ORDER_STATS}?${queryString}` : API_CONFIG.ENDPOINTS.ORDER_STATS;
    return makeRequest<OrderStats>(endpoint, requestOptions);
  },

  /**
   * Obtener órdenes recientes
   * @param limit - Límite de órdenes a obtener
   * @param requestOptions - Opciones adicionales incluyendo signal de React Query
   */
  getRecentOrders: async (limit: number = 10, requestOptions?: { signal?: AbortSignal }): Promise<ApiResponse<RecentOrder[]>> => {
    const endpoint = `${API_CONFIG.ENDPOINTS.ORDER_RECENT}?limit=${limit}`;
    return makeRequest<RecentOrder[]>(endpoint, requestOptions);
  },
};


