import { buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import { Invoice } from '@/lib/services/invoiceService';

export interface Customer {
  id: string;
  storeId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  firstPurchaseAt: string;
  lastPurchaseAt: string;
  totalOrders: number;
  totalSpent: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  metadata?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

const API_CONFIG = {
  TIMEOUT: 10000,
};

// Helper function to make authenticated requests
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = buildApiUrl(endpoint);
    
    const { supabase } = await import('@/lib/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const headers = getAuthHeaders(token);
    
    const controller = options.signal ? null : new AbortController();
    const timeoutId = controller ? setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT) : null;
    
    const signal = options.signal || controller?.signal;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
      signal,
    });
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export class CustomerService {
  /**
   * Obtener todos los clientes de una tienda
   */
  static async getCustomersByStore(
    storeId: string,
    options?: {
      limit?: number;
      offset?: number;
      search?: string;
    },
    requestOptions?: { signal?: AbortSignal }
  ): Promise<ApiResponse<Customer[] | { data: Customer[]; count: number }>> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.search) params.append('search', options.search);

    const queryString = params.toString();
    const endpoint = `/api/stores/${storeId}/customers${queryString ? `?${queryString}` : ''}`;

    // El backend retorna { success: true, data: Customer[], count: number }
    // Necesitamos normalizar la respuesta
    const response = await makeRequest<Customer[] | { data: Customer[]; count: number }>(endpoint, {
      method: 'GET',
      signal: requestOptions?.signal,
    });

    // Normalizar la respuesta: si data es un array, envolverlo en un objeto
    if (response.success && response.data && Array.isArray(response.data)) {
      return {
        ...response,
        data: response.data as Customer[], // El backend retorna el array directamente
      };
    }

    return response;
  }

  /**
   * Obtener un cliente por ID
   */
  static async getCustomerById(
    customerId: string,
    requestOptions?: { signal?: AbortSignal }
  ): Promise<ApiResponse<Customer>> {
    return makeRequest<Customer>(`/api/customers/${customerId}`, {
      method: 'GET',
      signal: requestOptions?.signal,
    });
  }

  /**
   * Crear o actualizar un cliente
   */
  static async createOrUpdateCustomer(
    storeId: string,
    customerData: CreateCustomerPayload,
    requestOptions?: { signal?: AbortSignal }
  ): Promise<ApiResponse<{ data: Customer; isNew: boolean }>> {
    return makeRequest<{ data: Customer; isNew: boolean }>(
      `/api/stores/${storeId}/customers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
        signal: requestOptions?.signal,
      }
    );
  }

  /**
   * Obtener órdenes de un cliente en una tienda
   */
  static async getCustomerOrders(
    customerId: string,
    storeId: string,
    requestOptions?: { signal?: AbortSignal }
  ): Promise<ApiResponse<Array<{
    id: string;
    userId: string;
    customerId: string | null;
    storeId: string;
    total: number;
    status: string;
    paymentMethod: string | null;
    createdAt: string;
    updatedAt: string;
    itemCount: number;
  }>>> {
    return makeRequest<Array<{
      id: string;
      userId: string;
      customerId: string | null;
      storeId: string;
      total: number;
      status: string;
      paymentMethod: string | null;
      createdAt: string;
      updatedAt: string;
      itemCount: number;
    }>>(`/api/customers/${customerId}/orders/${storeId}`, {
      method: 'GET',
      signal: requestOptions?.signal,
    });
  }

  /**
   * Obtener facturas de un cliente en una tienda específica
   */
  static async getCustomerInvoices(
    customerId: string,
    storeId: string,
    requestOptions?: { signal?: AbortSignal }
  ): Promise<ApiResponse<Invoice[]>> {
    return makeRequest<Invoice[]>(`/api/customers/${customerId}/invoices/${storeId}`, {
      method: 'GET',
      signal: requestOptions?.signal,
    });
  }

  /**
   * Actualizar estadísticas de un cliente
   */
  static async updateCustomerStats(
    customerId: string,
    requestOptions?: { signal?: AbortSignal }
  ): Promise<ApiResponse<{
    totalOrders: number;
    totalSpent: number;
    lastPurchaseAt: string;
  }>> {
    return makeRequest<{
      totalOrders: number;
      totalSpent: number;
      lastPurchaseAt: string;
    }>(`/api/customers/${customerId}/stats`, {
      method: 'PUT',
      signal: requestOptions?.signal,
    });
  }

  /**
   * Eliminar un cliente
   */
  static async deleteCustomer(
    customerId: string,
    requestOptions?: { signal?: AbortSignal }
  ): Promise<ApiResponse<{ message: string }>> {
    return makeRequest<{ message: string }>(`/api/customers/${customerId}`, {
      method: 'DELETE',
      signal: requestOptions?.signal,
    });
  }
}
