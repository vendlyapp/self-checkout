import { buildApiUrl } from '@/lib/config/api';

export interface DiscountCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_redemptions: number;
  current_redemptions: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  archived?: boolean;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CreateDiscountCodeRequest {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxRedemptions: number;
  validFrom: string;
  validUntil?: string | null;
  isActive?: boolean;
}

export interface UpdateDiscountCodeRequest {
  code?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  maxRedemptions?: number;
  validFrom?: string;
  validUntil?: string | null;
  isActive?: boolean;
}

export interface DiscountCodeStats {
  total: number;
  active: number;
  inactive: number;
  archived?: number;
}

const getAuthHeaders = async () => {
  try {
    // Obtener token de Supabase
    const { supabase } = await import('@/lib/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  } catch (error) {
    console.error('Error al obtener token de autenticación:', error);
    return {
      'Content-Type': 'application/json',
    };
  }
};

export const discountCodeService = {
  /**
   * Obtiene todos los códigos de descuento del usuario
   */
  async getAll(): Promise<DiscountCode[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(buildApiUrl('/api/discount-codes'), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Error al obtener códigos de descuento: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error en getAll discount codes:', error);
      throw error;
    }
  },

  /**
   * Obtiene un código de descuento por ID
   */
  async getById(id: string): Promise<DiscountCode> {
    const headers = await getAuthHeaders();
    const response = await fetch(buildApiUrl(`/api/discount-codes/${id}`), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener el código de descuento');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Valida un código de descuento
   */
  async validateCode(code: string): Promise<DiscountCode> {
    const headers = await getAuthHeaders();
    const response = await fetch(buildApiUrl(`/api/discount-codes/validate/${code}`), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Código de descuento inválido');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Crea un nuevo código de descuento
   */
  async create(data: CreateDiscountCodeRequest): Promise<DiscountCode> {
    const headers = await getAuthHeaders();
    const response = await fetch(buildApiUrl('/api/discount-codes'), {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear el código de descuento');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Actualiza un código de descuento
   */
  async update(id: string, data: UpdateDiscountCodeRequest): Promise<DiscountCode> {
    const headers = await getAuthHeaders();
    const response = await fetch(buildApiUrl(`/api/discount-codes/${id}`), {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar el código de descuento');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Archiva un código de descuento (en lugar de eliminarlo)
   */
  async archive(id: string): Promise<DiscountCode> {
    const headers = await getAuthHeaders();
    const response = await fetch(buildApiUrl(`/api/discount-codes/${id}`), {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al archivar el código de descuento');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Elimina un código de descuento (solo para casos especiales)
   */
  async delete(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(buildApiUrl(`/api/discount-codes/${id}`), {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al eliminar el código de descuento');
    }
  },

  /**
   * Obtiene todos los códigos archivados
   */
  async getArchived(): Promise<DiscountCode[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(buildApiUrl('/api/discount-codes/archived'), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Error al obtener códigos archivados: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error en getArchived discount codes:', error);
      throw error;
    }
  },

  /**
   * Obtiene estadísticas de códigos de descuento
   */
  async getStats(): Promise<DiscountCodeStats> {
    const headers = await getAuthHeaders();
    const response = await fetch(buildApiUrl('/api/discount-codes/stats'), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener estadísticas');
    }

    const result = await response.json();
    return result.data;
  },
};

