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
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = usePaymentMethods({
    storeId: store?.id || '',
    activeOnly: true,
  });

  // Solo bloquear si no hay datos en absoluto — layout ya prefetcheó, esto es instantáneo en visitas normales
  const shouldShowPageLoader =
    (storeLoading && !store) || (!!store?.id && paymentMethodsLoading && paymentMethods.length === 0);

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
