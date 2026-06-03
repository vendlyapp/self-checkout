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

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = await getAuthHeaders();
  const { createRequestSignal } = await import('@/lib/http/fetchWithTimeout');
  const { signal: optionsSignal, ...restOptions } = options;
  const { signal, cleanup } = createRequestSignal(optionsSignal ?? undefined);

  try {
    return await fetch(buildApiUrl(endpoint), {
      ...restOptions,
      headers: {
        ...headers,
        ...(restOptions.headers as Record<string, string> | undefined),
      },
      signal,
    });
  } finally {
    cleanup();
  }
}

export const discountCodeService = {
  async getAll(requestOptions?: { signal?: AbortSignal }): Promise<DiscountCode[]> {
    const response = await fetchWithAuth('/api/discount-codes', {
      method: 'GET',
      signal: requestOptions?.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Fehler beim Laden der Rabattcodes: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  },

  async getById(id: string, requestOptions?: { signal?: AbortSignal }): Promise<DiscountCode> {
    const response = await fetchWithAuth(`/api/discount-codes/${id}`, {
      method: 'GET',
      signal: requestOptions?.signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Fehler beim Laden des Rabattcodes');
    }

    const result = await response.json();
    return result.data;
  },

  async validateCode(code: string, storeId?: string): Promise<DiscountCode> {
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const authHeaders = await getAuthHeaders();
      headers = authHeaders as Record<string, string>;
    } catch {
      // endpoint puede ser público
    }

    let url = `/api/discount-codes/validate/${encodeURIComponent(code)}`;
    if (storeId) {
      url += `?storeId=${encodeURIComponent(storeId)}`;
    }

    const { createRequestSignal } = await import('@/lib/http/fetchWithTimeout');
    const { signal, cleanup } = createRequestSignal(undefined);

    try {
      const response = await fetch(buildApiUrl(url), {
        method: 'GET',
        headers,
        signal,
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
    } finally {
      cleanup();
    }
  },

  async create(data: CreateDiscountCodeRequest): Promise<DiscountCode> {
    const response = await fetchWithAuth('/api/discount-codes', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Fehler beim Erstellen des Rabattcodes');
    }

    const result = await response.json();
    return result.data;
  },

  async update(id: string, data: UpdateDiscountCodeRequest): Promise<DiscountCode> {
    const response = await fetchWithAuth(`/api/discount-codes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Fehler beim Aktualisieren des Rabattcodes');
    }

    const result = await response.json();
    return result.data;
  },

  async archive(id: string): Promise<DiscountCode> {
    const response = await fetchWithAuth(`/api/discount-codes/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Fehler beim Archivieren des Rabattcodes');
    }

    const result = await response.json();
    return result.data;
  },

  async delete(id: string): Promise<void> {
    const response = await fetchWithAuth(`/api/discount-codes/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Fehler beim Löschen des Rabattcodes');
    }
  },

  async getArchived(requestOptions?: { signal?: AbortSignal }): Promise<DiscountCode[]> {
    const response = await fetchWithAuth('/api/discount-codes/archived', {
      method: 'GET',
      signal: requestOptions?.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Fehler beim Laden der archivierten Codes: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  },

  async getStats(requestOptions?: { signal?: AbortSignal }): Promise<DiscountCodeStats> {
    const response = await fetchWithAuth('/api/discount-codes/stats', {
      method: 'GET',
      signal: requestOptions?.signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Fehler beim Laden der Statistiken');
    }

    const result = await response.json();
    return result.data;
  },
};
