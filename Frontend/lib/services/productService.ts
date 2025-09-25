/**
 * Servicio de API para productos
 * Maneja la comunicación con el backend
 */

import { Product } from '@/components/dashboard/products_list/data/mockProducts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId: string;
  stock: number;
  initialStock?: number;
  barcode?: string;
  sku?: string;
  tags?: string[];
  isNew?: boolean;
  isActive?: boolean;
  rating?: number;
  reviews?: number;
  weight?: number;
  hasWeight?: boolean;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  currency?: string;
  supplier?: string;
  costPrice?: number;
  margin?: number;
  taxRate?: number;
  expiryDate?: string;
  location?: string;
  notes?: string;
  promotionTitle?: string;
  promotionType?: 'percentage' | 'amount' | 'flash' | 'bogo' | 'bundle';
  promotionBadge?: string;
  promotionActionLabel?: string;
  promotionPriority?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ProductService {
  /**
   * Crear un nuevo producto
   * El backend generará automáticamente el ID y código QR
   */
  static async createProduct(data: CreateProductRequest): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Agregar token de autenticación aquí
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear producto');
      }

      const result: ApiResponse<Product> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al crear producto');
      }

      return result.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Obtener productos con filtros
   */
  static async getProducts(filters?: {
    search?: string;
    categoryId?: string;
    isActive?: boolean;
    isOnSale?: boolean;
    page?: number;
    limit?: number;
  }): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters?.isOnSale !== undefined) params.append('isOnSale', filters.isOnSale.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/api/products?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener productos');
      }

      const result: ApiResponse<Product[]> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al obtener productos');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Obtener producto por ID
   */
  static async getProductById(id: string): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Producto no encontrado');
      }

      const result: ApiResponse<Product> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Producto no encontrado');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }

  /**
   * Obtener producto por código QR
   */
  static async getProductByQr(qrCode: string): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/qr/${qrCode}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Producto no encontrado');
      }

      const result: ApiResponse<Product> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Producto no encontrado');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching product by QR:', error);
      throw error;
    }
  }

  /**
   * Actualizar producto
   */
  static async updateProduct(id: string, data: Partial<CreateProductRequest>): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Agregar token de autenticación aquí
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar producto');
      }

      const result: ApiResponse<Product> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al actualizar producto');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Eliminar producto (soft delete)
   */
  static async deleteProduct(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          // TODO: Agregar token de autenticación aquí
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar producto');
      }

      const result: ApiResponse<void> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al eliminar producto');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Actualizar stock de producto
   */
  static async updateStock(id: string, quantity: number): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Agregar token de autenticación aquí
        },
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar stock');
      }

      const result: ApiResponse<Product> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al actualizar stock');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }
}
