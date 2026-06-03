import type { ProductsAnalyticsData } from '@/components/dashboard/products/types';
import type { ProductStatsData } from '@/lib/server/prefetchProductStats';
import type { CategoryStatsData } from '@/lib/server/prefetchCategoryStats';

function buildTrendData(total: number): number[] {
  const base = Math.max(0, total - 6);
  return [base, base + 1, base + 2, base + 3, base + 4, base + 5, total];
}

/** Snapshot ligero para hidratar /products sin esperar el hook pesado. */
export function buildProductsAnalyticsSnapshot(
  productStats: ProductStatsData,
  categoryStats: CategoryStatsData
): ProductsAnalyticsData {
  const productsTotal = productStats.total ?? 0;
  const categoriesTotal = categoryStats.total ?? 0;

  return {
    products: {
      total: productsTotal,
      trend: 'neutral',
      trendData: buildTrendData(productsTotal),
      newProducts: 0,
    },
    categories: {
      total: categoriesTotal,
      trend: 'neutral',
      trendData: buildTrendData(categoriesTotal),
      newCategories: 0,
    },
    lastUpdated: new Date().toISOString(),
  };
}
