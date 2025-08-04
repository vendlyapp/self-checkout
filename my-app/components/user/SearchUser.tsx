'use client'
import { useState, useCallback } from 'react';
import HeaderNav from "../navigation/HeaderNav";
import HeaderUser from "../navigation/user/HeaderUser";
import { SearchInput } from '@/components/ui/search-input';
import { mockProducts, Product } from '@/components/dashboard/products_list/data/mockProducts';
import { useCartStore } from '@/lib/stores/cartStore';
import { Search, Flame, X, Plus, Minus } from 'lucide-react';
import Image from 'next/image';

export default function SearchUser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { cartItems, addToCart, updateQuantity } = useCartStore();

  // Búsquedas populares
  const popularSearches = [
    'Bauernbrot', 'Croissant', 'Käsekuchen', 'Brezel',
    'Apfelstrudel', 'Sauerteigbrot', 'Schokobrötchen', 'Baguette'
  ];

  // Función para obtener la cantidad actual de un producto en el carrito
  const getCurrentQuantity = useCallback((productId: string) => {
    const cartItem = cartItems.find(item => item.product.id === productId);
    return cartItem ? cartItem.quantity : 0;
  }, [cartItems]);

  // Función para buscar productos
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const term = query.toLowerCase();
    
    const results = mockProducts.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.tags.some(tag => tag.toLowerCase().includes(term)) ||
      product.category.toLowerCase().includes(term)
    );

    setSearchResults(results);
    setIsSearching(false);
  }, []);

  // Función para manejar cambio en el input
  const handleInputChange = useCallback((value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      handleSearch(value);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [handleSearch]);

  // Función para búsqueda rápida desde botones populares
  const handlePopularSearch = useCallback((term: string) => {
    setSearchTerm(term);
    handleSearch(term);
  }, [handleSearch]);

  // Función para limpiar búsqueda
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  // Función para manejar cambio de cantidad
  const handleQuantityChange = useCallback((product: Product, newQuantity: number) => {
    if (newQuantity >= 0 && newQuantity <= product.stock) {
      if (newQuantity === 0) {
        // Si la cantidad es 0, remover del carrito
        const { removeFromCart } = useCartStore.getState();
        removeFromCart(product.id);
      } else {
        // Si es la primera vez que se agrega el producto
        if (getCurrentQuantity(product.id) === 0) {
          addToCart(product, newQuantity);
        } else {
          // Actualizar cantidad en el carrito
          updateQuantity(product.id, newQuantity);
        }
      }
    }
  }, [updateQuantity, addToCart, getCurrentQuantity]);



  return (
    <div className="flex flex-col min-h-full bg-background-cream">
      <HeaderUser />
      <HeaderNav title="Suchen" />
      
      {/* Contenedor principal con padding fijo */}
      <div className="flex-1 px-4 pt-4 pb-32 mt-[70px]">
        {/* Barra de búsqueda fija en la parte superior */}
        <div className={`mb-6 ${searchTerm ? 'sticky top-0 bg-background-cream pt-2 pb-2 z-20' : ''}`}>
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
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-800">
                Meist gesucht bei Heiniger&apos;s:
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handlePopularSearch(search)}
                  className="bg-white rounded-lg px-4 py-3 text-left text-gray-700 font-medium shadow-sm border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all duration-200"
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
            <div className="flex items-center justify-between mb-4 sticky top-[80px] bg-background-cream pt-2 pb-2 z-10">
              <h2 className="text-lg font-semibold text-gray-800">
                Schnell hinzufügen
              </h2>
              <button
                onClick={handleClearSearch}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Búsqueda löschen"
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
                      <div key={product.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3">
                          {/* Imagen del producto */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {product.image ? (
                              <Image 
                                src={product.image} 
                                alt={product.name} 
                                width={64} 
                                height={64}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center">
                                <Search className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Información del producto */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-[15px]">
                              {product.name}
                            </h3>
                            <p className="text-gray-500 text-[13px] mt-1">
                              {product.weight ? `${product.weight}g` : '1 Stück'}
                            </p>
                          </div>

                          {/* Precio y controles de cantidad */}
                          <div className="flex flex-col items-end gap-2">
                            <span className="font-bold text-gray-900 text-[15px]">
                              CHF {product.price.toFixed(2)}
                            </span>
                            
                            {/* Controles de cantidad */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleQuantityChange(product, currentQuantity - 1)}
                                className="w-8 h-8 rounded-full bg-[#d1d1d1] hover:bg-[#c0c0c0] text-gray-700 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={currentQuantity <= 0}
                                aria-label={`${product.name} reduzieren`}
                              >
                                <Minus className="w-4 h-4" strokeWidth={2.5} />
                              </button>
                              
                              <span className="text-[16px] font-semibold text-gray-900 min-w-[24px] text-center select-none">
                                {currentQuantity}
                              </span>
                              
                              <button
                                onClick={() => handleQuantityChange(product, currentQuantity + 1)}
                                disabled={currentQuantity >= product.stock}
                                className="w-10 h-10 rounded-full bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#86efac] disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-200 shadow-sm"
                                aria-label={`${product.name} hinzufügen`}
                              >
                                <Plus className="w-6 h-6" strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">Keine Produkte gefunden</p>
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