import { buildApiUrl, getAuthHeaders } from '@/lib/config/api';

export interface InvoiceItem {
  productId: string;
  productName: string;
  productSku?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  shareToken?: string;
  customerName?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerCity?: string;
  customerPostalCode?: string;
  customerPhone?: string;
  storeId?: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;
  storeLogo?: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paymentMethod?: string;
  status: 'issued' | 'paid' | 'cancelled';
  issuedAt: string;
  paidAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  orderDate?: string;
  orderStatus?: string;
}

export interface CreateInvoicePayload {
  orderId: string;
  customerName?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerCity?: string;
  customerPostalCode?: string;
  customerPhone?: string;
  saveCustomerData?: boolean;
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
  options: RequestInit = {},
  useAuth = true
): Promise<ApiResponse<T>> => {
  try {
    const url = buildApiUrl(endpoint);
    
    // Si no se requiere autenticación, no incluir headers de auth
    let headers: HeadersInit;
    if (useAuth) {
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      headers = getAuthHeaders(token);
    } else {
      headers = {
        'Content-Type': 'application/json',
      };
    }
    
    // Si ya hay un signal en options, usar ese (React Query lo proporciona)
    const controller = options.signal ? null : new AbortController();
    const timeoutId = controller ? setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT) : null;
    
    // Usar el signal de options si existe (React Query), sino usar el del controller
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

export class InvoiceService {
  /**
   * Crear una nueva factura
   */
  static async createInvoice(
    payload: CreateInvoicePayload,
    requestOptions?: { signal?: AbortSignal }
  ): Promise<ApiResponse<Invoice>> {
    return makeRequest<Invoice>('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: requestOptions?.signal,
    });
  }

  /**
   * Obtener factura por ID
   */
  static async getInvoiceById(
    id: string,
    requestOptions?: { signal?: AbortSignal }
  ): Promise<ApiResponse<Invoice>> {
    return makeRequest<Invoice>(`/api/invoices/${id}`, {
      method: 'GET',
      signal: requestOptions?.signal,
    });
  }

  /**
   * Obtener factura por token de compartir (público, sin autenticación)
   */
  static async getInvoiceByShareToken(
    shareToken: string,
    requestOptions?: { signal?: AbortSignal }
  ): Promise<ApiResponse<Invoice>> {
    const endpoint = `/api/invoices/public/${shareToken}`;
    
    // Esta ruta es pública, no requiere autenticación
    return makeRequest<Invoice>(endpoint, {
      method: 'GET',
      signal: requestOptions?.signal,
    });
  }

  /**
   * Obtener factura por número de factura
   */
  static async getInvoiceByNumber(
    invoiceNumber: string,
    requestOptions?: { signal?: AbortSignal }
  ): Promise<ApiResponse<Invoice>> {
    return makeRequest<Invoice>(`/api/invoices/number/${invoiceNumber}`, {
      method: 'GET',
      signal: requestOptions?.signal,
    });
  }

  /**
   * Obtener facturas por orderId
   */
  static async getInvoicesByOrderId(
    orderId: string,
    requestOptions?: { signal?: AbortSignal }
  ): Promise<ApiResponse<Invoice[]>> {
    return makeRequest<Invoice[]>(`/api/invoices/order/${orderId}`, {
      method: 'GET',
      signal: requestOptions?.signal,
    });
  }

  /**
   * Obtener facturas por email del cliente
   */
  static async getInvoicesByCustomerEmail(
    email: string,
    options?: { limit?: number; offset?: number },
    requestOptions?: { signal?: AbortSignal }
  ): Promise<ApiResponse<Invoice[]>> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    
    const queryString = params.toString();
    const endpoint = `/api/invoices/customer/${encodeURIComponent(email)}${queryString ? `?${queryString}` : ''}`;
    
    return makeRequest<Invoice[]>(endpoint, {
      method: 'GET',
      signal: requestOptions?.signal,
    });
  }

  /**
   * Obtener facturas por storeId
   */
  static async getInvoicesByStoreId(
    storeId: string,
    options?: { limit?: number; offset?: number },
    requestOptions?: { signal?: AbortSignal }
  ): Promise<ApiResponse<Invoice[]>> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    
    const queryString = params.toString();
    const endpoint = `/api/invoices/store/${storeId}${queryString ? `?${queryString}` : ''}`;
    
    return makeRequest<Invoice[]>(endpoint, {
      method: 'GET',
      signal: requestOptions?.signal,
    });
  }

  /**
   * Actualizar una factura existente
   */
  static async updateInvoice(
    id: string,
    updateData: {
      customerName?: string;
      customerEmail?: string;
      customerAddress?: string;
      customerCity?: string;
      customerPostalCode?: string;
      customerPhone?: string;
      metadata?: Record<string, unknown>;
    },
    requestOptions?: { signal?: AbortSignal }
  ): Promise<ApiResponse<Invoice>> {
    return makeRequest<Invoice>(`/api/invoices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
      signal: requestOptions?.signal,
    });
  }
}

