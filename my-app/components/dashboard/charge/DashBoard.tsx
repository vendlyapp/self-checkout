'use client'

import { useState, useEffect } from "react";
import { productCategories, fetchProducts, mockProducts, Product } from "../products_list/data/mockProducts";
import { getIcon } from "./data/iconMap";
import CartSummary from "./CartSummary";
import ProductsList from "./ProductsList";
import FixedHeaderContainerCharge from "./FixedHeaderContainer";
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cartStore';
import { FilterOption } from "@/components/Sliders/SliderFIlter";

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

export default function DashBoardCharge() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Usar el store global
  const { cartItems, addToCart } = useCartStore();

  const handleFilterChange = async (filters: string[]) => {
    setSelectedFilters(filters);
    setLoading(true);
    
    try {
      const categoryId = filters.length > 0 ? filters[0] : 'all';
      const filteredProducts = await fetchProducts({
        categoryId,
        searchTerm: searchQuery
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
        searchTerm: query
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

  // handleAddToCart ahora usa addToCart del store global
  const handleAddToCart = (product: Product, quantity: number) => {
    addToCart(product, quantity);
  };

  const handleContinueToCheckout = () => {
    router.push('/charge/cart');
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
    <FixedHeaderContainerCharge
      title="Verkauf starten"
      searchQuery={searchQuery}
      onSearch={handleSearch}
      selectedFilters={selectedFilters}
      onFilterChange={handleFilterChange}
      chargeFilters={chargeFilters}
      onScanQR={handleScanQR}
    >
      {/* Lista de productos con scroll propio */}
      <ProductsList
        products={products}
        onAddToCart={handleAddToCart}
        loading={loading}
        searchQuery={searchQuery}
      />

      {/* Cart Summary - fijo en la parte inferior */}
      <CartSummary 
        items={cartItems}
        onContinue={handleContinueToCheckout}
      />
    </FixedHeaderContainerCharge>
  );
}