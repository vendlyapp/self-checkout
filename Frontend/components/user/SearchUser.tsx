"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Store } from "lucide-react";
import HeaderNav from "@/components/navigation/HeaderNav";
import { SearchInput } from "@/components/ui/search-input";
import ProductCard from "@/components/dashboard/charge/ProductCard";
import { useCartStore } from "@/lib/stores/cartStore";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";
import { Product } from "@/components/dashboard/products_list/data/mockProducts";
import Image from "next/image";
import { buildApiUrl } from "@/lib/config/api";

export default function SearchUser() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { addToCart, cartItems } = useCartStore();
  const { store } = useScannedStoreStore();

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
          const products = result.data.map((p: Partial<Product>) => ({
            ...p,
            price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
            stock: typeof p.stock === 'string' ? parseInt(p.stock) : p.stock,
            categoryId: p.categoryId || p.category?.toLowerCase().replace(/\s+/g, '_'),
          }));
          setAllProducts(products);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };

    loadProducts();
  }, [store?.slug]);

  // Función para obtener la cantidad actual de un producto en el carrito
  const getCurrentQuantity = useCallback((productId: string) => {
    const cartItem = cartItems.find((item) => item.product.id === productId);
    return cartItem ? cartItem.quantity : 0;
  }, [cartItems]);

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

    // Buscar en productos reales
    setTimeout(() => {
      const results = allProducts.filter((product: Product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        (product.tags && product.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase())))
      );
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
    <div className="flex flex-col">
      <HeaderNav title="Suchen" />

      {/* Contenedor principal con padding fijo */}
      <div className="flex-1 px-4  pb-32 mt-4 rounded-xl">
        {/* Barra de búsqueda fija en la parte superior */}
        <div
          className={`mb-6 pt-4 ${
            searchTerm ? "sticky top-0 bg-background-cream pt-2 pb-2 z-20" : ""
          }`}
        >
          <SearchInput
            placeholder="Produktnamen eingeben..."
            value={searchTerm}
            onChange={handleInputChange}
            onSearch={handleSearch}
          />
        </div>

        {/* Contenido principal */}
        {!store ? (
          /* Sin tienda */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Store className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium">
              Kein Geschäft ausgewählt
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Scannen Sie einen QR-Code
            </p>
          </div>
        ) : !searchTerm ? (
          /* Estado inicial - Búsquedas populares */
          <div className="safe-area-top">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/Fire.svg" alt="Flame" width={30} height={30} />
              <h2 className="text-lg font-semibold text-gray-800">
                Meist gesucht:
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handlePopularSearch(search)}
                  className="bg-white rounded-lg px-4 py-3 text-left text-gray-700 font-medium shadow-sm border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all duration-200 touch-target tap-highlight-transparent active:scale-95"
                  style={{ minHeight: "48px" }}
                  aria-label={`Nach ${search} suchen`}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Estado de resultados de búsqueda */
          <div className="safe-area-top bg-[#F9F6F4] pl-2 pr-2">
            {/* Header fijo para resultados */}
            <div className="flex items-center justify-between mb-4 sticky top-[70px] pt-2 pb-2 z-10 bg-[#F9F6F4]">
              <h2 className="text-lg font-semibold text-gray-800">
                Schnell hinzufügen
              </h2>
              <button
                onClick={handleClearSearch}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-target tap-highlight-transparent active:scale-95"
                aria-label="Búsqueda löschen"
                style={{ minHeight: "44px", minWidth: "44px" }}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Contenedor scrollable para productos */}
            <div className="overflow-y-auto">
              {isSearching ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Suche läuft...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((product) => {
                    const currentQuantity = getCurrentQuantity(product.id);
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        initialQuantity={currentQuantity}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">
                    Keine Produkte gefunden
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
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
