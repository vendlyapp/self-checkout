'use client';

import { ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import Sidebar from '@/components/navigation/Sidebar';
import ResponsiveHeader from '@/components/navigation/ResponsiveHeader';
import ResponsiveFooterNav from '@/components/navigation/ResponsiveFooterNav';
import { useResponsive, useScrollReset } from '@/hooks';
import { useCartStore } from '@/lib/stores/cartStore';
import FooterAddProduct from '@/components/dashboard/products_list/FooterAddProduct';
import CartSummary from '@/components/dashboard/charge/CartSummary';
import FooterContinue from '@/components/dashboard/charge/FooterContinue';
import HeaderNav from '@/components/navigation/HeaderNav';
import Filter_Busqueda from '@/components/dashboard/products_list/Filter_Busqueda';
import { useChargeContext } from '@/app/charge/layout';
import { useProductsList } from '@/components/dashboard/products_list/ProductsListContext';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isMobile, isTablet, isDesktop, isCollapsed } = useResponsive();
  const { scrollContainerRef } = useScrollReset();
  const {
    cartItems,
    getTotalItems,
    getSubtotal,
    getTotalWithDiscount,
    promoApplied,
    discountAmount,
    promoCode,
  } = useCartStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Determinar si estamos en la ruta de productos
  const isProductsListRoute = pathname?.startsWith('/products_list');

  // Determinar si estamos EXACTAMENTE en /products_list (página principal)
  const isProductsListMainPage = pathname === '/products_list';

  // Determinar si estamos en la ruta de charge
  const isChargeRoute = pathname?.startsWith('/charge');
  
  // Determinar si estamos EXACTAMENTE en /charge (página principal)
  const isChargeMainPage = pathname === '/charge';
  
  // Obtener contextos
  const chargeContext = useChargeContext();
  const productsListContext = useProductsList();

  // Determinar si mostrar el sidebar
  const shouldShowSidebar = isDesktop || isTablet;

  // No mostrar CartSummary móvil aquí, se maneja en el sidebar
  const shouldShowCartSummary = false;

  // Cálculos del carrito para charge
  const totalItems = getTotalItems();
  const subtotal = getSubtotal();
  const total = getTotalWithDiscount();


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

  // Navegación inteligente para charge basada en la ruta actual
  const handleChargeContinue = () => {
    if (pathname === "/charge") {
      router.push("/charge/cart");
    } else if (pathname === "/charge/cart") {
      router.push("/charge/payment");
    } else {
      router.push("/charge/payment");
    }
  };

  // Navegación para el CartSummary (cuando no hay items)
  const handleContinueToProducts = () => {
    router.push("/charge");
  };

  // Determinar qué componente de footer mostrar en charge
  const shouldShowFooterContinue = () => {
    return pathname === "/charge/cart" && cartItems.length > 0;
  };

  const shouldShowChargeSummary = () => {
    return pathname === "/charge" && cartItems.length > 0;
  };

  const shouldShowEmptyCartSummary = () => {
    return pathname === "/charge" && cartItems.length === 0;
  };


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

        {/* Header de charge con filtros - Solo en móvil y EXACTAMENTE en /charge */}
        {isMobile && isChargeMainPage && chargeContext && (
          <>
            <HeaderNav 
              title="Verkauf starten" 
              showAddButton={false} 
              isFixed={true} 
            />
            <Filter_Busqueda
              searchQuery={chargeContext.searchQuery}
              onSearch={chargeContext.onSearch}
              selectedFilters={chargeContext.selectedFilters}
              onFilterChange={chargeContext.onFilterChange}
              onOpenFilterModal={chargeContext.onOpenFilterModal}
              activeFiltersCount={chargeContext.activeFiltersCount}
              productsListFilters={chargeContext.chargeFilters}
              isFixed={true}
            />
          </>
        )}

        {/* Header de products_list con filtros - Solo en móvil y EXACTAMENTE en /products_list */}
        {isMobile && isProductsListMainPage && productsListContext && (
          <>
            <HeaderNav 
              title="Produkte" 
              showAddButton={true} 
              isFixed={true} 
            />
            <Filter_Busqueda
              searchQuery={productsListContext.searchQuery}
              onSearch={productsListContext.onSearch}
              selectedFilters={productsListContext.selectedFilters}
              onFilterChange={productsListContext.onFilterChange}
              onOpenFilterModal={productsListContext.onOpenFilterModal}
              activeFiltersCount={productsListContext.activeFiltersCount}
              productsListFilters={productsListContext.productsListFilters}
              isFixed={true}
            />
          </>
        )}

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

        {/* Footer móvil - Solo en móvil y NO en rutas de charge */}
        {isMobile && !isProductsListRoute && !isChargeRoute && (
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

        {/* FooterContinue para charge/cart - Solo en móvil */}
        {isMobile && shouldShowFooterContinue() && (
          <FooterContinue
            subtotal={subtotal}
            promoApplied={promoApplied}
            discountAmount={discountAmount}
            totalItems={totalItems}
            total={total}
            onContinue={handleChargeContinue}
            promoCode={promoCode}
          />
        )}

        {/* CartSummary para charge - Solo en móvil */}
        {isMobile && shouldShowChargeSummary() && (
          <CartSummary
            items={cartItems}
            onContinue={handleChargeContinue}
            isVisible={true}
          />
        )}

        {/* CartSummary vacío para charge - Solo en móvil */}
        {isMobile && shouldShowEmptyCartSummary() && (
          <CartSummary
            items={[]}
            onContinue={handleContinueToProducts}
            isVisible={true}
          />
        )}
      </div>
    </div>
  );
}
