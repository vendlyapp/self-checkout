"use client";

import HeaderNav from "@/components/navigation/HeaderNav";
import SliderP from "@/components/user/SliderP";
import type React from "react";
import ProductsList from "@/components/dashboard/charge/ProductsList";
import {
  getPromotionalProducts,
  Product,
} from "@/components/dashboard/products_list/data/mockProducts";
import { useEffect, useState, useCallback } from "react";
import { useCartStore } from "@/lib/stores/cartStore";

const PromotionPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCartStore();

  useEffect(() => {
    // Obtener solo productos con promociones
    const promotionalProducts = getPromotionalProducts();
    setProducts(promotionalProducts);
  }, []);

  const handleAddToCart = useCallback(
    (product: Product, quantity: number) => {
      addToCart(product, quantity);
    },
    [addToCart]
  );

  return (
    <>
      <HeaderNav title="Aktionen" />
      <div className="p-4 flex items-center justify-center mt-4">
        <SliderP />
      </div>
      <div className="mb-24">
        <h5 className="text-xl text-start ml-4 font-semibold">Alle Aktionen</h5>
        <ProductsList
          products={products}
          onAddToCart={handleAddToCart}
          loading={false}
        />
      </div>
    </>
  );
};

export default PromotionPage;
