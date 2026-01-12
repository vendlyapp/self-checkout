'use client';

import React, { Suspense } from 'react';
import ProductsListComponent from '@/components/dashboard/products_list/ProductsListComponent';
import { useResponsive } from '@/hooks';
import { useProductsList } from '@/components/dashboard/products_list/ProductsListContext';
import { SlidersHorizontal } from 'lucide-react';

// Hacer la página dinámica para evitar pre-rendering
export const dynamic = 'force-dynamic';

/**
 * ProductsList Page - Diseño optimizado para móvil y desktop
 */
export default function ProductsList() {
  const { } = useResponsive();
  const { onOpenFilterModal, activeFiltersCount } = useProductsList();

  return (
    <div className="w-full animate-page-enter gpu-accelerated">
      {/* Mobile Layout - Diseño original con HeaderNav */}
      <div className="block lg:hidden">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-background-cream animate-fade-in-scale">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          </div>
        }>
          <div className="animate-slide-up-fade">
            <ProductsListComponent
              isStandalone={true}
            />
          </div>
        </Suspense>
      </div>

      {/* Desktop Layout - Diseño limpio */}
      <div className="hidden lg:block min-h-screen">
        <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between gap-6 animate-stagger-1">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight transition-ios">Produktverwaltung</h1>
              <p className="text-gray-500 mt-2 text-base transition-ios">Verwalten Sie Ihre Produkte, Kategorien und Aktionen</p>
            </div>
            <div className="flex items-center gap-4 w-full max-w-md animate-stagger-2">
              <input
                type="text"
                placeholder="Produkte durchsuchen..."
                className="flex-1 px-5 py-3.5 bg-white border-2 border-gray-200 rounded-2xl 
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent 
                         transition-ios text-base placeholder:text-gray-400
                         shadow-sm hover:border-gray-300 hover:shadow-md gpu-accelerated"
              />
              <button
                onClick={onOpenFilterModal}
                className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-white border-2 border-gray-200 
                         hover:border-brand-500 hover:bg-brand-50 transition-ios gpu-accelerated 
                         active:scale-95 shadow-sm hover:shadow-md"
                aria-label="Filter öffnen"
              >
                <SlidersHorizontal className="w-5 h-5 text-gray-700 transition-ios" />
                {activeFiltersCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm
                                animate-bounce-in transition-ios">
                    {activeFiltersCount > 9 ? "9+" : activeFiltersCount}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Products List */}
          <div className="pt-2 animate-stagger-3">
            <Suspense fallback={
              <div className="text-center py-8 animate-fade-in-scale">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mx-auto"></div>
              </div>
            }>
              <div className="animate-scale-in">
                <ProductsListComponent
                  isStandalone={false}
                  maxHeight="none"
                />
              </div>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
