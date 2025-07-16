'use client'

import { useState, useEffect } from "react";
import HeaderNav from "@/components/navigation/HeaderNav";
import { SearchInput } from "@/components/ui/search-input";
import { QrCodeIcon, Plus, Minus, ChevronDown, PackageIcon } from "lucide-react";
import { FilterSlider, FilterOption } from "@/components/Sliders/SliderFIlter";
import { productCategories, fetchProducts, Product, mockProducts } from "./data/mockProducts";
import { getIcon } from "./data/iconMap";
import CartSummary from "./CartSummary";

// Componente ProductCard integrado
interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => void
  initialQuantity?: number
}

function ProductCard({ product, onAddToCart, initialQuantity = 0 }: ProductCardProps) {
  const [quantity, setQuantity] = useState(initialQuantity)
  const [showWeightOptions, setShowWeightOptions] = useState(false)
  const [selectedWeight, setSelectedWeight] = useState('500g')

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0 && newQuantity <= product.stock) {
      setQuantity(newQuantity)
      onAddToCart(product, newQuantity)
    }
  }

  const formatPrice = (price: number) => {
    if (price % 1 === 0) {
      return `CHF ${price}.-`
    }
    return `CHF ${price.toFixed(2)}`
  }

  return (
    <div className="bg-[#f5f5f5] rounded-[20px] p-5 relative" style={{ minHeight: '132px' }}>
      {/* Badge de precio */}
      <div className="absolute top-5 right-5 bg-[#e8e8e8] rounded-full px-3.5 py-1.5">
        <span className="text-[15px] font-medium text-gray-800">
          {formatPrice(product.price)}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Imagen del producto */}
        <div className="w-[100px] h-[92px] rounded-[16px] flex items-center justify-center overflow-hidden flex-shrink-0 bg-white">
          <PackageIcon className="w-8 h-8 text-gray-400" />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col justify-between h-[92px]">
          {/* Título del producto */}
          <div className="pr-24">
            <h3 className="font-semibold text-gray-900 text-[17px] leading-[1.3] tracking-tight">
              {product.name}
            </h3>
          </div>

          {/* Controles en la parte inferior */}
          <div className="flex items-center">
            {/* Selector de peso */}
            <div className="relative">
              <button
                onClick={() => setShowWeightOptions(!showWeightOptions)}
                className="flex items-center gap-1.5 text-[15px] text-gray-700 hover:text-gray-900 transition-colors py-1"
              >
                <span className="font-medium">{selectedWeight}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {showWeightOptions && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 min-w-[120px]">
                  {['250g', '500g', '1kg'].map((weight) => (
                    <button
                      key={weight}
                      onClick={() => {
                        setSelectedWeight(weight)
                        setShowWeightOptions(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {weight}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Espaciador */}
            <div className="flex-1" />

            {/* Controles de cantidad */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity === 0}
                className="w-10 h-10 rounded-full bg-[#d1d1d1] hover:bg-[#c0c0c0] disabled:bg-[#e5e5e5] disabled:cursor-not-allowed text-gray-700 flex items-center justify-center transition-all duration-200"
              >
                <Minus className="w-5 h-5" strokeWidth={2.5} />
              </button>
              
              <span className="text-[18px] font-semibold text-gray-900 min-w-[28px] text-center select-none">
                {quantity}
              </span>
              
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock}
                className="w-10 h-10 rounded-full bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#86efac] disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-200 shadow-sm"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Convertir categorías a formato FilterOption con contadores reales
const chargeFilters: FilterOption[] = productCategories.map(category => {
  let count = 0;
  
  if (category.id === 'all') {
    count = mockProducts.length;
  } else if (category.id === 'new') {
    count = mockProducts.filter((p: Product) => p.isNew).length;
  } else if (category.id === 'popular') {
    count = mockProducts.filter((p: Product) => p.isPopular).length;
  } else if (category.id === 'sale') {
    count = mockProducts.filter((p: Product) => p.isOnSale).length;
  } else if (category.id === 'promotions') {
    count = mockProducts.filter((p: Product) => p.isOnSale || p.originalPrice).length;
  } else {
    count = mockProducts.filter((p: Product) => p.categoryId === category.id).length;
  }
  
  return {
    id: category.id,
    label: category.name,
    icon: getIcon(category.icon),
    count: count
  };
});

interface CartItem {
  product: Product;
  quantity: number;
}

export default function DashBoardCharge() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const handleFilterChange = async (filters: string[]) => {
    setSelectedFilters(filters);
    setLoading(true);
    
    try {
      const categoryId = filters.length > 0 ? filters[0] : 'all';
      const filteredProducts = await fetchProducts({
        categoryId,
        searchTerm: searchQuery,
        tags: filters.filter(f => f !== categoryId)
      });
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error al filtrar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    
    try {
      const categoryId = selectedFilters.length > 0 ? selectedFilters[0] : 'all';
      const filteredProducts = await fetchProducts({
        categoryId,
        searchTerm: query,
        tags: selectedFilters.filter(f => f !== categoryId)
      });
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error al buscar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = () => {
    console.log('Escaneando código QR...');
    // Aquí puedes implementar la funcionalidad de escaneo QR
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        if (quantity === 0) {
          return prevItems.filter(item => item.product.id !== product.id);
        } else {
          return prevItems.map(item => 
            item.product.id === product.id 
              ? { ...item, quantity }
              : item
          );
        }
      } else if (quantity > 0) {
        return [...prevItems, { product, quantity }];
      }
      return prevItems;
    });
  };

  const handleContinueToCheckout = () => {
    console.log('Continuando al checkout con:', cartItems);
    // Aquí puedes implementar la navegación al checkout
  };

  // Cargar productos iniciales
  useEffect(() => {
    const loadInitialProducts = async () => {
      setLoading(true);
      try {
        const initialProducts = await fetchProducts();
        setProducts(initialProducts);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeaderNav />
      <div className="p-4 flex flex-col-2 gap-4 items-center justify-center">
        <SearchInput 
          placeholder="Produkte suchen..." 
          className="w-[260.5px] h-[54px]"
          value={searchQuery}
          onChange={handleSearch}
        />
        <button 
          onClick={handleScanQR}
          className="bg-brand-500 cursor-pointer text-white px-4 py-3 flex items-center text-[18px] font-semibold gap-2 rounded-[30px] w-[124px] h-[54px]"
        >
          <QrCodeIcon className="w-6 h-6" />
          <span className="text-[16px]">Scan</span>
        </button>
      </div>
      <FilterSlider
        filters={chargeFilters}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        showCount={true}
        multiSelect={true}
      />
      
      {/* Lista de productos */}
      <div className="p-4 pb-24">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Cargando productos...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-4">
            {products.map((product) => {
              const cartItem = cartItems.find(item => item.product.id === product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  initialQuantity={cartItem?.quantity || 0}
                  onAddToCart={handleAddToCart}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery 
                ? `No se encontraron productos para "${searchQuery}"`
                : 'No hay productos disponibles'
              }
            </p>
          </div>
        )}
      </div>

      {/* Cart Summary */}
      <CartSummary 
        items={cartItems}
        onContinue={handleContinueToCheckout}
      />
    </div>
  );
}