'use client';

import React, { Suspense } from 'react';
import CategoriesListComponent from '@/components/dashboard/categories/CategoriesListComponent';
import { useResponsive } from '@/hooks';

// Hacer la página dinámica para evitar pre-rendering
export const dynamic = 'force-dynamic';

/**
 * Categories Page - Diseño optimizado para móvil y desktop
 */
export default function Categories() {
  const { } = useResponsive();

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
            <CategoriesListComponent
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
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight transition-interactive">Kategorienverwaltung</h1>
              <p className="text-gray-500 mt-2 text-base transition-interactive">Verwalten Sie Ihre Produktkategorien</p>
            </div>
            <div className="w-full max-w-md animate-stagger-2">
              <input
                type="text"
                placeholder="Kategorien durchsuchen..."
                className="w-full px-5 py-3.5 bg-white border-2 border-gray-200 rounded-2xl 
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent 
                         transition-interactive text-base placeholder:text-gray-400
                         shadow-sm hover:border-gray-300 hover:shadow-md gpu-accelerated"
              />
            </div>
          </div>

          {/* Categories List */}
          <div className="pt-2 animate-stagger-3">
            <Suspense fallback={
              <div className="text-center py-8 animate-fade-in-scale">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mx-auto"></div>
              </div>
            }>
              <div className="animate-scale-in">
                <CategoriesListComponent
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

