/**
 * Servicio de Categorías
 * Maneja todas las operaciones relacionadas con categorías usando la API del backend
 */

import { API_CONFIG, buildApiUrl, handleApiError } from '@/lib/config/api';

export interface Category {
  id: string;
  name: string;
  count?: number;
  color?: string;
  icon?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  total?: number;
}

// Función helper para hacer requests
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = buildApiUrl(endpoint);
    
    // Obtener token de Supabase
    const { supabase } = await import('@/lib/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error),
    };
  }
};

export class CategoryService {
  /**
   * Obtener todas las categorías
   */
  static async getCategories(requestOptions?: { signal?: AbortSignal }): Promise<ApiResponse<Category[]>> {
    return makeRequest<Category[]>(API_CONFIG.ENDPOINTS.CATEGORIES, requestOptions);
  }

  /**
   * Obtener categoría por ID
   */
  static async getCategoryById(id: string, requestOptions?: { signal?: AbortSignal }): Promise<ApiResponse<Category>> {
    return makeRequest<Category>(API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(id), requestOptions);
  }

  /**
   * Crear nueva categoría
   */
  static async createCategory(categoryData: CreateCategoryRequest, requestOptions?: { signal?: AbortSignal }): Promise<ApiResponse<Category>> {
    return makeRequest<Category>(API_CONFIG.ENDPOINTS.CATEGORIES, {
      method: 'POST',
      body: JSON.stringify(categoryData),
      ...requestOptions,
    });
  }

  /**
   * Actualizar categoría
   */
  static async updateCategory(id: string, categoryData: UpdateCategoryRequest, requestOptions?: { signal?: AbortSignal }): Promise<ApiResponse<Category>> {
    return makeRequest<Category>(API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(categoryData),
      ...requestOptions,
    });
  }

  /**
   * Eliminar categoría
   */
  static async deleteCategory(id: string, requestOptions?: { signal?: AbortSignal }): Promise<ApiResponse<void>> {
    return makeRequest<void>(API_CONFIG.ENDPOINTS.CATEGORY_BY_ID(id), {
      method: 'DELETE',
      ...requestOptions,
    });
  }
}

