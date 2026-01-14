"use client";

import React from "react";
import ProductCard from "./ProductCard";
import { Product } from "../products_list/data/mockProducts";
import { useStaggerAnimation } from "@/lib/utils/iosAnimations";
import { Loader } from "@/components/ui/Loader";

interface ProductsListProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  loading?: boolean;
  searchQuery?: string;
  className?: string;
}

const ProductsList = React.memo(function ProductsList({
  products,
  onAddToCart,
  loading = false,
  searchQuery = "",
  className = "",
}: ProductsListProps) {
  const { getItemStyle } = useStaggerAnimation(products.length, 40);

  if (loading) {
    return (
      <div className={`p-4 pb-32 lg:p-0 lg:pb-0 ${className} animate-fade-in`}>
        <div className="text-center py-12">
          <Loader size="md" className="mx-auto" />
          <p className="mt-4 text-sm text-gray-600 font-medium">
            Produkte werden geladen...
          </p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`p-4 pb-32 lg:p-0 lg:pb-0 ${className} animate-fade-in`}>
        <div className="text-center py-12">
          <p className="text-gray-500 text-base font-medium">
            {searchQuery
              ? `Keine Produkte für "${searchQuery}" gefunden`
              : "Keine Produkte verfügbar"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 pb-32 lg:p-0 lg:pb-8 ${className}`}>
      {/* Mobile: Lista vertical con animaciones escalonadas */}
      <div className="lg:hidden space-y-2">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="animate-stagger-fade-in"
            style={getItemStyle(index)}
          >
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
            />
          </div>
        ))}
      </div>

      {/* Desktop/Tablet: Grid compacto con animaciones escalonadas */}
      <div className="hidden lg:grid lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="animate-stagger-fade-in"
            style={getItemStyle(index)}
          >
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

ProductsList.displayName = 'ProductsList';

export default ProductsList;
