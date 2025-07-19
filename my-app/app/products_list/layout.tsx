'use client'
// app/(dashboard)/products_list/layout.tsx
import { ReactNode } from 'react';
import FooterAddProduct from '@/components/dashboard/products_list/FooterAddProduct';
import { ProductsListProvider, useProductsList } from '@/components/dashboard/products_list/ProductsListContext';
import { useRouter } from 'next/navigation';

function ProductsListLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { totalProducts, filteredProducts, hasActiveFilters, isLoading } = useProductsList();

  const handleAddProduct = () => {
    router.push('/products_list/add_product');
  };

  return (
    <div className="flex flex-col h-mobile bg-background-cream">
      {/* Contenido scrolleable con padding para el footer */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="min-h-full">
          {children}
        </div>
      </main>
      {/* Footer fijo para agregar productos */}
      <FooterAddProduct
        onAddProduct={handleAddProduct}
        totalProducts={totalProducts}
        isLoading={isLoading}
        filteredProducts={filteredProducts}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
}

export default function ProductsListLayout({ children }: { children: ReactNode }) {
  return (
    <ProductsListProvider>
      <ProductsListLayoutContent>
        {children}
      </ProductsListLayoutContent>
    </ProductsListProvider>
  );
} 