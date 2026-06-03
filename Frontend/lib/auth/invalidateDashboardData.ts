import { getAppQueryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';

/** Fuerza recarga de datos del dashboard tras login o refresh de token. */
export function invalidateDashboardData(): void {
  const qc = getAppQueryClient();
  if (!qc) return;
  qc.invalidateQueries({ queryKey: ['products'] });
  qc.invalidateQueries({ queryKey: queryKeys.categories.all() });
  qc.invalidateQueries({ queryKey: queryKeys.myStore.all() });
  qc.invalidateQueries({ queryKey: ['recentOrders'] });
  qc.invalidateQueries({ queryKey: ['orderStats'] });
  qc.invalidateQueries({ queryKey: queryKeys.products.analytics() });
  qc.invalidateQueries({ queryKey: queryKeys.products.stats() });
  qc.invalidateQueries({ queryKey: queryKeys.categories.stats() });

  // Evitar mostrar analytics con total 0 guardado tras un fallo anterior
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('products-analytics-storage');
    } catch {
      /* noop */
    }
  }
}
