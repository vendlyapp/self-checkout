import type { Product } from '@/components/dashboard/products_list/data/mockProducts';
import type { CatalogFilterChip } from '@/components/dashboard/products_list/Filter_Busqueda';

interface CategoryLike {
  id: string;
  name: string;
  isActive?: boolean;
}

/** Nur aktive Produkte (Kasse / Verkauf) */
export function filterActiveProducts(products: Product[]): Product[] {
  return products.filter((p) => p.isActive !== false);
}

export function buildChargeFilterChips(
  categories: CategoryLike[],
  activeProducts: Product[]
): CatalogFilterChip[] {
  if (activeProducts.length === 0) {
    return [{ id: 'all', label: 'Alle', count: 0 }];
  }

  const chips: CatalogFilterChip[] = [
    { id: 'all', label: 'Alle', count: activeProducts.length },
  ];

  categories
    .filter((cat) => cat.isActive !== false)
    .forEach((cat) => {
      const count = activeProducts.filter((p) => p.categoryId === cat.id).length;
      if (count > 0) chips.push({ id: cat.id, label: cat.name, count });
    });

  const newCount = activeProducts.filter((p) => p.isNew).length;
  const popularCount = activeProducts.filter((p) => p.isPopular).length;
  const saleCount = activeProducts.filter((p) => p.isOnSale).length;
  const promotionsCount = activeProducts.filter((p) => p.isOnSale || p.originalPrice).length;

  if (newCount > 0) chips.push({ id: 'new', label: 'Neu', count: newCount });
  if (popularCount > 0) chips.push({ id: 'popular', label: 'Beliebt', count: popularCount });
  if (saleCount > 0) chips.push({ id: 'sale', label: 'Angebot', count: saleCount });
  if (promotionsCount > 0) chips.push({ id: 'promotions', label: 'Aktionen', count: promotionsCount });

  return chips;
}
