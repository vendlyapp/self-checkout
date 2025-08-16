'use client'
// app/products_list/layout.tsx
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import FooterAddProduct from '@/components/dashboard/products_list/FooterAddProduct';
import { ProductsListProvider, useProductsList } from '@/components/dashboard/products_list/ProductsListContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/navigation/Header';

function ProductsListLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { totalProducts, filteredProducts, hasActiveFilters, isLoading } = useProductsList();

  const handleAddProduct = () => {
    router.push('/products_list/add_product');
  };

  return (
    <div className="flex flex-col h-full w-full bg-background-cream">
      {/* Header principal fijo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        <Header />
      </div>
      
      {/* Contenido principal con scroll y padding para el header fijo */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative" style={{ paddingTop: '77px' }}>
        <div className="min-h-full pb-32">
          {children}
        </div>
      </main>
      
      {/* Footer fijo para agregar productos */}
      {
        pathname === '/products_list/add_product' ? null : (
          <div className="fixed bottom-0 left-0 right-0 z-40">
            <FooterAddProduct
              onAddProduct={handleAddProduct}
              totalProducts={totalProducts}
              isLoading={isLoading}
              filteredProducts={filteredProducts}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        )
      }
     
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