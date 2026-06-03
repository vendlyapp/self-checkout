'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useMyStore } from '@/hooks/queries/useMyStore';

/** storeId + ownerId para queries scoped al comercio autenticado. */
export function useStoreQueryScope() {
  const { session, loading: authLoading } = useAuth();
  const { data: store } = useMyStore();

  const storeId = store?.id;
  const ownerId =
    store?.ownerId ??
    (store as { ownerid?: string } | undefined)?.ownerid ??
    session?.user?.id;

  const enabled = !authLoading && !!session?.access_token && !!storeId;

  return { storeId, ownerId, enabled, authLoading };
}

/** Skeleton solo en la primera carga (no en refetch en background). */
export function isInitialQueryLoading(
  isFetched: boolean,
  isFetching: boolean
): boolean {
  return !isFetched && isFetching;
}
