'use client';

import React from 'react';
import ProductsListComponent from '@/components/dashboard/products_list/ProductsListComponent';
import { useResponsive } from '@/hooks';

/**
 * ProductsList Page - Página principal de la lista de productos
 *
 * Esta página usa el componente reutilizable ProductsListComponent
 * con isStandalone=true para mostrar la funcionalidad completa
 * con footer y scroll propio.
 */
export default function ProductsList() {
  const { } = useResponsive();

  return (
    <div className="w-full">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <ProductsListComponent
          isStandalone={true}
        />
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Produktverwaltung</h1>
              <p className="text-gray-600 mt-1">Verwalten Sie Ihre Produkte, Kategorien und Aktionen</p>
            </div>
            <div className="w-full lg:w-[500px]">
              <input
                type="text"
                placeholder="Produkte durchsuchen..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Products List */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <ProductsListComponent
              isStandalone={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
