"use client";

import React from "react";
import ProductCard from "./ProductCard";
import { useCartStore } from "@/lib/stores/cartStore";
import { Product } from "../products_list/data/mockProducts";

interface ProductsListProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  loading?: boolean;
  searchQuery?: string;
  className?: string;
}

export default function ProductsList({
  products,
  onAddToCart,
  loading = false,
  searchQuery = "",
  className = "",
}: ProductsListProps) {
  const { cartItems } = useCartStore();

  if (loading) {
    return (
      <div className={`p-4 pb-32 lg:p-0 lg:pb-0 ${className}`}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-base text-gray-500 font-medium">
            Produkte werden geladen...
          </p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`p-4 pb-32 lg:p-0 lg:pb-0 ${className}`}>
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
      {/* Mobile: Lista vertical */}
      <div className="lg:hidden space-y-2">
        {products.map((product) => {
          const cartItem = cartItems.find(
            (item) => item.product.id === product.id
          );
          return (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              initialQuantity={cartItem?.quantity || 0}
            />
          );
        })}
      </div>

      {/* Desktop/Tablet: Grid compacto */}
      <div className="hidden lg:grid lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
        {products.map((product) => {
          const cartItem = cartItems.find(
            (item) => item.product.id === product.id
          );
          return (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              initialQuantity={cartItem?.quantity || 0}
            />
          );
        })}
      </div>
    </div>
  );
}
