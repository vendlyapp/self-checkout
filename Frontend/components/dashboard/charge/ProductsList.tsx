"use client";

import React from "react";
import ProductCard from "./ProductCard";
import { Product } from "../products_list/data/mockProducts";
import { DashboardLoadingState } from "@/components/ui/DashboardLoadingState";

interface ProductsListProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  loading?: boolean;
  searchQuery?: string;
  className?: string;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

const ProductsList = React.memo(function ProductsList({
  products,
  onAddToCart,
  loading = false,
  searchQuery = "",
  className = "",
  hasActiveFilters = false,
  onClearFilters,
}: ProductsListProps) {
  if (loading) {
    return (
      <div className={`px-4 py-6 ${className}`}>
        <DashboardLoadingState mode="section" message="Produkte werden geladen..." />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`px-4 py-12 ${className}`}>
        <div className="text-center">
          <p className="text-gray-500 font-medium">
            {searchQuery
              ? `Keine Produkte für "${searchQuery}"`
              : "Keine aktiven Produkte verfügbar"}
          </p>
          {hasActiveFilters && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-soft active:scale-95"
            >
              Alle anzeigen
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`px-4 pb-32 ${className}`}>
      <div className="space-y-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    </div>
  );
});

ProductsList.displayName = "ProductsList";

export default ProductsList;
