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
  } catch {
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
        throw new Error(error.error || `Fehler beim Laden der Rabattcodes: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
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
      throw new Error(error.error || 'Fehler beim Laden des Rabattcodes');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Valida un código de descuento
   * Este endpoint puede ser usado sin autenticación para que usuarios puedan validar códigos
   * @param code - Código de descuento a validar
   * @param storeId - ID de la tienda (opcional, para validar que el código pertenezca a esa tienda)
   */
  async validateCode(code: string, storeId?: string): Promise<DiscountCode> {
    try {
      // Intentar obtener headers con auth, pero no es crítico si falla
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      try {
        const authHeaders = await getAuthHeaders();
        headers = authHeaders;
      } catch {
        // Si no hay auth, continuar sin token (endpoint puede ser público)
      }

      // Construir URL con query parameter storeId si se proporciona
      let url = `/api/discount-codes/validate/${encodeURIComponent(code)}`;
      if (storeId) {
        url += `?storeId=${encodeURIComponent(storeId)}`;
      }

      const response = await fetch(buildApiUrl(url), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Fehler beim Validieren des Codes' }));
        throw new Error(error.error || 'Ungültiger Rabattcode');
      }

      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Ungültiger Rabattcode');
      }
      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unbekannter Fehler beim Validieren des Rabattcodes');
    }
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
      throw new Error(error.error || 'Fehler beim Erstellen des Rabattcodes');
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
      throw new Error(error.error || 'Fehler beim Aktualisieren des Rabattcodes');
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
      throw new Error(error.error || 'Fehler beim Archivieren des Rabattcodes');
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
      throw new Error(error.error || 'Fehler beim Löschen des Rabattcodes');
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
        throw new Error(error.error || `Fehler beim Laden der archivierten Codes: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
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
      throw new Error(error.error || 'Fehler beim Laden der Statistiken');
    }

    const result = await response.json();
    return result.data;
  },
};

