'use client'

import { useParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
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
  const hasLoadedRef = useRef(false);
  const previousSlugRef = useRef<string | null>(null);

  // Cargar información de la tienda solo una vez cuando el slug cambia
  // Optimizado para evitar doble carga y animaciones duplicadas
  useEffect(() => {
    if (!slug) return;

    // Solo ejecutar si el slug realmente cambió
    if (previousSlugRef.current === slug) {
      return;
    }

    previousSlugRef.current = slug;
    let isMounted = true;

    const loadStore = async () => {
      try {
        // Cambiar al carrito de esta tienda primero (importante hacerlo primero)
        setCurrentStore(slug);

        // Verificar si ya tenemos la tienda correcta cargada
        if (store && store.slug === slug) {
          // Ya tenemos la tienda correcta, no necesitamos hacer fetch
          return;
        }

        // Cargar información de la tienda solo si no la tenemos o es diferente
        const url = buildApiUrl(`/api/store/${slug}`);
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success && isMounted) {
          // Guardar información completa de la tienda
          const storeData = {
            id: result.data.id,
            name: result.data.name,
            slug: result.data.slug,
            logo: result.data.logo,
            isOpen: result.data.isOpen,
            isActive: result.data.isActive,
          };
          setStore(storeData);
        }
      } catch (error) {
        console.error('Error loading store:', error);
      }
    };

    loadStore();

    return () => {
      isMounted = false;
    };
  }, [slug, store?.slug, setStore, setCurrentStore]); // Incluir store.slug para verificar si cambió

  return (
    <>
      <HeaderNav title="Bezahlung" />
      <PaymentP />
    </>
  );
}
