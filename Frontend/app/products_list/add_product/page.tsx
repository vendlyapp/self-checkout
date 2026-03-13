'use client';

import React from 'react';
import Form from '@/components/dashboard/createProduct/Form';

export default function AddProduct() {

  return (
    <div className="w-full min-w-0 animate-page-enter gpu-accelerated">
      {/* Móvil: formulario (HeaderNav está en layout) */}
      <div className="block md:hidden">
        <div className="h-full w-full overflow-hidden min-w-0">
          <div className="animate-slide-up-fade">
            <Form isDesktop={false} />
          </div>
        </div>
      </div>

      {/* Tablet + Desktop: título + formulario — 820×1180 y 1024×1366 */}
      <div className="hidden md:block min-w-0">
        <div className="p-4 md:p-5 lg:p-6 xl:p-8 space-y-5 md:space-y-6 lg:space-y-8 max-w-4xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
          <div className="animate-stagger-1 min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">
              Neues Produkt erstellen
            </h1>
            <p className="text-muted-foreground mt-0.5 text-xs lg:text-sm">
              Füllen Sie das Formular aus, um ein neues Produkt hinzuzufügen
            </p>
          </div>
          <div className="animate-stagger-2 min-w-0">
            <Form isDesktop={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
