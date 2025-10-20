'use client';

import React, { Suspense } from 'react';
import ProductsListComponent from '@/components/dashboard/products_list/ProductsListComponent';
import { useResponsive } from '@/hooks';

// Hacer la página dinámica para evitar pre-rendering
export const dynamic = 'force-dynamic';

/**
 * ProductsList Page - Diseño optimizado para móvil y desktop
 */
export default function ProductsList() {
  const { } = useResponsive();

  return (
    <div className="w-full">
      {/* Mobile Layout - Diseño original con HeaderNav */}
      <div className="block lg:hidden">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-background-cream">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          </div>
        }>
          <ProductsListComponent
            isStandalone={true}
          />
        </Suspense>
      </div>

      {/* Desktop Layout - Diseño limpio */}
      <div className="hidden lg:block min-h-screen">
        <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-6">
          {/* Header Section */}
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

          {/* Products List */}
          <div className="pt-2">
            <Suspense fallback={
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mx-auto"></div>
              </div>
            }>
              <ProductsListComponent
                isStandalone={false}
                maxHeight="none"
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
