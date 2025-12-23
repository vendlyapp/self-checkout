"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Store } from "lucide-react";
import HeaderNav from "@/components/navigation/HeaderNav";
import { SearchInput } from "@/components/ui/search-input";
import ProductCard from "@/components/dashboard/charge/ProductCard";
import { useCartStore } from "@/lib/stores/cartStore";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";
import { Product, normalizeProductData } from "@/components/dashboard/products_list/data/mockProducts";
import Image from "next/image";
import { buildApiUrl } from "@/lib/config/api";

export default function SearchUser() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { addToCart } = useCartStore();
  const { store } = useScannedStoreStore();

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

  // Redirigir a /store/[slug]/search si hay tienda
  useEffect(() => {
    if (store?.slug && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath === '/user/search') {
        router.replace(`/store/${store.slug}/search`);
      }
    }
  }, [store?.slug, router]);

  // Cargar productos de la tienda
  useEffect(() => {
    const loadProducts = async () => {
      if (!store?.slug) {
        setAllProducts([]);
        return;
      }

      try {
        const url = buildApiUrl(`/api/store/${store.slug}/products`);
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success && result.data) {
          // Normalizar productos usando la función de normalización
          const normalizedProducts = result.data.map((p: unknown) => normalizeProductData(p as Product));
          
          // Agrupar productos con variantes (solo mostrar productos padre)
          const groupedProducts = groupProductsWithVariants(normalizedProducts);
          
          setAllProducts(groupedProducts);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };

    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.slug]); // Solo ejecutar cuando cambie la tienda

  // Búsquedas populares
  const popularSearches = [
    "Äpfel",
    "Brot",
    "Milch",
    "Käse",
    "Tomaten",
    "Zwiebeln"
  ];

  // Función de búsqueda
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    if (!store?.slug || allProducts.length === 0) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Buscar en productos reales (incluyendo variantes)
    setTimeout(() => {
      const queryLower = query.toLowerCase();
      const results = allProducts.filter((product: Product) => {
        // Buscar en nombre del producto padre
        const matchesParent = product.name.toLowerCase().includes(queryLower) ||
          product.category.toLowerCase().includes(queryLower) ||
          (product.tags && product.tags.some((tag: string) => tag.toLowerCase().includes(queryLower)));
        
        // Buscar en nombres de variantes
        const matchesVariant = product.variants?.some(variant => 
          variant.name.toLowerCase().includes(queryLower) ||
          (variant.description && variant.description.toLowerCase().includes(queryLower))
        );
        
        return matchesParent || matchesVariant;
      });
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  }, [allProducts, store?.slug]);

  const handleInputChange = useCallback((value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      handleSearch(value);
    } else {
      setSearchResults([]);
    }
  }, [handleSearch]);

  const handlePopularSearch = useCallback((search: string) => {
    setSearchTerm(search);
    handleSearch(search);
  }, [handleSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setSearchResults([]);
  }, []);

  const handleAddToCart = useCallback((product: Product, quantity: number) => {
    addToCart(product, quantity);
  }, [addToCart]);

  return (
    <div className="flex flex-col animate-page-enter gpu-accelerated">
      <div className="animate-slide-in-right">
        <HeaderNav title="Suchen" />
      </div>

      {/* Contenedor principal con padding fijo */}
      <div className="flex-1 px-4 pb-32 mt-4 rounded-xl">
        {/* Barra de búsqueda fija en la parte superior */}
        <div
          className={`mb-6 pt-4 animate-slide-down ${
            searchTerm ? "sticky top-0 bg-background-cream pt-2 pb-2 z-20" : ""
          }`}
        >
          <SearchInput
            placeholder="Produktnamen eingeben..."
            value={searchTerm}
            onChange={handleInputChange}
            onSearch={handleSearch}
            className="transition-interactive gpu-accelerated"
          />
        </div>

        {/* Contenido principal */}
        {!store ? (
          /* Sin tienda */
          <div className="flex flex-col items-center justify-center py-16 text-center animate-scale-in">
            <Store className="w-16 h-16 text-gray-300 mb-4 transition-interactive" />
            <p className="text-gray-600 font-medium transition-interactive">
              Kein Geschäft ausgewählt
            </p>
            <p className="text-gray-400 text-sm mt-2 transition-interactive">
              Scannen Sie einen QR-Code
            </p>
          </div>
        ) : !searchTerm ? (
          /* Estado inicial - Búsquedas populares */
          <div className="safe-area-top animate-fade-in-scale">
            <div className="flex items-center gap-2 mb-4 animate-stagger-1">
              <Image src="/Fire.svg" alt="Flame" width={30} height={30} className="transition-interactive" />
              <h2 className="text-lg font-semibold text-gray-800 transition-interactive">
                Meist gesucht:
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handlePopularSearch(search)}
                  className="bg-white rounded-lg px-4 py-3 text-left text-gray-700 font-medium shadow-sm border border-gray-100 
                           hover:border-brand-200 hover:shadow-md transition-interactive gpu-accelerated 
                           touch-target tap-highlight-transparent active:scale-95 hover:scale-[1.02]
                           animate-slide-up-fade"
                  style={{ 
                    minHeight: "48px",
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'both'
                  }}
                  aria-label={`Nach ${search} suchen`}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Estado de resultados de búsqueda */
          <div className="safe-area-top bg-[#F9F6F4] pl-2 pr-2 animate-fade-in-scale">
            {/* Header fijo para resultados */}
            <div className="flex items-center justify-between mb-4 sticky top-[70px] pt-2 pb-2 z-10 bg-[#F9F6F4] animate-slide-down">
              <h2 className="text-lg font-semibold text-gray-800 transition-interactive">
                Schnell hinzufügen
              </h2>
              <button
                onClick={handleClearSearch}
                className="p-2 rounded-full hover:bg-gray-100 transition-interactive gpu-accelerated 
                         touch-target tap-highlight-transparent active:scale-95"
                aria-label="Búsqueda löschen"
                style={{ minHeight: "44px", minWidth: "44px" }}
              >
                <X className="w-5 h-5 text-gray-500 transition-interactive" />
              </button>
            </div>

            {/* Contenedor scrollable para productos */}
            <div className="overflow-y-auto">
              {isSearching ? (
                <div className="text-center py-8 animate-fade-in-scale">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2 transition-interactive">Suche läuft...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3 animate-fade-in-scale">
                  {searchResults.map((product, index) => {
                    return (
                      <div
                        key={product.id}
                        className="animate-slide-up-fade gpu-accelerated"
                        style={{
                          animationDelay: `${index * 0.05}s`,
                          animationFillMode: 'both'
                        }}
                      >
                        <ProductCard
                          product={product}
                          onAddToCart={handleAddToCart}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 animate-scale-in">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3 transition-interactive" />
                  <p className="text-gray-500 text-lg transition-interactive">
                    Keine Produkte gefunden
                  </p>
                  <p className="text-gray-400 text-sm mt-1 transition-interactive">
                    Versuche es mit einem anderen Suchbegriff
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
