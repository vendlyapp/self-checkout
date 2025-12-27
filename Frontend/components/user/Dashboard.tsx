import React, { useState, useEffect, useCallback, useMemo } from "react";
import ProductsList from "../dashboard/charge/ProductsList";
import { Product, normalizeProductData } from "../dashboard/products_list/data/mockProducts";
import { useCartStore } from "@/lib/stores/cartStore";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";
import { SearchInput } from "@/components/ui/search-input";
import { ScanBarcode, Store as StoreIcon, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/config/api";
import { useCategories } from "@/hooks/queries/useCategories";
import { getIcon } from "../dashboard/products_list/data/iconMap";
import { FilterSlider, FilterOption } from "@/components/Sliders/SliderFIlter";

const DashboardUser = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();
  const { store } = useScannedStoreStore();

  // Obtener categorías reales de la API
  const { data: categoriesData = [] } = useCategories();

  // Mensaje de estado
  const hasStore = !!store?.slug;

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

  // Cargar productos iniciales
  const loadInitialProducts = useCallback(async () => {
    setLoading(true);
    try {
      if (!store?.slug) {
        // Sin tienda escaneada, no mostrar nada
        setProducts([]);
        setAllProducts([]);
        setLoading(false);
        return;
      }

      // Cargar productos de la tienda desde la API
      const url = buildApiUrl(`/api/store/${store.slug}/products`);
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success && result.data) {
        // Normalizar productos usando la función de normalización
        const normalizedProducts = result.data.map((p: unknown) => normalizeProductData(p as Product));
        
        // Agrupar productos con variantes (solo mostrar productos padre)
        const groupedProducts = groupProductsWithVariants(normalizedProducts);
        
        setAllProducts(groupedProducts);
        // Los productos filtrados se aplicarán automáticamente en el useEffect de applyFiltersAndSearch
      } else {
        setProducts([]);
        setAllProducts([]);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setProducts([]);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  }, [store?.slug]); // Removido groupProductsWithVariants de las dependencias

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

  // Aplicar filtros y búsqueda a los productos
  const applyFiltersAndSearch = useCallback(() => {
    if (!hasStore || allProducts.length === 0) {
      setProducts([]);
      return;
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

    setProducts(filtered);
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
    router.push('/user/scan');
  };

  // Cargar productos al montar el componente o cuando cambie la tienda
  useEffect(() => {
    loadInitialProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.slug]); // Solo ejecutar cuando cambie la tienda

  // Aplicar filtros cuando cambien los filtros, búsqueda o productos
  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  return (
    <div className="flex flex-col w-full bg-background-cream">
      {/* Header con información de la tienda */}
      <div className="bg-background-cream border-b border-white animate-slide-down">
        <div className="flex items-center justify-between w-full px-4 py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0 animate-stagger-1">
            <div className="flex flex-col items-start justify-start flex-1 min-w-0">
              <p className="text-black font-bold text-[17px] truncate w-full transition-interactive">
                {store?.name || 'Heinigers Hofladen'}
              </p>
              {store?.address && (
                <p className="text-gray-600 text-[12px] mt-0.5 truncate w-full transition-interactive">
                  {store.address}
                </p>
              )}
              <p className="text-gray-500 text-[13px] mt-0.5 transition-interactive">
                {store ? `${products.length} Produkte verfügbar` : 'Grundhof 3, 8305 Dietlikon • ⭐ 4.8'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end flex-shrink-0 ml-2 animate-stagger-2">
            <button className="bg-white text-gray-500 px-4 rounded-md hover:bg-gray-50 
                          transition-interactive gpu-accelerated touch-target tap-highlight-transparent 
                          active:scale-95 whitespace-nowrap" 
                    style={{ minHeight: '35px' }}>
              Kontakt
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor de búsqueda y filtros - solo mostrar si la tienda está abierta */}
      {store && store.isOpen !== false && (
        <div className="bg-background-cream animate-slide-down" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          {/* Barra de búsqueda y botón QR */}
          <div className="p-4 flex gap-4 items-center justify-center bg-background-cream">
            <div className="animate-stagger-1">
              <SearchInput
                placeholder="Produkte suchen..."
                className="flex-1 max-w-[260px] h-[54px] transition-interactive gpu-accelerated"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="animate-stagger-2">
              <button
                onClick={handleScanQR}
                className="bg-brand-500 cursor-pointer justify-center text-center text-white px-4 py-3 flex items-center text-[18px] font-semibold gap-2 rounded-[30px] w-[124px] h-[54px] 
                         hover:bg-brand-600 transition-interactive gpu-accelerated touch-target tap-highlight-transparent 
                         active:scale-95 hover:scale-105"
                aria-label="QR Code scannen"
              >
                <ScanBarcode className="w-6 h-6 transition-interactive" />
                <span className="text-[16px] text-center">Scan</span>
              </button>
            </div>
          </div>

          {/* Filtros de categorías - Slider horizontal como en otras pantallas */}
          {categoryFilters.length > 0 && (
            <div className="bg-background-cream border-b border-gray-100 animate-stagger-3"
                 style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
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
              className="flex items-center gap-3 px-6 py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors font-semibold"
            >
              <ScanBarcode className="w-5 h-5" />
              Jetzt scannen
            </button>
          </div>
        ) : store.isOpen === false ? (
          // Tienda cerrada
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-background-cream animate-scale-in">
            <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center mb-6 animate-pulse transition-interactive">
              <svg className="w-16 h-16 text-orange-500 transition-interactive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3 transition-interactive">
              Geschäft geschlossen
            </h2>
            <p className="text-gray-600 mb-2 text-lg max-w-md transition-interactive">
              Entschuldigung, {store.name} ist zur Zeit geschlossen
            </p>
            <p className="text-gray-500 mb-8 text-sm max-w-md transition-interactive">
              Bitte versuchen Sie es später erneut. Vielen Dank für Ihr Verständnis.
            </p>
            <div className="bg-gray-50 rounded-2xl p-6 max-w-md w-full transition-interactive">
              <div className="flex items-center gap-3 text-gray-700">
                <svg className="w-6 h-6 text-gray-500 transition-interactive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm transition-interactive">
                  Wir sind derzeit nicht verfügbar
                </span>
              </div>
            </div>
          </div>
        ) : products.length === 0 && !loading ? (
          // Tienda sin productos o sin productos que coincidan con los filtros
          <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-scale-in">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6 transition-interactive">
              <StoreIcon className="w-12 h-12 text-gray-400 transition-interactive" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 transition-interactive">
              {searchQuery || (selectedFilters.length > 0 && !selectedFilters.includes('all'))
                ? "Keine Produkte gefunden"
                : "Keine Produkte verfügbar"}
            </h2>
            <p className="text-gray-600 mb-6 max-w-md transition-interactive">
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
                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        ) : (
          // Mostrar productos
          <div className="animate-fade-in-scale">
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
