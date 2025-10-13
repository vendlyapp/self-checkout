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
      <div className="hidden lg:block min-h-screen">
        <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-6">
          {/* Header Section - Más limpio y espacioso */}
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Produktverwaltung</h1>
              <p className="text-gray-500 mt-2 text-base">Verwalten Sie Ihre Produkte, Kategorien und Aktionen</p>
            </div>
            <div className="w-full max-w-md">
              <input
                type="text"
                placeholder="Produkte durchsuchen..."
                className="w-full px-5 py-3.5 bg-white border-2 border-gray-200 rounded-2xl 
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent 
                         transition-all duration-200 text-base placeholder:text-gray-400
                         shadow-sm hover:border-gray-300"
              />
            </div>
          </div>

          {/* Products List - Sin contenedor blanco */}
          <div className="pt-2">
            <ProductsListComponent
              isStandalone={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
