'use client';

import React, { Suspense } from 'react';
import EditForm from '@/components/dashboard/editProduct/EditForm';
import { Loader } from '@/components/ui/Loader';

function ViewProductContent({ productId }: { productId: string }) {
  return (
    <div className="min-w-0 animate-page-enter">
      <div className="block lg:hidden">
        <div className="animate-slide-up-fade">
          <EditForm productId={productId} isDesktop={false} />
        </div>
      </div>
      <div className="hidden lg:block">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 animate-stagger-1">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 transition-ios">Produktdetails</h1>
              <p className="text-gray-600 mt-1 transition-ios">Bearbeiten Sie alle Details Ihres Produkts</p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 
                       transition-ios gpu-accelerated
                       hover:bg-gray-100 rounded-lg active:scale-95"
            >
              <span>← Zurück</span>
            </button>
          </div>
          <div className="animate-stagger-2">
            <EditForm productId={productId} isDesktop={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewProductClient({ productId }: { productId: string }) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-auto min-h-[50vh] flex items-center justify-center">
          <div className="text-center py-12">
            <Loader size="lg" />
            <p className="mt-4 text-base text-gray-600 font-medium">Produkt wird geladen...</p>
          </div>
        </div>
      }
    >
      <ViewProductContent productId={productId} />
    </Suspense>
  );
}
