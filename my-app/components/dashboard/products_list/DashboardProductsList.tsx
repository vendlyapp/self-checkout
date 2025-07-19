'use client'

import React from 'react';
import ProductsListComponent from './ProductsListComponent';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId: string;
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
  discountPercentage?: number;
}

interface DashboardProductsListProps {
  className?: string;
  maxHeight?: string;
}

export default function DashboardProductsList({ 
  className = "",
  maxHeight = "400px"
}: DashboardProductsListProps) {
  const router = useRouter();

  const handleProductClick = (product: Product) => {
    // En el dashboard, al hacer clic en un producto, navegar a la página de edición
    router.push(`/products_list/edit/${product.id}`);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* Header del componente - FIJO */}
      <div className="p-4 border-b border-gray-100 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>Produkte</span>
          <span className="text-sm text-gray-500 font-normal">• Verwaltung</span>
        </h2>
      </div>

      {/* Componente de lista de productos con scroll propio */}
      <div className="h-full">
        <ProductsListComponent
          isStandalone={false}
          onProductClick={handleProductClick}
          maxHeight={maxHeight}
          className="h-full"
        />
      </div>
    </div>
  );
} 