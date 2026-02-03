/**
 * Servicio de Productos
 * Maneja todas las operaciones relacionadas con productos usando la API del backend
 */

import { API_CONFIG, buildApiUrl, handleApiError } from '@/lib/config/api';

// Tipos - Compatible con mockProducts.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId: string;
  stock: number;
  initialStock?: number;
  barcode?: string;
  sku: string;
  qrCode?: string;
  barcodeImage?: string;
  image?: string;
  images?: string[];
  isActive?: boolean;
  isPromotional?: boolean;
  promotionalPrice?: number;
  promotionalStartDate?: string;
  promotionalEndDate?: string;
  tags?: string[];
  isNew?: boolean;
  isPopular?: boolean;
  isOnSale?: boolean;
  rating?: number;
  reviews?: number;
  weight?: number;
  hasWeight?: boolean;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  discountPercentage?: number;
  currency?: string;
  promotionTitle?: string;
  promotionType?: 'percentage' | 'amount' | 'flash' | 'bogo' | 'bundle';
  promotionStartAt?: string;
  promotionEndAt?: string;
  promotionBadge?: string;
  promotionActionLabel?: string;
  promotionPriority?: number;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId?: string;
  stock: number;
  initialStock?: number;
  barcode?: string;
  sku?: string;
  qrCode?: string;
  image?: string;
  images?: string[];
  isActive?: boolean;
  isPromotional?: boolean;
  promotionalPrice?: number;
  promotionalStartDate?: string;
  promotionalEndDate?: string;
  tags?: string[];
  isNew?: boolean;
  isPopular?: boolean;
  isOnSale?: boolean;
  rating?: number;
  reviews?: number;
  weight?: number;
  hasWeight?: boolean;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  discountPercentage?: number;
  currency?: string;
  promotionTitle?: string;
  promotionType?: 'percentage' | 'amount' | 'flash' | 'bogo' | 'bundle';
  promotionStartAt?: string;
  promotionEndAt?: string;
  promotionBadge?: string;
  promotionActionLabel?: string;
  promotionPriority?: number;
  supplier?: string;
  costPrice?: number;
  location?: string;
  notes?: string;
  expiryDate?: string;
  parentId?: string; // ID del producto padre (para variantes)
  taxRate?: number; // Tasa de IVA (ej: 0.026 para 2.6%, 0.081 para 8.1%)
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id?: string;
}

export interface ProductFilters {
  category?: string;
  isActive?: boolean;
  isPromotional?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  total?: number;
}

// Tipo para datos que vienen del backend (pueden tener tipos inconsistentes)
interface RawProductData {
  [key: string]: unknown;
}

// Función helper para convertir valores booleanos del backend
const parseBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return false;
};

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
    
    // Crear AbortController para timeout
    // Si ya hay un signal en options, usar ese (React Query lo proporciona)
    const controller = options.signal ? null : new AbortController();
    const timeoutId = controller ? setTimeout(() => controller.abort(), 10000) : null;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Agregar token si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Agregar headers adicionales del options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }
    
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
    
    // Procesar los datos para asegurar tipos correctos
    if (data.data && Array.isArray(data.data)) {
      data.data = data.data.map((product: RawProductData) => ({
        ...product,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        originalPrice: product.originalPrice ? (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : product.originalPrice) : undefined,
        stock: typeof product.stock === 'string' ? parseInt(product.stock) : product.stock,
        initialStock: product.initialStock ? (typeof product.initialStock === 'string' ? parseInt(product.initialStock) : product.initialStock) : undefined,
        rating: product.rating ? (typeof product.rating === 'string' ? parseFloat(product.rating) : product.rating) : undefined,
        reviews: product.reviews ? (typeof product.reviews === 'string' ? parseInt(product.reviews) : product.reviews) : undefined,
        weight: product.weight ? (typeof product.weight === 'string' ? parseFloat(product.weight) : product.weight) : undefined,
        discountPercentage: product.discountPercentage ? (typeof product.discountPercentage === 'string' ? parseInt(product.discountPercentage) : product.discountPercentage) : undefined,
        promotionPriority: product.promotionPriority ? (typeof product.promotionPriority === 'string' ? parseInt(product.promotionPriority) : product.promotionPriority) : undefined,
        isActive: parseBoolean(product.isActive),
        isNew: parseBoolean(product.isNew),
        isPopular: parseBoolean(product.isPopular),
        isOnSale: parseBoolean(product.isOnSale),
        isPromotional: parseBoolean(product.isPromotional),
        hasWeight: parseBoolean(product.hasWeight),
        // Asegurar que categoryId existe
        categoryId: product.categoryId || (typeof product.category === 'string' ? product.category.toLowerCase().replace(/\s+/g, '-') : 'uncategorized'),
        // Asegurar que sku existe
        sku: product.sku || product.barcode || `SKU-${product.id}`,
        // Asegurar que tags es un array
        tags: Array.isArray(product.tags) ? product.tags : [],
        // Asegurar que images es un array y filtrar URLs vacías
        images: Array.isArray(product.images) 
          ? product.images.filter((img: unknown) => typeof img === 'string' && img.trim() !== '') 
          : (typeof product.image === 'string' && product.image.trim() !== '' ? [product.image] : []),
        // Asegurar que image no sea una cadena vacía
        image: typeof product.image === 'string' && product.image.trim() !== '' ? product.image : undefined,
      }));
    } else if (data.data && typeof data.data === 'object') {
      // Procesar producto individual
      const product = data.data;
      data.data = {
        ...product,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        originalPrice: product.originalPrice ? (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : product.originalPrice) : undefined,
        stock: typeof product.stock === 'string' ? parseInt(product.stock) : product.stock,
        initialStock: product.initialStock ? (typeof product.initialStock === 'string' ? parseInt(product.initialStock) : product.initialStock) : undefined,
        rating: product.rating ? (typeof product.rating === 'string' ? parseFloat(product.rating) : product.rating) : undefined,
        reviews: product.reviews ? (typeof product.reviews === 'string' ? parseInt(product.reviews) : product.reviews) : undefined,
        weight: product.weight ? (typeof product.weight === 'string' ? parseFloat(product.weight) : product.weight) : undefined,
        discountPercentage: product.discountPercentage ? (typeof product.discountPercentage === 'string' ? parseInt(product.discountPercentage) : product.discountPercentage) : undefined,
        promotionPriority: product.promotionPriority ? (typeof product.promotionPriority === 'string' ? parseInt(product.promotionPriority) : product.promotionPriority) : undefined,
        isActive: parseBoolean(product.isActive),
        isNew: parseBoolean(product.isNew),
        isPopular: parseBoolean(product.isPopular),
        isOnSale: parseBoolean(product.isOnSale),
        isPromotional: parseBoolean(product.isPromotional),
        hasWeight: parseBoolean(product.hasWeight),
        // Asegurar que categoryId existe
        categoryId: product.categoryId || (typeof product.category === 'string' ? product.category.toLowerCase().replace(/\s+/g, '-') : 'uncategorized'),
        // Asegurar que sku existe
        sku: product.sku || product.barcode || `SKU-${product.id}`,
        // Asegurar que tags es un array
        tags: Array.isArray(product.tags) ? product.tags : [],
        // Asegurar que images es un array y filtrar URLs vacías
        images: Array.isArray(product.images) 
          ? product.images.filter((img: unknown) => typeof img === 'string' && img.trim() !== '') 
          : (typeof product.image === 'string' && product.image.trim() !== '' ? [product.image] : []),
        // Asegurar que image no sea una cadena vacía
        image: typeof product.image === 'string' && product.image.trim() !== '' ? product.image : undefined,
      };
    }
    
    return data;
  } catch (error) {
    // Manejar error de timeout específicamente
    if (error instanceof Error && error.name === 'AbortError') {
      // Si el error no tiene mensaje, probablemente es una cancelación de React Query
      if (!error.message || error.message === 'signal is aborted without reason' || error.message.includes('aborted')) {
        // React Query canceló la petición, esto es normal - no loggear como error
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
    
    // Solo loggear errores que no sean cancelaciones
    console.error('Error en la llamada al backend:', error);
    
    return {
      success: false,
      error: handleApiError(error),
    };
  }
};

export class ProductService {
  /**
   * Obtener todos los productos
   */
  static async getProducts(
    filters?: ProductFilters,
    requestOptions?: { signal?: AbortSignal }
  ): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.isPromotional !== undefined) params.append('isPromotional', filters.isPromotional.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `${API_CONFIG.ENDPOINTS.PRODUCTS}?${queryString}` : API_CONFIG.ENDPOINTS.PRODUCTS;
    
    return makeRequest<Product[]>(endpoint, requestOptions);
  }

  /**
   * Obtener producto por ID
   */
  static async getProductById(id: string, requestOptions?: { signal?: AbortSignal }): Promise<ApiResponse<Product>> {
    return makeRequest<Product>(API_CONFIG.ENDPOINTS.PRODUCT_BY_ID(id), requestOptions);
  }

  /**
   * Obtener producto por código QR
   */
  static async getProductByQR(qrCode: string, requestOptions?: { signal?: AbortSignal }): Promise<ApiResponse<Product>> {
    return makeRequest<Product>(API_CONFIG.ENDPOINTS.PRODUCT_BY_QR(qrCode), requestOptions);
  }

  /**
   * Crear nuevo producto
   */
  static async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    return makeRequest<Product>(API_CONFIG.ENDPOINTS.PRODUCTS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Actualizar producto
   */
  static async updateProduct(id: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    return makeRequest<Product>(API_CONFIG.ENDPOINTS.PRODUCT_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Eliminar producto
   */
  static async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return makeRequest<void>(API_CONFIG.ENDPOINTS.PRODUCT_BY_ID(id), {
      method: 'DELETE',
    });
  }

  /**
   * Actualizar stock de producto
   */
  static async updateStock(id: string, quantity: number): Promise<ApiResponse<Product>> {
    return makeRequest<Product>(API_CONFIG.ENDPOINTS.PRODUCT_STOCK(id), {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  /**
   * Obtener estadísticas de productos
   */
  static async getStats(requestOptions?: { signal?: AbortSignal }): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    promotional: number;
    totalStock: number;
    categories: { [key: string]: number };
  }>> {
    return makeRequest(API_CONFIG.ENDPOINTS.PRODUCT_STATS, requestOptions);
  }
}