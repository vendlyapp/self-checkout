import { ReactNode } from 'react';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import DashboardLayoutClient from './DashboardLayoutClient';
import { prefetchMyStore } from '@/lib/server/prefetchMyStore';
import { prefetchProductCatalog } from '@/lib/server/prefetchProductCatalog';
import { prefetchRecentOrders } from '@/lib/server/prefetchRecentOrders';
import { prefetchProductStats } from '@/lib/server/prefetchProductStats';
import { prefetchTodayOrderStats } from '@/lib/server/prefetchOrderStats';
import { queryKeys } from '@/lib/queryKeys';
import { getLocalDateString } from '@/lib/utils';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  let storePrefetch: Awaited<ReturnType<typeof prefetchMyStore>> = null;
  let catalog: Awaited<ReturnType<typeof prefetchProductCatalog>> = null;
  let recent: Awaited<ReturnType<typeof prefetchRecentOrders>> = null;
  let productStats: Awaited<ReturnType<typeof prefetchProductStats>> = null;
  let todayStats: Awaited<ReturnType<typeof prefetchTodayOrderStats>> = null;

  try {
    storePrefetch = await prefetchMyStore();
    const ownerId = storePrefetch?.store.ownerId;

    [catalog, recent, productStats, todayStats] = await Promise.all([
      prefetchProductCatalog(),
      storePrefetch?.store.id
        ? prefetchRecentOrders(storePrefetch.store.id, 10)
        : Promise.resolve(null),
      prefetchProductStats(),
      ownerId ? prefetchTodayOrderStats(ownerId) : Promise.resolve(null),
    ]);

    if (todayStats && ownerId) {
      const today = getLocalDateString();
      queryClient.setQueryData(
        queryKeys.orders.goalRevenues(ownerId),
        {
          revenueToday: todayStats.stats.totalRevenue ?? 0,
          revenueWeek: 0,
          revenueMonth: 0,
        }
      );
    }
  } catch {
    // SSR soll nicht abstürzen wenn API/Env/CORS ausfallen
  }

  if (storePrefetch) {
    queryClient.setQueryData(storePrefetch.queryKey, storePrefetch.store);
  }
  if (catalog) {
    queryClient.setQueryData(catalog.queryKey, catalog.products);
  }
  if (recent) {
    queryClient.setQueryData(recent.queryKey, recent.orders);
  }
  if (productStats) {
    queryClient.setQueryData(productStats.queryKey, productStats.stats);
  }
  if (todayStats) {
    queryClient.setQueryData(todayStats.queryKey, todayStats.stats);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </HydrationBoundary>
  );
}
