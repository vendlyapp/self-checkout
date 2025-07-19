'use client';

import React from 'react';
import ProductsListComponent from '@/components/dashboard/products_list/ProductsListComponent';

/**
 * ProductsList Page - Página principal de la lista de productos
 * 
 * Esta página usa el componente reutilizable ProductsListComponent
 * con isStandalone=true para mostrar la funcionalidad completa
 * con footer y scroll propio.
 */
export default function ProductsList() {
  return (
    <ProductsListComponent 
      isStandalone={true}
    />
  );
}