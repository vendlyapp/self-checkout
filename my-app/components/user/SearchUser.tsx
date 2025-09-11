"use client";
import React, { useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import HeaderNav from "@/components/navigation/HeaderNav";
import { SearchInput } from "@/components/ui/search-input";
import ProductCard from "@/components/dashboard/charge/ProductCard";
import { useCartStore } from "@/lib/stores/cartStore";
import { Product, mockProducts } from "@/components/dashboard/products_list/data/mockProducts";
import Image from "next/image";

export default function SearchUser() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { addToCart, cartItems } = useCartStore();

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

    setIsSearching(true);

    // Simular búsqueda
    setTimeout(() => {
      const results = mockProducts.filter((product: Product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  }, []);

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
        {!searchTerm ? (
          /* Estado inicial - Búsquedas populares */
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src="/Fire.svg" alt="Flame" width={30} height={30} />
              <h2 className="text-lg font-semibold text-gray-800">
                Meist gesucht bei Heiniger&apos;s:
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handlePopularSearch(search)}
                  className="bg-white rounded-lg px-4 py-3 text-left text-gray-700 font-medium shadow-sm border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all duration-200 touch-target tap-highlight-transparent active:scale-95"
                  style={{ minHeight: '48px' }}
                  aria-label={`Nach ${search} suchen`}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Estado de resultados de búsqueda */
          <div>
            {/* Header fijo para resultados */}
            <div className="flex items-center justify-between mb-4 sticky top-[70px] bg-background-cream pt-2 pb-2 z-10">
              <h2 className="text-lg font-semibold text-gray-800">
                Schnell hinzufügen
              </h2>
              <button
                onClick={handleClearSearch}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors touch-target tap-highlight-transparent active:scale-95"
                aria-label="Búsqueda löschen"
                style={{ minHeight: '44px', minWidth: '44px' }}
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
