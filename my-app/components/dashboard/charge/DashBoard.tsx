'use client'

import { useState, useEffect } from "react";
import HeaderNav from "@/components/navigation/HeaderNav";
import { SearchInput } from "@/components/ui/search-input";
import { QrCodeIcon } from "lucide-react";
import { FilterSlider, FilterOption } from "@/components/Sliders/SliderFIlter";
import { productCategories, fetchProducts, mockProducts } from "./data/mockProducts";
import { getIcon } from "./data/iconMap";
import ProductCard from "./ProductCard";
import CartSummary from "./CartSummary";

// Interfaz completa para Product - actualizada para ser compatible
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId: string;
  image?: string;
  stock: number;
  barcode?: string;
  sku: string;
  tags: string[];
  isNew?: boolean;
  isPopular?: boolean;
  isOnSale?: boolean;
  rating?: number;
  reviews?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
  unit?: string;
  availableWeights?: string[];
  hasWeight?: boolean;
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
    <div>
     
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
          <div className="space-y-2">
            {products.map((product) => {
              const cartItem = cartItems.find(item => item.product.id === product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  initialQuantity={cartItem?.quantity || 0}
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