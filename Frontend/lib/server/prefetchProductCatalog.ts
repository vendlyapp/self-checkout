import { createClient } from '@/lib/supabase/server';
import { fetchProductList, PRODUCT_CATALOG_FILTERS } from '@/lib/api/productsApi';
import { catalogListQueryOpts } from '@/lib/catalog/catalogQueryOpts';
import { queryKeys } from '@/lib/queryKeys';
import type { Product } from '@/components/dashboard/products_list/data/mockProducts';

export type PrefetchProductCatalogResult = {
  products: Product[];
  queryKey: readonly unknown[];
};

/**
 * Prefetch del catálogo autenticado en el layout del dashboard (SSR).
 * Hidrata React Query antes del primer paint del cliente.
 */
export async function prefetchProductCatalog(): Promise<PrefetchProductCatalogResult | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  const userId = session?.user?.id;
  if (!token || !userId) return null;

  const result = await fetchProductList(token, PRODUCT_CATALOG_FILTERS);
  if (!result.ok) return null;

  return {
    products: result.data,
    queryKey: [...queryKeys.products.list(catalogListQueryOpts()), userId],
  };
}
