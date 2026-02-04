'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/lib/contexts/UserContext';
import { useMyStore } from '@/hooks/queries/useMyStore';

const STORE_SETTINGS_PATH = '/store/settings';

/**
 * Redirige a administradores de tienda (ADMIN) cuya tienda no ha completado
 * la configuración inicial a /store/settings.
 */
export const StoreOnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useUser();
  const { data: store, isLoading: storeLoading } = useMyStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (profile?.role !== 'ADMIN') return;
    if (storeLoading || !store) return;

    const mustCompleteSettings =
      store && (store.settingsCompletedAt == null || store.settingsCompletedAt === '');
    const isOnSettingsPage = pathname === STORE_SETTINGS_PATH;

    if (mustCompleteSettings && !isOnSettingsPage) {
      router.replace(STORE_SETTINGS_PATH);
    }
  }, [profile?.role, store, storeLoading, pathname, router]);

  return <>{children}</>;
};
