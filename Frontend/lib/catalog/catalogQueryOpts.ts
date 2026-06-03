import { PRODUCT_CATALOG_FILTERS } from '@/lib/api/productsApi';
import type { ProductFilters } from '@/lib/services/productService';

/** Misma forma que `filtersToQueryOpts` en useProducts (clave React Query estable). */
export function catalogListQueryOpts(filters: ProductFilters = PRODUCT_CATALOG_FILTERS) {
  return {
    category: filters.category,
    isActive: filters.isActive,
    includeInactive: filters.includeInactive,
    includeCodes: filters.includeCodes,
    catalog: filters.catalog,
    isPromotional: filters.isPromotional,
    search: filters.search,
    limit: filters.limit,
    offset: filters.offset,
  };
}
