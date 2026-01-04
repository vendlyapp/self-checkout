import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import ProductsList from "../dashboard/charge/ProductsList";
import { Product } from "../dashboard/products_list/data/mockProducts";
import { useCartStore } from "@/lib/stores/cartStore";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";
import { Store as StoreIcon, ShoppingBag, ScanBarcode } from "lucide-react";
import { useCategories } from "@/hooks/queries/useCategories";
import { useStoreProducts } from "@/hooks/queries/useStoreProducts";
import { getIcon } from "../dashboard/products_list/data/iconMap";
import { FilterOption } from "@/components/Sliders/SliderFIlter";
import { useStoreContext } from "@/app/store/[slug]/StoreContext";

interface DashboardUserProps {
  onLoadingChange?: (isLoading: boolean) => void;
}

const DashboardUser = ({ onLoadingChange }: DashboardUserProps = {}) => {
  const { addToCart } = useCartStore();
  const { store } = useScannedStoreStore();
  const { searchQuery, selectedFilters, setCategoryFilters, onScanQR } = useStoreContext();

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

  // Actualizar filtros de categorías en el contexto cuando cambien
  // Usar useRef para comparar y evitar loops infinitos
  const prevCategoryFiltersRef = useRef<string>('');
  
  useEffect(() => {
    // Comparar usando JSON.stringify para evitar actualizaciones innecesarias
    const currentFiltersString = JSON.stringify(categoryFilters);
    if (prevCategoryFiltersRef.current !== currentFiltersString) {
      prevCategoryFiltersRef.current = currentFiltersString;
      setCategoryFilters(categoryFilters);
    }
  }, [categoryFilters, setCategoryFilters]);

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

  // Manejar agregar al carrito
  const handleAddToCart = (product: Product, quantity: number) => {
    addToCart(product, quantity);
  };

  return (
    <div className="flex flex-col w-full bg-background-cream">
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
