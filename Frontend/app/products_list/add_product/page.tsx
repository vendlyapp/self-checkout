'use client';

import React from 'react';
import HeaderNav from '@/components/navigation/HeaderNav';
import Form from '@/components/dashboard/createProduct/Form';
import { useResponsive } from '@/hooks';

export default function AddProduct() {
  const { } = useResponsive();

  return (
    <div className="w-full">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="h-full w-full overflow-hidden">
          <HeaderNav title="Produkt erstellen" />
          <Form isDesktop={false} />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="p-6 space-y-6">
          <Form isDesktop={true} />
        </div>
      </div>
    </div>
  );
}
