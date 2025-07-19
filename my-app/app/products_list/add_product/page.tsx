'use client';

import React from 'react';
import FixedHeaderContainerSimple from '@/components/dashboard/products_list/FixedHeaderContainerSimple';

export default function AddProduct() {
  return (
    <FixedHeaderContainerSimple title="Neues Produkt" showAddButton={false}>
      <div className="p-4">
        {/* Formulario placeholder */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-600 text-center py-8">
            Formular zum Hinzufügen neuer Produkte wird hier implementiert...
          </p>
        </div>
      </div>
    </FixedHeaderContainerSimple>
  );
} 