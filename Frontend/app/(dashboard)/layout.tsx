import { ReactNode } from 'react';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import DashboardLayoutClient from './DashboardLayoutClient';
import { prefetchMyStore } from '@/lib/server/prefetchMyStore';
import { prefetchProductCatalog } from '@/lib/server/prefetchProductCatalog';
import { queryKeys } from '@/lib/queryKeys';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  let store: Awaited<ReturnType<typeof prefetchMyStore>> = null;
  let catalog: Awaited<ReturnType<typeof prefetchProductCatalog>> = null;
  try {
    [store, catalog] = await Promise.all([prefetchMyStore(), prefetchProductCatalog()]);
  } catch {
    // SSR soll nicht abstürzen wenn API/Env/CORS ausfallen
  }

  if (store) {
    queryClient.setQueryData(queryKeys.myStore.all(), store);
  }
  if (catalog) {
    queryClient.setQueryData(catalog.queryKey, catalog.products);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </HydrationBoundary>
  );
}
