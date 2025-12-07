import React, { useState, useEffect, useCallback } from "react";
import ProductsList from "../dashboard/charge/ProductsList";
import { Product } from "../dashboard/products_list/data/mockProducts";
import { useCartStore } from "@/lib/stores/cartStore";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";
import { SearchInput } from "@/components/ui/search-input";
import { ScanBarcode, Store as StoreIcon, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { buildApiUrl } from "@/lib/config/api";

const DashboardUser = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();
  const { store } = useScannedStoreStore();

  // Mensaje de estado
  const hasStore = !!store?.slug;

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
        // Convertir a formato correcto y normalizar precios
        const productsWithNumbers = result.data.map((p: Partial<Product>) => {
          const basePrice = typeof p.price === 'string' ? parseFloat(p.price) : (p.price || 0);
          const promoPrice = p.promotionalPrice ? (typeof p.promotionalPrice === 'string' ? parseFloat(p.promotionalPrice) : p.promotionalPrice) : null;
          const isPromotional = p.isPromotional || (promoPrice !== null);
          
          // Si hay promoción activa, usar precio promocional como price y basePrice como originalPrice
          let finalPrice = basePrice;
          let originalPrice = p.originalPrice ? (typeof p.originalPrice === 'string' ? parseFloat(p.originalPrice) : p.originalPrice) : undefined;
          
          if (isPromotional && promoPrice !== null) {
            finalPrice = promoPrice;
            originalPrice = basePrice;
          }
          
          return {
            ...p,
            price: isNaN(finalPrice) ? 0 : finalPrice,
            originalPrice: originalPrice && !isNaN(originalPrice) ? originalPrice : undefined,
            stock: typeof p.stock === 'string' ? parseInt(p.stock) : (p.stock || 0),
            categoryId: p.categoryId || p.category?.toLowerCase().replace(/\s+/g, '_'),
            isOnSale: isPromotional,
            isPromotional: isPromotional,
          };
        });
        setProducts(productsWithNumbers);
        setAllProducts(productsWithNumbers);
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
  }, [store?.slug]);

  // Manejar búsqueda
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!hasStore || allProducts.length === 0) {
      return;
    }

    let filtered = [...allProducts];

    // Filtrar por búsqueda
    if (query) {
      filtered = filtered.filter((p: Product) => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    setProducts(filtered);
  };

  // Manejar agregar al carrito
  const handleAddToCart = (product: Product, quantity: number) => {
    addToCart(product, quantity);
  };

  // Manejar escaneo QR
  const handleScanQR = () => {
    router.push('/user/scan');
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    loadInitialProducts();
  }, [loadInitialProducts]);

  return (
    <div className="flex flex-col h-full bg-background-cream">
      {/* Header con información de la tienda */}
      <div className="bg-background-cream border-b border-white">
        <div className="flex items-center justify-between w-full px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-start justify-start">
              <p className="text-black font-bold text-[17px]">
                {store?.name || 'Heinigers Hofladen'}
              </p>
              <p className="text-gray-500 text-[13px]">
                {store ? `${products.length} Produkte verfügbar` : 'Grundhof 3, 8305 Dietlikon • ⭐ 4.8'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <button className="bg-white text-gray-500 px-4 rounded-md hover:bg-gray-50 transition-colors touch-target tap-highlight-transparent active:scale-95" style={{ minHeight: '35px' }}>
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
            <SearchInput
              placeholder="Produkte suchen..."
              className="flex-1 max-w-[260px] h-[54px]"
              value={searchQuery}
              onChange={handleSearch}
            />
            <button
              onClick={handleScanQR}
              className="bg-brand-500 cursor-pointer justify-center text-center text-white px-4 py-3 flex items-center text-[18px] font-semibold gap-2 rounded-[30px] w-[124px] h-[54px] hover:bg-brand-600 transition-colors touch-target tap-highlight-transparent active:scale-95"
              aria-label="QR Code scannen"
            >
              <ScanBarcode className="w-6 h-6" />
              <span className="text-[16px] text-center">Scan</span>
            </button>
          </div>
        </div>
      )}

      {/* Lista de productos con scroll propio */}
      <div className="flex-1 overflow-y-auto">
        {!store ? (
          // Sin tienda escaneada
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
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
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-background-cream">
            <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
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
          // Tienda sin productos
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
              <StoreIcon className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Keine Produkte verfügbar
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Dieses Geschäft hat noch keine Produkte hinzugefügt
            </p>
          </div>
        ) : (
          // Mostrar productos
          <ProductsList
            products={products}
            onAddToCart={handleAddToCart}
            loading={loading}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardUser;
