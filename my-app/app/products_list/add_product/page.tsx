'use client';

import React from 'react';
import FixedHeaderContainerSimple from '@/components/dashboard/products_list/FixedHeaderContainerSimple';
import Form from '@/components/dashboard/createProduct/Form';

export default function AddProduct() {
  return (
    <FixedHeaderContainerSimple title="Neues Produkt" showAddButton={false}>
      <Form />
    </FixedHeaderContainerSimple>
  );
} 