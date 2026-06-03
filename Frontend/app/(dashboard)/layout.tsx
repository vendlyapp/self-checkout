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
import {
  prefetchOverallOrderStats,
  prefetchTodayOrderStats,
} from '@/lib/server/prefetchOrderStats';
import { prefetchOrdersList } from '@/lib/server/prefetchOrdersList';
import { queryKeys } from '@/lib/queryKeys';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  let storePrefetch: Awaited<ReturnType<typeof prefetchMyStore>> = null;
  let catalog: Awaited<ReturnType<typeof prefetchProductCatalog>> = null;
  let recentHome: Awaited<ReturnType<typeof prefetchRecentOrders>> = null;
  let recentSales: Awaited<ReturnType<typeof prefetchRecentOrders>> = null;
  let ordersList: Awaited<ReturnType<typeof prefetchOrdersList>> = null;
  let productStats: Awaited<ReturnType<typeof prefetchProductStats>> = null;
  let todayStats: Awaited<ReturnType<typeof prefetchTodayOrderStats>> = null;
  let overallStats: Awaited<ReturnType<typeof prefetchOverallOrderStats>> = null;

  try {
    storePrefetch = await prefetchMyStore();
    const storeId = storePrefetch?.store.id;
    const ownerId = storePrefetch?.store.ownerId;

    [catalog, recentHome, recentSales, ordersList, productStats, todayStats, overallStats] =
      await Promise.all([
        prefetchProductCatalog(),
        storeId ? prefetchRecentOrders(storeId, 10) : Promise.resolve(null),
        storeId ? prefetchRecentOrders(storeId, 100) : Promise.resolve(null),
        storeId ? prefetchOrdersList(storeId, { limit: 100, offset: 0 }) : Promise.resolve(null),
        prefetchProductStats(),
        ownerId ? prefetchTodayOrderStats(ownerId) : Promise.resolve(null),
        ownerId ? prefetchOverallOrderStats(ownerId) : Promise.resolve(null),
      ]);

    if (todayStats && ownerId) {
      queryClient.setQueryData(queryKeys.orders.goalRevenues(ownerId), {
        revenueToday: todayStats.stats.totalRevenue ?? 0,
        revenueWeek: 0,
        revenueMonth: 0,
      });
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
  if (recentHome) {
    queryClient.setQueryData(recentHome.queryKey, recentHome.orders);
  }
  if (recentSales) {
    queryClient.setQueryData(recentSales.queryKey, recentSales.orders);
  }
  if (ordersList) {
    queryClient.setQueryData(ordersList.queryKey, ordersList.orders);
  }
  if (productStats) {
    queryClient.setQueryData(productStats.queryKey, productStats.stats);
  }
  if (todayStats) {
    queryClient.setQueryData(todayStats.queryKey, todayStats.stats);
  }
  if (overallStats) {
    queryClient.setQueryData(overallStats.queryKey, overallStats.stats);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </HydrationBoundary>
  );
}
