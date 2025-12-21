'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HeaderNav from '@/components/navigation/HeaderNav';
import CategoryFormPage from '@/components/dashboard/categories/CategoryFormPage';
import { useResponsive } from '@/hooks';
import { useCategories } from '@/hooks/queries/useCategories';

function AddCategoryContent() {
  const { } = useResponsive();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('id');
  const { data: categories = [] } = useCategories();
  
  // Buscar la categoría a editar si hay un ID
  const categoryToEdit = categoryId 
    ? categories.find(cat => cat.id === categoryId) || null
    : null;

  return (
    <div className="w-full animate-page-enter gpu-accelerated">
      {/* Mobile Layout */}
      <div className="lg:hidden h-screen flex flex-col overflow-hidden">
        <div className="animate-slide-in-right flex-shrink-0">
            <HeaderNav 
              title={categoryToEdit ? "Kategorie bearbeiten" : "Kategorie erstellen"} 
              closeDestination="/categories"
            />
        </div>
        <div className="flex-1 overflow-hidden animate-slide-up-fade">
          <CategoryFormPage isDesktop={false} category={categoryToEdit} />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="p-6 space-y-6">
          <div className="animate-stagger-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight transition-interactive">
                {categoryToEdit ? "Kategorie bearbeiten" : "Neue Kategorie erstellen"}
              </h1>
              <p className="text-gray-500 mt-2 text-base transition-interactive">
                {categoryToEdit 
                  ? "Bearbeiten Sie die Kategoriedaten"
                  : "Füllen Sie das Formular aus, um eine neue Kategorie hinzuzufügen"
                }
              </p>
            </div>
          </div>
          <div className="animate-stagger-2">
            <CategoryFormPage isDesktop={true} category={categoryToEdit} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddCategory() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
      </div>
    }>
      <AddCategoryContent />
    </Suspense>
  );
}

