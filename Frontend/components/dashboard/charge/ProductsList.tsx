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
      <div className={`p-4 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Produkte werden geladen...
          </p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchQuery
              ? `Keine Produkte für "${searchQuery}" gefunden`
              : "Keine Produkte verfügbar"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 pb-24 ${className}`}>
      <div className="space-y-2">
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
