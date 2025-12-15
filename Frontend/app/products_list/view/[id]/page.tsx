'use client';

import React, { useEffect, useState, Suspense } from 'react';
import EditForm from '@/components/dashboard/editProduct/EditForm';
import HeaderNav from '@/components/navigation/HeaderNav';

interface PageProps {
  params: Promise<{ id: string }>;
}

function ViewProductContent({ productId }: { productId: string }) {
  return (
    <div className="animate-page-enter gpu-accelerated">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="animate-slide-in-right">
          <HeaderNav title="Produktdetails" />
        </div>
        <div className="animate-slide-up-fade">
          <EditForm productId={productId} isDesktop={false} />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 animate-stagger-1">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 transition-interactive">Produktdetails</h1>
              <p className="text-gray-600 mt-1 transition-interactive">Bearbeiten Sie alle Details Ihres Produkts</p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 
                       transition-interactive gpu-accelerated
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

export default function ViewProduct({ params }: PageProps) {
  const [productId, setProductId] = useState<string>('');

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setProductId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  if (!productId) {
    return (
      <div className="w-full h-auto min-h-[50vh] flex items-center justify-center">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-500 mx-auto" />
          <p className="mt-4 text-base text-gray-600 font-medium">Lade...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="w-full h-auto min-h-[50vh] flex items-center justify-center">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-500 mx-auto" />
          <p className="mt-4 text-base text-gray-600 font-medium">Produkt wird geladen...</p>
        </div>
      </div>
    }>
      <ViewProductContent productId={productId} />
    </Suspense>
  );
}
