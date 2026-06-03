'use client';

import { ReactNode, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/lib/auth/AuthContext';
import { fetchProductList, PRODUCT_CATALOG_FILTERS } from '@/lib/api/productsApi';
import { catalogListQueryOpts } from '@/lib/catalog/catalogQueryOpts';
import { queryKeys } from '@/lib/queryKeys';
import { AuthGuard } from '@/lib/guards/AuthGuard';
import { UserProvider } from '@/lib/contexts/UserContext';
import { StoreOnboardingGuard } from '@/lib/guards/StoreOnboardingGuard';
import { LoadingProductsModalProvider } from '@/lib/contexts/LoadingProductsModalContext';
import { SessionTimeoutManager } from '@/components/auth/SessionTimeoutManager';
import { StoreSettingsHeaderProvider } from '@/lib/contexts/StoreSettingsHeaderContext';
import { Toaster } from 'sonner';

export default function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    const token = session?.access_token;
    const userId = session?.user?.id;
    if (authLoading || !token || !userId) return;

    const queryKey = [...queryKeys.products.list(catalogListQueryOpts()), userId];
    const cached = queryClient.getQueryData<unknown[]>(queryKey);
    if (cached !== undefined) return;

    void queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const result = await fetchProductList(token, PRODUCT_CATALOG_FILTERS);
        if (!result.ok) throw new Error(result.error);
        return result.data;
      },
      staleTime: 10 * 60 * 1000,
    });
  }, [authLoading, session?.access_token, session?.user?.id, queryClient]);

  return (
    <UserProvider>
      <AuthGuard allowedRoles={['ADMIN']}>
        <StoreOnboardingGuard>
          <LoadingProductsModalProvider>
            <StoreSettingsHeaderProvider>
              <SessionTimeoutManager />
              <AdminLayout>
                <div className="min-w-0">{children}</div>
              </AdminLayout>
              <Toaster
                position="top-center"
                richColors
                offset={16}
                toastOptions={{
                  classNames: {
                    toast: '!rounded-2xl !shadow-card !border-0 !text-sm !font-medium',
                    title: '!font-semibold',
                    description: '!text-xs !opacity-80',
                  },
                }}
              />
            </StoreSettingsHeaderProvider>
          </LoadingProductsModalProvider>
        </StoreOnboardingGuard>
      </AuthGuard>
    </UserProvider>
  );
}
