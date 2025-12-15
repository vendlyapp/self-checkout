'use client';

import React from 'react';
import HeaderNav from '@/components/navigation/HeaderNav';
import Form from '@/components/dashboard/createProduct/Form';
import { useResponsive } from '@/hooks';

export default function AddProduct() {
  const { } = useResponsive();

  return (
    <div className="w-full animate-page-enter gpu-accelerated">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="h-full w-full overflow-hidden">
          <div className="animate-slide-in-right">
            <HeaderNav title="Produkt erstellen" />
          </div>
          <div className="animate-slide-up-fade">
            <Form isDesktop={false} />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="p-6 space-y-6">
          <div className="animate-stagger-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight transition-interactive">
                Neues Produkt erstellen
              </h1>
              <p className="text-gray-500 mt-2 text-base transition-interactive">
                Füllen Sie das Formular aus, um ein neues Produkt hinzuzufügen
              </p>
            </div>
          </div>
          <div className="animate-stagger-2">
            <Form isDesktop={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
