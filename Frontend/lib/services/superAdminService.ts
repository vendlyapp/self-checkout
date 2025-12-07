/**
 * Super Admin Service
 * Handles all super admin operations
 */

import { API_CONFIG } from '@/lib/config/api';

export interface PlatformStats {
  users: {
    total: number;
    admins: number;
    customers: number;
  };
  stores: {
    total: number;
    active: number;
  };
  products: {
    total: number;
  };
  orders: {
    total: number;
    revenue: number;
  };
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  qrCode: string | null;
  isActive: boolean;
  isOpen: boolean;
  createdAt: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  productCount: number;
  orderCount: number;
  totalRevenue: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CUSTOMER' | 'SUPER_ADMIN';
  createdAt: string;
  storeId?: string;
  storeName?: string;
  storeSlug?: string;
  storeActive?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  sku: string;
  stock: number;
  isActive: boolean;
  image?: string;
  category: string;
  createdAt: string;
  storeId?: string;
  storeName?: string;
  storeSlug?: string;
  ownerName?: string;
  ownerEmail?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Get token from Supabase session
    const { supabase } = await import('@/lib/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      throw new Error('No authentication token found');
    }

    // Si ya hay un signal en options, usar ese (React Query lo proporciona)
    const signal = options.signal;

    const response = await fetch(endpoint, {
      ...options,
      signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
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
    console.error('API request failed:', error);
    throw error;
  }
}

export class SuperAdminService {
  /**
   * Get platform statistics
   */
  static async getPlatformStats(): Promise<ApiResponse<PlatformStats>> {
    const url = `${API_CONFIG.BASE_URL}/api/super-admin/stats`;
    return makeRequest<PlatformStats>(url);
  }

  /**
   * Get all stores
   */
  static async getAllStores(params?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<ApiResponse<Store[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.search) queryParams.append('search', params.search);

    const url = `${API_CONFIG.BASE_URL}/api/super-admin/stores${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return makeRequest<Store[]>(url);
  }

  /**
   * Get all users
   */
  static async getAllUsers(params?: {
    limit?: number;
    offset?: number;
    role?: 'ADMIN' | 'CUSTOMER' | 'SUPER_ADMIN';
  }): Promise<ApiResponse<User[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.role) queryParams.append('role', params.role);

    const url = `${API_CONFIG.BASE_URL}/api/super-admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return makeRequest<User[]>(url);
  }

  /**
   * Get store details
   */
  static async getStoreDetails(storeId: string): Promise<ApiResponse<Store>> {
    const url = `${API_CONFIG.BASE_URL}/api/super-admin/stores/${storeId}`;
    return makeRequest<Store>(url);
  }

  /**
   * Toggle store status
   */
  static async toggleStoreStatus(storeId: string, isActive: boolean): Promise<ApiResponse<Store>> {
    const url = `${API_CONFIG.BASE_URL}/api/super-admin/stores/${storeId}/status`;
    return makeRequest<Store>(url, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  /**
   * Update store information
   */
  static async updateStore(storeId: string, storeData: { name?: string; slug?: string; logo?: string | null; isActive?: boolean; isOpen?: boolean }): Promise<ApiResponse<Store>> {
    const url = `${API_CONFIG.BASE_URL}/api/super-admin/stores/${storeId}`;
    return makeRequest<Store>(url, {
      method: 'PUT',
      body: JSON.stringify(storeData),
    });
  }

  /**
   * Get all products grouped by store
   */
  static async getAllProducts(params?: {
    limit?: number;
    offset?: number;
    search?: string;
    storeId?: string;
  }): Promise<ApiResponse<Product[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.storeId) queryParams.append('storeId', params.storeId);

    const url = `${API_CONFIG.BASE_URL}/api/super-admin/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return makeRequest<Product[]>(url);
  }

  /**
   * Get store analytics data
   */
  static async getStoreAnalytics(storeId: string): Promise<ApiResponse<Record<string, unknown>>> {
    const url = `${API_CONFIG.BASE_URL}/api/super-admin/stores/${storeId}/analytics`;
    return makeRequest<Record<string, unknown>>(url);
  }

  /**
   * Get store orders
   */
  static async getStoreOrders(storeId: string, params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<unknown[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = `${API_CONFIG.BASE_URL}/api/super-admin/stores/${storeId}/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return makeRequest<unknown[]>(url);
  }
}
