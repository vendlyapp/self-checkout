"use client";

import HeaderNav from "@/components/navigation/HeaderNav";
import SliderP from "@/components/user/SliderP";
import type React from "react";
import ProductsList from "@/components/dashboard/charge/ProductsList";
import { Product } from "@/components/dashboard/products_list/data/mockProducts";
import { useEffect, useState, useCallback } from "react";
import { useCartStore } from "@/lib/stores/cartStore";
import { buildApiUrl } from "@/lib/config/api";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";
import { Percent, Store } from "lucide-react";

const PromotionPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();
  const { store } = useScannedStoreStore();

  useEffect(() => {
    const loadPromotionalProducts = async () => {
      setLoading(true);
      
      if (!store?.slug) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const url = buildApiUrl(`/api/store/${store.slug}/products`);
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success && result.data) {
          // Convertir y filtrar solo productos con promoción
          const allProducts = result.data.map((p: Partial<Product>) => {
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
    <div>
      <div>
        <HeaderNav title="Aktionen" />
      </div>
      {products.length > 0 && (
        <div className="w-full mt-4 animate-stagger-1 animate-slide-up-fade">
          <SliderP products={products} />
        </div>
      )}
      <div className="mb-24 animate-stagger-2">
        <h5 className="text-xl text-start ml-4 mt-4 font-semibold transition-interactive">Alle Aktionen</h5>
        {!loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4 animate-scale-in">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 transition-interactive">
              <Percent className="w-10 h-10 text-gray-400 transition-interactive" />
            </div>
            <p className="text-gray-600 font-medium text-lg transition-interactive">Keine Aktionen verfügbar</p>
            <p className="text-gray-400 text-sm mt-2 max-w-md transition-interactive">
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
    </div>
  );
};

export default PromotionPage;
