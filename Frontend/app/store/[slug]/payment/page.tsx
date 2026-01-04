'use client'

import { useParams } from 'next/navigation';
import PaymentP from '@/components/user/PaymentP';
import { useStoreData } from '@/hooks/data/useStoreData';

export default function StorePaymentPage() {
  const params = useParams();
  const slug = params.slug as string;
  useStoreData({ slug, autoLoad: true });

  return (
    <>
      <PaymentP />
    </>
  );
}
