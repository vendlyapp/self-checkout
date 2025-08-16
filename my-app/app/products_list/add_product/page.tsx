'use client';

import React from 'react';
import Form from '@/components/dashboard/createProduct/Form';
import HeaderNav from '@/components/navigation/HeaderNav';

export default function AddProduct() {
  return (
    <div className="h-full w-full overflow-hidden">
      <HeaderNav title="Produkt erstellen"  />
      <Form />
    </div>
  );
} 