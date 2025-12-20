'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import Sidebar from '@/components/navigation/Sidebar';
import ResponsiveHeader from '@/components/navigation/ResponsiveHeader';
import ResponsiveFooterNav from '@/components/navigation/ResponsiveFooterNav';
import { useResponsive, useScrollReset } from '@/hooks';
import { useCartStore } from '@/lib/stores/cartStore';
import FooterAddProduct from '@/components/dashboard/products_list/FooterAddProduct';
import FooterAddCategory from '@/components/dashboard/categories/FooterAddCategory';
import CartSummary from '@/components/dashboard/charge/CartSummary';
import FooterContinue from '@/components/dashboard/charge/FooterContinue';
import HeaderNav from '@/components/navigation/HeaderNav';
import Filter_Busqueda from '@/components/dashboard/products_list/Filter_Busqueda';
import { useChargeContext } from '@/app/charge/contexts';
import { useProductsList } from '@/components/dashboard/products_list/ProductsListContext';
import LoadingProductsModal from '@/components/dashboard/home/LoadingProductsModal';
import { useLoadingProductsModal } from '@/lib/contexts/LoadingProductsModalContext';

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
  
  // Determinar si estamos en la ruta de categorías
  const isCategoriesRoute = pathname?.startsWith('/categories');
  
  // Determinar si estamos EXACTAMENTE en /categories (página principal)
  const isCategoriesMainPage = pathname === '/categories';
  
  // Determinar si estamos en la página de agregar categoría
  const isAddCategoryPage = pathname === '/categories/add';
  
  // Determinar si estamos editando una categoría (hay query param id)
  const isEditingCategory = isAddCategoryPage && typeof window !== 'undefined' && window.location.search.includes('id=');
  
  // Determinar si estamos en la ruta de discounts
  const isDiscountsRoute = pathname?.startsWith('/store/discounts');
  
  // Determinar si estamos en modo edición (edit o view)
  const isEditMode = pathname?.includes('/products_list/edit/') || pathname?.includes('/products_list/view/');
  
  // Detectar si hay cambios en el formulario de edición
  const [hasFormChanges, setHasFormChanges] = useState(false);
  
  useEffect(() => {
    if (isEditMode) {
      const checkChanges = () => {
        const hasChanges = (window as { __productFormHasChanges?: boolean }).__productFormHasChanges || false;
        setHasFormChanges(hasChanges);
      };
      
      // Verificar cambios periódicamente
      const interval = setInterval(checkChanges, 500);
      checkChanges(); // Verificar inmediatamente
      
      return () => clearInterval(interval);
    } else {
      setHasFormChanges(false);
    }
  }, [isEditMode, pathname]);

  // Determinar si estamos en la ruta de charge
  const isChargeRoute = pathname?.startsWith('/charge');
  
  // Determinar si estamos EXACTAMENTE en /charge (página principal)
  const isChargeMainPage = pathname === '/charge';
  
  // Obtener contextos
  const chargeContext = useChargeContext();
  const productsListContext = useProductsList();
  const { isOpen: isProductsLoadingModalOpen, closeModal } = useLoadingProductsModal();

  // Cerrar el modal de carga cuando cambie la ruta
  useEffect(() => {
    if (isProductsLoadingModalOpen) {
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Determinar si mostrar el sidebar (ocultar en discounts)
  const shouldShowSidebar = (isDesktop || isTablet) && !isDiscountsRoute;

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
    if (isEditMode) {
      // Si estamos en modo edición, buscar y hacer clic en el botón de guardar del formulario
      // Buscar cualquier botón que contenga "speichern" o "Änderungen"
      const buttons = document.querySelectorAll("button");
      const saveBtn = Array.from(buttons).find((btn) => {
        const text = btn.textContent?.toLowerCase() || "";
        return (text.includes("speichern") || text.includes("änderungen")) && !btn.disabled;
      });
      if (saveBtn) {
        (saveBtn as HTMLButtonElement).click();
      }
    } else if (pathname === "/products_list/add_product") {
      // Si estamos en la página de agregar producto, ejecutar la función de guardado
      if (typeof window !== "undefined") {
        const windowWithSaveProduct = window as unknown as { saveProduct?: () => void };
        if (windowWithSaveProduct.saveProduct) {
          windowWithSaveProduct.saveProduct();
        }
      }
    } else {
      // Si estamos en la lista, navegamos a agregar producto
      window.location.href = "/products_list/add_product";
    }
  };

  // Determinar el texto del botón según la ruta
  const isAddProductPage = pathname === "/products_list/add_product";
  const buttonText = isEditMode 
    ? "Änderungen speichern" 
    : (isAddProductPage ? "Produkt speichern" : "Neues Produkt");
  
  // Manejar el botón de guardar categoría
  const handleSaveCategory = () => {
    if (isAddCategoryPage) {
      // Buscar el formulario y hacer submit
      const form = document.getElementById('category-form') as HTMLFormElement;
      if (form) {
        // Crear y disparar evento de submit
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      }
    }
  };

  // Detectar si el formulario de categoría es válido y si hay cambios
  const [isCategoryFormValid, setIsCategoryFormValid] = useState(false);
  const [hasCategoryChanges, setHasCategoryChanges] = useState(false);
  
  useEffect(() => {
    if (isAddCategoryPage) {
      const checkFormValidity = () => {
        if (typeof window !== 'undefined') {
          const windowWithValid = window as unknown as { 
            __categoryFormIsValid?: boolean;
            __categoryFormHasChanges?: boolean;
          };
          setIsCategoryFormValid(windowWithValid.__categoryFormIsValid || false);
          setHasCategoryChanges(windowWithValid.__categoryFormHasChanges || false);
        }
      };

      checkFormValidity();
      const interval = setInterval(checkFormValidity, 500);
      return () => clearInterval(interval);
    } else {
      setIsCategoryFormValid(false);
      setHasCategoryChanges(false);
    }
  }, [isAddCategoryPage, pathname]);

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


  // Contenedor para modales globales (fuera de cualquier scroll)
  const [modalContainer, setModalContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // Crear contenedor de modales si no existe
    if (typeof window !== 'undefined' && !document.getElementById('global-modals-container')) {
      const container = document.createElement('div');
      container.id = 'global-modals-container';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none'; // El contenedor no intercepta eventos
      container.style.zIndex = '99999';
      container.style.overflow = 'hidden';
      // Los modales dentro tendrán pointer-events: auto
      document.body.appendChild(container);
      setModalContainer(container);
    } else if (typeof window !== 'undefined') {
      const existingContainer = document.getElementById('global-modals-container');
      if (existingContainer) {
        setModalContainer(existingContainer as HTMLDivElement);
      }
    }
  }, []);

  return (
    <>
      {/* Modal de carga de productos - renderizado en el contenedor global */}
      {modalContainer && (
        <LoadingProductsModal isOpen={isProductsLoadingModalOpen} />
      )}
      
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
        {/* Header - Siempre visible (incluye logo) */}
        <ResponsiveHeader
          onMenuToggle={handleSidebarToggle}
          showMenuButton={isMobile && !isDiscountsRoute}
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

        {/* Footer móvil - Solo en móvil y NO en rutas de charge, products_list, categories o discounts */}
        {isMobile && !isProductsListRoute && !isChargeRoute && !isCategoriesRoute && !isAddCategoryPage && !isDiscountsRoute && (
          <ResponsiveFooterNav />
        )}

        {/* FooterAddProduct - Solo en móvil y en la ruta de productos */}
        {isMobile && isProductsListRoute && (
          <FooterAddProduct
            onAddProduct={handleAddProduct}
            buttonText={buttonText}
            isAddProductPage={isAddProductPage || isEditMode}
            hasChanges={isEditMode ? hasFormChanges : undefined}
          />
        )}

        {/* FooterAddCategory - Solo en móvil y en la ruta de categorías */}
        {isMobile && isCategoriesMainPage && (
          <FooterAddCategory
            onAddCategory={() => {
              // Disparar evento personalizado para navegar a crear categoría
              window.dispatchEvent(new CustomEvent('openCategoryForm'));
            }}
            buttonText="Neue Kategorie erstellen"
          />
        )}

        {/* FooterAddCategory para guardar - Solo en móvil y en la página de agregar categoría */}
        {isMobile && isAddCategoryPage && (
          <FooterAddCategory
            onAddCategory={handleSaveCategory}
            isLoading={typeof window !== 'undefined' ? ((window as any).__categoryFormIsSubmitting || false) : false}
            buttonText={
              isEditingCategory 
                ? "Änderungen speichern"
                : "Kategorie speichern"
            }
            isFormValid={isCategoryFormValid}
            isAddCategoryPage={true}
            hasChanges={hasCategoryChanges}
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
    </>
  );
}
