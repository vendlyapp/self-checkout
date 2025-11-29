'use client'

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useScannedStoreStore } from '@/lib/stores/scannedStoreStore';
import { useCartStore } from '@/lib/stores/cartStore';
import HeaderNav from "@/components/navigation/HeaderNav";
import PaymentP from '@/components/user/PaymentP';
import { buildApiUrl } from '@/lib/config/api';

export default function StorePaymentPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { store, setStore } = useScannedStoreStore();
  const { setCurrentStore } = useCartStore();

  // Cargar info de tienda y cambiar carrito
  useEffect(() => {
    const loadStore = async () => {
      try {
        // Cambiar al carrito de esta tienda
        setCurrentStore(slug);
        
        // Cargar info si no está
        if (!store || store.slug !== slug) {
          const url = buildApiUrl(`/api/store/${slug}`);
          const response = await fetch(url);
          const result = await response.json();
          if (result.success) {
            setStore(result.data);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    loadStore();
  }, [slug, store, setStore, setCurrentStore]);

  return (
    <>
      <HeaderNav title="Bezahlung" />
      <PaymentP />
    </>
  );
}
