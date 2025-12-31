import React, { useState, useEffect, useCallback, useMemo } from "react";
import ProductsList from "../dashboard/charge/ProductsList";
import { Product } from "../dashboard/products_list/data/mockProducts";
import { useCartStore } from "@/lib/stores/cartStore";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";
import { SearchInput } from "@/components/ui/search-input";
import { ScanBarcode, Store as StoreIcon, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCategories } from "@/hooks/queries/useCategories";
import { useStoreProducts } from "@/hooks/queries/useStoreProducts";
import { getIcon } from "../dashboard/products_list/data/iconMap";
import { FilterSlider, FilterOption } from "@/components/Sliders/SliderFIlter";

interface DashboardUserProps {
  onLoadingChange?: (isLoading: boolean) => void;
}

const DashboardUser = ({ onLoadingChange }: DashboardUserProps = {}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  const { addToCart } = useCartStore();
  const { store } = useScannedStoreStore();

  // Obtener categorías reales de la API
  const { data: categoriesData = [] } = useCategories();

  // Obtener productos de la tienda con cache inteligente
  const { 
    data: rawProducts = [], 
    isLoading: productsLoading,
    isFetching: productsFetching 
  } = useStoreProducts({ 
    slug: store?.slug || '', 
    enabled: !!store?.slug 
  });

  // Mensaje de estado
  const hasStore = !!store?.slug;
  const loading = productsLoading || productsFetching;

  // Función para agrupar productos padre-hijo
  const groupProductsWithVariants = useCallback((products: Product[]): Product[] => {
    // Separar productos padre (sin parentId) y variantes (con parentId)
    const parentProducts: Product[] = [];
    const variantsMap = new Map<string, Product[]>();

    products.forEach(product => {
      if (product.parentId) {
        // Es una variante
        if (!variantsMap.has(product.parentId)) {
          variantsMap.set(product.parentId, []);
        }
        variantsMap.get(product.parentId)!.push(product);
      } else {
        // Es un producto padre
        parentProducts.push(product);
      }
    });

    // Agregar variantes a sus productos padre
    return parentProducts.map(parent => {
      const variants = variantsMap.get(parent.id) || [];
      return {
        ...parent,
        variants: variants.length > 0 ? variants : undefined
      };
    });
  }, []);

  // Procesar productos cuando cambien (agrupar variantes)
  const allProducts = useMemo(() => {
    if (!rawProducts || rawProducts.length === 0) {
      return [];
    }
    return groupProductsWithVariants(rawProducts);
  }, [rawProducts, groupProductsWithVariants]);

  // Notificar cambios de loading al componente padre
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  // Calcular filtros de categorías con contadores dinámicos - Formato para FilterSlider
  const categoryFilters: FilterOption[] = useMemo(() => {
    if (!categoriesData || allProducts.length === 0) {
      return [];
    }

    const allProductsCount = allProducts.length;

    return [
      {
        id: 'all',
        label: 'Alle',
        icon: getIcon('ShoppingCart'),
        count: allProductsCount,
      },
      ...categoriesData
        .filter(cat => cat.isActive !== false)
        .map(cat => {
          const count = allProducts.filter(p => p.categoryId === cat.id).length;
          return {
            id: cat.id,
            label: cat.name,
            icon: getIcon(cat.icon || 'Package'),
            count: count,
          };
        })
    ];
  }, [categoriesData, allProducts]);

  // Aplicar filtros y búsqueda a los productos usando useMemo para evitar loops infinitos
  const products = useMemo(() => {
    if (!hasStore || allProducts.length === 0) {
      return [];
    }

    let filtered = [...allProducts];

    // Filtrar por categorías seleccionadas (si no está vacío y no incluye "all")
    const activeCategoryFilters = selectedFilters.filter(id => id !== 'all');
    if (activeCategoryFilters.length > 0) {
      filtered = filtered.filter((p: Product) =>
        activeCategoryFilters.includes(p.categoryId)
      );
    }

    // Filtrar por búsqueda (buscar en nombre del producto padre y en variantes)
    if (searchQuery && searchQuery.trim() !== "") {
      const queryLower = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((p: Product) => {
        // Buscar en nombre del producto padre
        const matchesParent = p.name.toLowerCase().includes(queryLower) ||
          (p.description && p.description.toLowerCase().includes(queryLower)) ||
          (p.sku && p.sku.toLowerCase().includes(queryLower)) ||
          (p.tags && p.tags.some(tag => tag.toLowerCase().includes(queryLower)));
        
        // Buscar en nombres de variantes
        const matchesVariant = p.variants?.some(variant => 
          variant.name.toLowerCase().includes(queryLower) ||
          (variant.description && variant.description.toLowerCase().includes(queryLower))
        );
        
        return matchesParent || matchesVariant;
      });
    }

    return filtered;
  }, [hasStore, allProducts, selectedFilters, searchQuery]);

  // Manejar búsqueda
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Manejar cambio de filtros - Compatible con FilterSlider
  const handleFilterChange = (filters: string[]) => {
    // Si se pasa un array vacío, establecer "all"
    if (filters.length === 0) {
      setSelectedFilters(['all']);
      return;
    }
    
    // Si se incluye "all", solo dejar "all"
    if (filters.includes('all')) {
      setSelectedFilters(['all']);
      return;
    }
    
    // Si no hay "all", usar los filtros seleccionados
    setSelectedFilters(filters);
  };

  // Manejar agregar al carrito
  const handleAddToCart = (product: Product, quantity: number) => {
    addToCart(product, quantity);
  };

  // Manejar escaneo QR
  const handleScanQR = () => {
    if (store?.slug) {
      router.push(`/store/${store.slug}/scan`);
    }
  };

  return (
    <div className="flex flex-col w-full bg-background-cream">
      {/* Header con información de la tienda */}
      <div className="bg-background-cream border-1 border-white pl-2 pr-2">
        <div className="flex items-center justify-between w-full px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex flex-col items-start justify-start flex-1 min-w-0">
              {/* Título de la tienda con color #111827 */}
              <p className="text-[#111827] font-bold text-[17px] truncate w-full">
                {store?.name || 'Heinigers Hofladen'}
              </p>
              {/* Ciudad y puntuación en la misma línea - formato: "8305 Ciudad • ⭐ 4.8" */}
              <p className="text-gray-600 text-[12px] mt-0.5 flex items-center gap-1 truncate w-full">
                <span>{store?.address || '8305 Dietlikon'}</span>
                <span className="text-gray-400">•</span>
                <span className="text-yellow-500">⭐</span>
                <span className="text-gray-500">4.8</span>
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end flex-shrink-0 ml-2">
            <button className="bg-white text-gray-500 px-4 py-1 rounded-lg hover:bg-gray-50 whitespace-nowrap transition-colors" 
                    style={{ minHeight: '35px' }}>
              Kontakt
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor de búsqueda y filtros - solo mostrar si la tienda está abierta */}
      {store && store.isOpen !== false && (
        <div className="bg-background-cream">
          {/* Barra de búsqueda y botón QR */}
          <div className="p-4 flex gap-4 items-center justify-center bg-background-cream">
            <div>
              <SearchInput
                placeholder="Produkte suchen..."
                className="flex-1 max-w-[260px] h-[54px]"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div>
              <button
                onClick={handleScanQR}
                className="bg-brand-500 cursor-pointer justify-center text-center text-white px-4 py-3 flex items-center text-[18px] font-semibold gap-2 rounded-[30px] w-[124px] h-[54px]"
                aria-label="QR Code scannen"
              >
                <ScanBarcode className="w-6 h-6" />
                <span className="text-[16px] text-center">Scan</span>
              </button>
            </div>
          </div>

          {/* Filtros de categorías - Slider horizontal como en otras pantallas */}
          {categoryFilters.length > 0 && (
            <div className="bg-background-cream border-b border-gray-100">
              <FilterSlider
                filters={categoryFilters}
                selectedFilters={selectedFilters.includes('all') ? [] : selectedFilters.filter(id => id !== 'all')}
                onFilterChange={handleFilterChange}
                showCount={true}
                multiSelect={true}
              />
            </div>
          )}
        </div>
      )}

      {/* Lista de productos - sin scroll propio ya que el layout lo maneja */}
      <div className="flex-1">
        {!store ? (
          // Sin tienda escaneada
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Kein Geschäft ausgewählt
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Scannen Sie den QR-Code eines Geschäfts, um die Produkte anzuzeigen
            </p>
            <button
              onClick={handleScanQR}
              className="flex items-center gap-3 px-6 py-3 bg-brand-500 text-white rounded-xl font-semibold"
            >
              <ScanBarcode className="w-5 h-5" />
              Jetzt scannen
            </button>
          </div>
        ) : store.isOpen === false ? (
          // Tienda cerrada
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-background-cream">
            <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Geschäft geschlossen
            </h2>
            <p className="text-gray-600 mb-2 text-lg max-w-md">
              Entschuldigung, {store.name} ist zur Zeit geschlossen
            </p>
            <p className="text-gray-500 mb-8 text-sm max-w-md">
              Bitte versuchen Sie es später erneut. Vielen Dank für Ihr Verständnis.
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 text-gray-700">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">
                  Wir sind derzeit nicht verfügbar
                </span>
              </div>
            </div>
          </div>
        ) : products.length === 0 && !loading ? (
          // Tienda sin productos o sin productos que coincidan con los filtros
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
              <StoreIcon className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {searchQuery || (selectedFilters.length > 0 && !selectedFilters.includes('all'))
                ? "Keine Produkte gefunden"
                : "Keine Produkte verfügbar"}
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              {searchQuery
                ? `Keine Produkte für "${searchQuery}" gefunden`
                : (selectedFilters.length > 0 && !selectedFilters.includes('all'))
                ? "Keine Produkte entsprechen den ausgewählten Filtern"
                : "Dieses Geschäft hat noch keine Produkte hinzugefügt"}
            </p>
            {(searchQuery || (selectedFilters.length > 0 && !selectedFilters.includes('all'))) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFilters(['all']);
                }}
                className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        ) : (
          // Mostrar productos
          <div>
            <ProductsList
              products={products}
              onAddToCart={handleAddToCart}
              loading={loading}
              searchQuery={searchQuery}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardUser;
