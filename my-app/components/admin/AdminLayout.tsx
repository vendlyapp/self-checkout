'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import Sidebar from '@/components/navigation/Sidebar';
import ResponsiveHeader from '@/components/navigation/ResponsiveHeader';
import ResponsiveFooterNav from '@/components/navigation/ResponsiveFooterNav';
import { useResponsive } from '@/lib/hooks/useResponsive';
import { useScrollReset } from '@/lib/hooks';
import { useCartStore } from '@/lib/stores/cartStore';
import FooterAddProduct from '@/components/dashboard/products_list/FooterAddProduct';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isMobile, isTablet, isDesktop, isCollapsed } = useResponsive();
  const { scrollContainerRef } = useScrollReset();
  const { } = useCartStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();



  // Determinar si estamos en la ruta de productos
  const isProductsListRoute = pathname?.startsWith('/products_list');

  // Determinar si mostrar el sidebar
  const shouldShowSidebar = isDesktop || isTablet;

  // No mostrar CartSummary móvil aquí, se maneja en el sidebar
  const shouldShowCartSummary = false;


  // Manejar toggle del sidebar
  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    }
    // En desktop y tablet no hay toggle - la sidebar siempre está visible
  };

  // Manejar el botón de agregar producto
  const handleAddProduct = () => {
    if (pathname === "/products_list/add_product") {
      // Si estamos en la página de agregar producto, ejecutar la función de guardado
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== "undefined" && (window as any).saveProduct) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).saveProduct();
      }
    } else {
      // Si estamos en la lista, navegamos a agregar producto
      window.location.href = "/products_list/add_product";
    }
  };

  // Determinar el texto del botón según la ruta
  const isAddProductPage = pathname === "/products_list/add_product";
  const buttonText = isAddProductPage ? "Produkt speichern" : "Neues Produkt";


  return (
    <div className="flex h-responsive bg-background-cream">
      {/* Sidebar */}
      {shouldShowSidebar && (
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={handleSidebarToggle}
          isMobile={isMobile}
        />
      )}

      {/* Overlay para móvil */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className={clsx(
        "flex flex-col flex-1 overflow-hidden transition-all duration-300",
        isMobile ? "ml-0" : ""
      )}>
        {/* Header */}
        <ResponsiveHeader
          onMenuToggle={handleSidebarToggle}
          showMenuButton={isMobile}
          isMobile={isMobile}
          isTablet={isTablet}
          isDesktop={isDesktop}
        />


        {/* Contenido principal */}
        <main
          ref={scrollContainerRef}
          className={clsx(
            "flex-1 overflow-y-auto overflow-x-hidden",
            isMobile ? "ios-scroll-fix" : "scroll-smooth",
            shouldShowCartSummary && "pb-24" // Padding para el CartSummary fixed
          )}
        >
          <div className={clsx(
            "w-full min-h-full",
            isMobile ? "max-w-[430px] mx-auto bg-background-cream mobile-content-padding" : "bg-background-cream"
          )}>
            {children}
          </div>
        </main>

        {/* Footer móvil - Solo en móvil */}
        {isMobile && !isProductsListRoute && (
          <ResponsiveFooterNav />
        )}

        {/* FooterAddProduct - Solo en móvil y en la ruta de productos */}
        {isMobile && isProductsListRoute && (
          <FooterAddProduct
            onAddProduct={handleAddProduct}
            buttonText={buttonText}
            isAddProductPage={isAddProductPage}
          />
        )}
      </div>
    </div>
  );
}
