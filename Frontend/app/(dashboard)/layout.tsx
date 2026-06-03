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

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  let storePrefetch: Awaited<ReturnType<typeof prefetchMyStore>> = null;
  let catalog: Awaited<ReturnType<typeof prefetchProductCatalog>> = null;
  let recent: Awaited<ReturnType<typeof prefetchRecentOrders>> = null;

  try {
    storePrefetch = await prefetchMyStore();
    [catalog, recent] = await Promise.all([
      prefetchProductCatalog(),
      storePrefetch?.store.id
        ? prefetchRecentOrders(storePrefetch.store.id, 10)
        : Promise.resolve(null),
    ]);
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

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </HydrationBoundary>
  );
}
