'use client'

import { useParams } from 'next/navigation';
import PaymentP from '@/components/user/PaymentP';
import { useStoreData } from '@/hooks/data/useStoreData';
import { usePaymentMethods } from '@/hooks/queries/usePaymentMethods';
import { DashboardLoadingState } from '@/components/ui/DashboardLoadingState';

export default function StorePaymentPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { store, isLoading: storeLoading } = useStoreData({ slug, autoLoad: true });
  const { isLoading: paymentMethodsLoading } = usePaymentMethods({
    storeId: store?.id || '',
    activeOnly: true,
  });

  const shouldShowPageLoader =
    storeLoading || !store || (!!store?.id && paymentMethodsLoading);

  if (shouldShowPageLoader) {
    return (
      <DashboardLoadingState
        mode="page"
        message="Bezahlung wird geladen..."
        className="animate-page-enter"
      />
    );
  }

  return (
    <>
      <PaymentP />
    </>
  );
}
