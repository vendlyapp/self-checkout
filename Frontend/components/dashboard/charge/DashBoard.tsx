"use client";

import { useMemo } from "react";
import { Product } from "../products_list/data/mockProducts";
import ProductsList from "./ProductsList";
import { useCartStore } from "@/lib/stores/cartStore";
import { useChargeContext } from "@/app/(dashboard)/charge/contexts";

interface DashBoardChargeProps {
  searchQuery: string;
  selectedFilters: string[];
}

const groupProductsWithVariants = (products: Product[]): Product[] => {
  const parentProducts: Product[] = [];
  const variantsMap = new Map<string, Product[]>();

  products.forEach((product) => {
    if (product.parentId) {
      if (!variantsMap.has(product.parentId)) variantsMap.set(product.parentId, []);
      variantsMap.get(product.parentId)!.push(product);
    } else {
      parentProducts.push(product);
    }
  });

  return parentProducts.map((parent) => ({
    ...parent,
    variants: variantsMap.get(parent.id)?.length ? variantsMap.get(parent.id) : undefined,
  }));
};

export default function DashBoardCharge({
  searchQuery,
  selectedFilters,
}: DashBoardChargeProps) {
  const chargeContext = useChargeContext();
  const { addToCart } = useCartStore();

  const catalogProducts = chargeContext?.catalogProducts ?? [];
  const isProductsInitialLoad = chargeContext?.isProductsInitialLoad ?? false;

  const products = useMemo(() => {
    if (!catalogProducts.length) return [];

    const groupedProducts = groupProductsWithVariants(catalogProducts);

    let filteredProducts = groupedProducts;
    const activeCategoryFilters = selectedFilters.filter((id) => id !== "all");

    if (activeCategoryFilters.length > 0) {
      filteredProducts = filteredProducts.filter((p) => {
        if (activeCategoryFilters.includes(p.categoryId)) return true;
        if (activeCategoryFilters.includes("new") && p.isNew) return true;
        if (activeCategoryFilters.includes("popular") && p.isPopular) return true;
        if (activeCategoryFilters.includes("sale") && p.isOnSale) return true;
        if (
          activeCategoryFilters.includes("promotions") &&
          (p.isOnSale || p.originalPrice)
        ) {
          return true;
        }
        return false;
      });
    }

    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase().trim();
      filteredProducts = filteredProducts.filter((p) => {
        const matchesParent =
          p.name.toLowerCase().includes(queryLower) ||
          (p.description && p.description.toLowerCase().includes(queryLower)) ||
          (p.sku && p.sku.toLowerCase().includes(queryLower)) ||
          (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(queryLower)));
        const matchesVariant = p.variants?.some(
          (variant) =>
            variant.name.toLowerCase().includes(queryLower) ||
            (variant.description &&
              variant.description.toLowerCase().includes(queryLower))
        );
        return matchesParent || !!matchesVariant;
      });
    }

    return filteredProducts;
  }, [catalogProducts, selectedFilters, searchQuery]);

  const handleAddToCart = (product: Product, quantity: number) => {
    addToCart(product, quantity);
  };

  const hasActiveFilters =
    (selectedFilters.length > 0 && !selectedFilters.includes("all")) ||
    !!searchQuery.trim();

  return (
    <div className="mx-auto max-w-3xl min-w-0">
      <div className="mb-3 mt-2 flex items-center justify-between px-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
          {products.length} {products.length === 1 ? "Produkt" : "Produkte"}
        </h2>
      </div>
      <ProductsList
        products={products}
        onAddToCart={handleAddToCart}
        loading={isProductsInitialLoad}
        searchQuery={searchQuery}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => {
          chargeContext?.onSearch("");
          chargeContext?.onFilterChange([]);
        }}
      />
    </div>
  );
}
