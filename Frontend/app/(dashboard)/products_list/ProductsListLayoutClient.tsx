'use client';

import { ReactNode } from 'react';
import { useResponsive } from '@/hooks';
import { ProductsListProvider } from '@/components/dashboard/products_list/ProductsListContext';
import { LoadingProductsModalProvider } from '@/lib/contexts/LoadingProductsModalContext';

function ProductsListLayoutContent({ children }: { children: ReactNode }) {
  const { isMobile } = useResponsive();

  return (
    <div className={`${isMobile ? 'pb-24' : 'pb-6'} min-w-0`}>{children}</div>
  );
}

export default function ProductsListLayoutClient({ children }: { children: ReactNode }) {
  return (
    <LoadingProductsModalProvider>
      <ProductsListProvider>
        <ProductsListLayoutContent>{children}</ProductsListLayoutContent>
      </ProductsListProvider>
    </LoadingProductsModalProvider>
  );
}
