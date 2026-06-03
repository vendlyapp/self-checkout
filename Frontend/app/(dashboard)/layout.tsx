import { ReactNode } from 'react';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import DashboardLayoutClient from './DashboardLayoutClient';
import { prefetchMyStore } from '@/lib/server/prefetchMyStore';
import { queryKeys } from '@/lib/queryKeys';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  const store = await prefetchMyStore();

  if (store) {
    queryClient.setQueryData(queryKeys.myStore.all(), store);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </HydrationBoundary>
  );
}
