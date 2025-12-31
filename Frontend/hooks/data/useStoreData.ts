import { useEffect, useRef, useState } from 'react';
import { useScannedStoreStore, type StoreInfo } from '@/lib/stores/scannedStoreStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { buildApiUrl } from '@/lib/config/api';

interface UseStoreDataOptions {
  slug?: string;
  autoLoad?: boolean;
}

interface UseStoreDataReturn {
  store: StoreInfo | null;
  isLoading: boolean;
  error: string | null;
  loadStore: () => Promise<void>;
}

/**
 * Hook compartido para cargar y gestionar datos de tienda
 * Unifica la lógica de carga de tienda en un solo lugar
 */
export const useStoreData = (
  options: UseStoreDataOptions = {}
): UseStoreDataReturn => {
  const { slug, autoLoad = true } = options;
  const { store, setStore } = useScannedStoreStore();
  const { setCurrentStore } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousSlugRef = useRef<string | null>(null);

  const loadStore = async () => {
    if (!slug) {
      setError('No se proporcionó un slug de tienda');
      return;
    }

    // Evitar cargar la misma tienda dos veces
    if (previousSlugRef.current === slug && store?.slug === slug) {
      return;
    }

    setIsLoading(true);
    setError(null);
    previousSlugRef.current = slug;

    try {
      // Cambiar al carrito de esta tienda primero
      setCurrentStore(slug);

      // Verificar si ya tenemos la tienda correcta cargada
      if (store && store.slug === slug) {
        setIsLoading(false);
        return;
      }

      // Cargar información de la tienda
      const url = buildApiUrl(`/api/store/${slug}`);
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        const storeData = {
          id: result.data.id,
          name: result.data.name,
          slug: result.data.slug,
          logo: result.data.logo,
          isOpen: result.data.isOpen,
          isActive: result.data.isActive,
          address: result.data.address || null,
          phone: result.data.phone || null,
          email: result.data.email || null,
          description: result.data.description || null,
        };
        setStore(storeData);
        setError(null);
      } else {
        setError(result.error || 'Error al cargar la tienda');
      }
    } catch (err) {
      console.error('Error loading store:', err);
      setError('Error al cargar la tienda');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad && slug) {
      loadStore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, autoLoad]);

  return {
    store,
    isLoading,
    error,
    loadStore,
  };
};

