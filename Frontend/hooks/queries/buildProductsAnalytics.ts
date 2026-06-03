import { getAppQueryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import type { ProductsAnalyticsData, ProductData, CategoryData } from '@/components/dashboard/products/types';

function buildTrendData(total: number): number[] {
  const baseCount = Math.max(0, total - 6);
  const trendData: number[] = [];
  for (let i = 0; i < 7; i++) {
    trendData.push(baseCount + i);
  }
  trendData[6] = total;
  return trendData;
}

function countNewItems<T extends { isNew?: boolean; createdAt?: string }>(
  items: T[],
  days = 7
): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return items.filter((item) => {
    if (item.isNew) return true;
    if (item.createdAt) return new Date(item.createdAt) >= cutoff;
    return false;
  }).length;
}

/**
 * Build products analytics from React Query cache when sibling hooks already fetched data.
 */
export function buildProductsAnalyticsFromCache(): ProductsAnalyticsData | null {
  const qc = getAppQueryClient();
  if (!qc) return null;

  const productStats = qc.getQueryData<{ total?: number }>(queryKeys.products.stats());
  const categoryStats = qc.getQueryData<{ total?: number }>(queryKeys.categories.stats());
  const categories =
    (qc.getQueryData(queryKeys.categories.all()) as Array<{ createdAt?: string }> | undefined) ??
    [];

  const productQueries = qc.getQueriesData<unknown[]>({
    queryKey: queryKeys.products.all(),
  });
  const cachedProducts = productQueries
    .map(([, data]) => data)
    .find((data) => Array.isArray(data) && data.length > 0) as
    | Array<{ isNew?: boolean; createdAt?: string }>
    | undefined;

  const hasProducts =
    (cachedProducts?.length ?? 0) > 0 ||
    (productStats != null && (productStats.total ?? 0) > 0);
  const hasCategories =
    categories.length > 0 ||
    (categoryStats != null && (categoryStats.total ?? 0) > 0);

  // No devolver cache vacío (evita bloquear fetch real en producción)
  if (!hasProducts && !hasCategories) return null;

  const allProducts = cachedProducts ?? [];
  const totalProducts = productStats?.total ?? allProducts.length;
  const newProducts = countNewItems(allProducts);

  const productData: ProductData = {
    total: totalProducts,
    trend: newProducts > 0 ? 'up' : 'neutral',
    trendData: buildTrendData(totalProducts),
    newProducts,
  };

  const totalCategories = categoryStats?.total ?? categories.length;
  const newCategories = countNewItems(categories);

  const categoriesData: CategoryData = {
    total: totalCategories,
    trend: newCategories > 0 ? 'up' : 'neutral',
    trendData: buildTrendData(totalCategories),
    newCategories,
  };

  return {
    products: productData,
    categories: categoriesData,
    lastUpdated: new Date().toISOString(),
  };
}
