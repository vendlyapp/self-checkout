'use client'

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useScannedStoreStore } from '@/lib/stores/scannedStoreStore';
import HeaderNav from "@/components/navigation/HeaderNav";
import PaymentP from '@/components/user/PaymentP';

export default function StorePaymentPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { store, setStore } = useScannedStoreStore();

  // Cargar info de tienda si no está en el store
  useEffect(() => {
    if (!store && slug) {
      const loadStore = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/store/${slug}`);
          const result = await response.json();
          if (result.success) {
            setStore(result.data);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
      loadStore();
    }
  }, [slug, store, setStore]);

  return (
    <>
      <HeaderNav title="Bezahlung" />
      <PaymentP />
    </>
  );
}


