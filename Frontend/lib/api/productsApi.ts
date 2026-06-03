import { API_CONFIG, buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import type { ProductFilters } from '@/lib/services/productService';
import type { Product } from '@/components/dashboard/products_list/data/mockProducts';

/** Opciones compartidas Kasse + Produktliste (misma query key en React Query). */
export const PRODUCT_CATALOG_FILTERS: ProductFilters = {
  includeInactive: true,
  catalog: true,
};

function buildProductsQueryString(filters?: ProductFilters): string {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters?.includeInactive === true) params.append('includeInactive', 'true');
  if (filters?.catalog === true) params.append('catalog', 'true');
  if (filters?.includeCodes === true) params.append('includeCodes', 'true');
  if (filters?.isPromotional !== undefined) params.append('isPromotional', String(filters.isPromotional));
  if (filters?.search) params.append('search', filters.search);
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.offset) params.append('offset', String(filters.offset));
  return params.toString();
}

export type FetchProductListResult =
  | { ok: true; data: Product[]; count: number }
  | { ok: false; error: string; status?: number };

/**
 * Lista de productos del comercio autenticado (requiere Bearer token).
 * Mismo patrón que useMyStore — sin capas extra que cancelen o pierdan el token.
 */
export async function fetchProductList(
  accessToken: string,
  filters?: ProductFilters,
  signal?: AbortSignal
): Promise<FetchProductListResult> {
  const qs = buildProductsQueryString(filters);
  const path = qs
    ? `${API_CONFIG.ENDPOINTS.PRODUCTS}?${qs}`
    : API_CONFIG.ENDPOINTS.PRODUCTS;

  const controller = signal ? null : new AbortController();
  const timeoutId = controller
    ? setTimeout(() => controller.abort(), 30_000)
    : null;

  try {
    const response = await fetch(buildApiUrl(path), {
      method: 'GET',
      headers: getAuthHeaders(accessToken, true),
      signal: signal ?? controller?.signal,
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
    });

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error:
          (json as { error?: string }).error ||
          `Produkte HTTP ${response.status}`,
      };
    }

    if (!(json as { success?: boolean }).success || !Array.isArray((json as { data?: unknown }).data)) {
      return {
        ok: false,
        error: (json as { error?: string }).error || 'Ungültige Produktantwort',
      };
    }

    return {
      ok: true,
      data: (json as { data: Product[] }).data,
      count: (json as { count?: number }).count ?? (json as { data: Product[] }).data.length,
    };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { ok: false, error: 'Request cancelled' };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Netzwerkfehler beim Laden der Produkte',
    };
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
