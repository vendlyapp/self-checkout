/**
 * Analytics Service
 * Provides typed access to super admin analytics endpoints.
 */

import { API_CONFIG } from '@/lib/config/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

type Granularity = 'day' | 'week' | 'month';

export interface SalesOverTimePoint {
  bucket: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface StorePerformanceEntry {
  storeId: string;
  storeName: string;
  isActive: boolean;
  orders: number;
  revenue: number;
  unitsSold: number;
  avgOrderValue?: number;
}

export interface TopProductEntry {
  productId: string;
  productName: string;
  revenue: number;
  unitsSold: number;
}

export interface ActiveOverview {
  total: number;
  roles: {
    SUPER_ADMIN: number;
    ADMIN: number;
    CUSTOMER: number;
  };
}

export interface ActiveStoreEntry {
  storeId: string;
  storeName: string;
  activeCustomers: number;
}

type SalesOverTimeResponse = SalesOverTimePoint[];
type StorePerformanceResponse = StorePerformanceEntry[];
type TopProductsResponse = TopProductEntry[];
type ActiveStoresResponse = ActiveStoreEntry[];

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const { supabase } = await import('@/lib/supabase/client');
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    // Si ya hay un signal en options, usar ese (React Query lo proporciona)
    // No crear un nuevo AbortController si React Query ya proporciona uno
    const signal = options.signal;

    const response = await fetch(endpoint, {
      ...options,
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        const errorPayload = await response.json();

        if (errorPayload) {
          const descriptiveMessage =
            (typeof errorPayload === 'object' && 'error' in errorPayload
              ? errorPayload.error
              : null) ??
            (typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload));

          if (descriptiveMessage) {
            errorMessage = descriptiveMessage;
          }
        }
      } catch {
        try {
          const fallbackText = await response.text();

          if (fallbackText) {
            errorMessage = fallbackText;
          }
        } catch {
          // sin-op, mantenemos el mensaje original
        }
      }

      throw new Error(errorMessage);
    }

    const json = await response.json();

    return json;
  } catch (error) {
    // No loggear cancelaciones de React Query
    if (error instanceof Error && (
      error.name === 'AbortError' || 
      error.message.includes('aborted') || 
      error.message.includes('cancelled')
    )) {
      // Silenciosamente lanzar error de cancelación (React Query lo manejará)
      throw error;
    }
    
    // Solo loggear errores reales
    console.error('Analytics API request failed:', error);
    throw error;
  }
}

const buildQueryString = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export class AnalyticsService {
  static async getSalesOverTime(params?: {
    from?: string;
    to?: string;
    granularity?: Granularity;
  }): Promise<ApiResponse<SalesOverTimeResponse>> {
    const query = buildQueryString({
      from: params?.from,
      to: params?.to,
      granularity: params?.granularity,
    });

    const url = `${API_CONFIG.BASE_URL}/api/super-admin/analytics/sales-over-time${query}`;
    return makeRequest<SalesOverTimeResponse>(url);
  }

  static async getStorePerformance(params?: {
    from?: string;
    to?: string;
    limit?: number;
  }): Promise<ApiResponse<StorePerformanceResponse>> {
    const query = buildQueryString({
      from: params?.from,
      to: params?.to,
      limit: params?.limit,
    });

    const url = `${API_CONFIG.BASE_URL}/api/super-admin/analytics/store-performance${query}`;
    return makeRequest<StorePerformanceResponse>(url);
  }

  static async getTopProducts(params?: {
    from?: string;
    to?: string;
    limit?: number;
    metric?: 'revenue' | 'units';
  }): Promise<ApiResponse<TopProductsResponse>> {
    const query = buildQueryString({
      from: params?.from,
      to: params?.to,
      limit: params?.limit,
      metric: params?.metric,
    });

    const url = `${API_CONFIG.BASE_URL}/api/super-admin/analytics/top-products${query}`;
    return makeRequest<TopProductsResponse>(url);
  }

  static async getActiveOverview(params?: {
    interval?: number;
  }): Promise<ApiResponse<ActiveOverview>> {
    const query = buildQueryString({
      interval: params?.interval,
    });

    const url = `${API_CONFIG.BASE_URL}/api/super-admin/analytics/active-overview${query}`;
    return makeRequest<ActiveOverview>(url);
  }

  static async getActiveStores(params?: {
    interval?: number;
  }): Promise<ApiResponse<ActiveStoresResponse>> {
    const query = buildQueryString({
      interval: params?.interval,
    });

    const url = `${API_CONFIG.BASE_URL}/api/super-admin/analytics/active-stores${query}`;
    return makeRequest<ActiveStoresResponse>(url);
  }
}


