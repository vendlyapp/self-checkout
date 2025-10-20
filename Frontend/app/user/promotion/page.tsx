"use client";

import HeaderNav from "@/components/navigation/HeaderNav";
import SliderP from "@/components/user/SliderP";
import type React from "react";
import ProductsList from "@/components/dashboard/charge/ProductsList";
import { Product } from "@/components/dashboard/products_list/data/mockProducts";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cartStore";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";
import { Percent, Store } from "lucide-react";

const PromotionPage: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();
  const { store } = useScannedStoreStore();

  // Redirigir a /store/[slug]/promotion si hay tienda
  useEffect(() => {
    if (store?.slug && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath === '/user/promotion') {
        router.replace(`/store/${store.slug}/promotion`);
      }
    }
  }, [store?.slug, router]);

  useEffect(() => {
    const loadPromotionalProducts = async () => {
      setLoading(true);
      
      if (!store?.slug) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/store/${store.slug}/products`);
        const result = await response.json();
        
        if (result.success && result.data) {
          // Convertir y filtrar solo productos con promoción
          const allProducts = result.data.map((p: Partial<Product>) => ({
            ...p,
            price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
            originalPrice: p.originalPrice ? (typeof p.originalPrice === 'string' ? parseFloat(p.originalPrice) : p.originalPrice) : undefined,
            stock: typeof p.stock === 'string' ? parseInt(p.stock) : p.stock,
            categoryId: p.categoryId || p.category?.toLowerCase().replace(/\s+/g, '_'),
          }));

          // Filtrar solo productos en promoción
          const promotional = allProducts.filter((p: Product) => 
            p.isOnSale || p.originalPrice || p.discountPercentage || p.promotionTitle
          );
          
          setProducts(promotional);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPromotionalProducts();
  }, [store?.slug]);

  const handleAddToCart = useCallback(
    (product: Product, quantity: number) => {
      addToCart(product, quantity);
    },
    [addToCart]
  );

  if (!store) {
    return (
      <>
        <HeaderNav title="Aktionen" />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Store className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-600 font-medium">Kein Geschäft ausgewählt</p>
          <p className="text-gray-400 text-sm mt-2">Scannen Sie einen QR-Code</p>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderNav title="Aktionen" />
      {products.length > 0 && (
        <div className="w-full mt-4">
          <SliderP products={products} />
        </div>
      )}
      <div className="mb-24">
        <h5 className="text-xl text-start ml-4 mt-4 font-semibold">Alle Aktionen</h5>
        {!loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Percent className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium text-lg">Keine Aktionen verfügbar</p>
            <p className="text-gray-400 text-sm mt-2 max-w-md">
              Derzeit gibt es keine Produkte im Angebot. Schauen Sie später wieder vorbei!
            </p>
          </div>
        ) : (
          <ProductsList
            products={products}
            onAddToCart={handleAddToCart}
            loading={loading}
          />
        )}
      </div>
    </>
  );
};

export default PromotionPage;
