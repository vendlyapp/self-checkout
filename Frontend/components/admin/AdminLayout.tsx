'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { Receipt } from 'lucide-react';
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
import OrderFilters from '@/components/dashboard/orders/OrderFilters';
import { useOrdersContext } from '@/components/dashboard/orders/OrdersContext';

// Componente wrapper para usar el contexto de órdenes
function OrderFiltersWrapper() {
  try {
    const ordersContext = useOrdersContext();
    return (
      <OrderFilters 
        searchQuery={ordersContext.searchQuery}
        onSearch={ordersContext.onSearch}
        isFixed={true} 
      />
    );
  } catch {
    // Si no hay contexto, mostrar sin búsqueda
    return <OrderFilters searchQuery="" onSearch={() => {}} isFixed={true} />;
  }
}
import InvoiceActionsFooter from '@/components/dashboard/invoice/InvoiceActionsFooter';
import { useInvoice } from '@/hooks/queries/useInvoice';
import { useOrder } from '@/hooks/queries/useOrder';
import { useChargeContext } from '@/app/charge/contexts';
import { useProductsList } from '@/components/dashboard/products_list/ProductsListContext';
import LoadingProductsModal from '@/components/dashboard/home/LoadingProductsModal';
import { useLoadingProductsModal } from '@/lib/contexts/LoadingProductsModalContext';

// Extender Window interface para propiedades personalizadas
declare global {
  interface Window {
    __categoryFormIsValid?: boolean;
    __categoryFormIsSubmitting?: boolean;
    __categoryFormHasChanges?: boolean;
  }
}

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
  
  // Determinar si estamos en la ruta de payment-methods
  const isPaymentMethodsRoute = pathname?.startsWith('/store/payment-methods');
  
  // Determinar si estamos en la ruta de invoice (nueva ruta en /sales/invoices o antigua en /store/invoice)
  const isInvoiceRoute = pathname?.startsWith('/store/invoice') || pathname?.startsWith('/sales/invoices');
  
  // Determinar si estamos en el detalle de una factura (tiene ID)
  const isInvoiceDetailRoute = pathname?.match(/\/store\/invoice\/[^\/]+/) || pathname?.match(/\/sales\/invoices\/[^\/]+/);
  
  // Extraer invoiceId del pathname para el HeaderNav (soporta ambas rutas)
  const invoiceId = pathname?.match(/\/store\/invoice\/([^\/]+)/)?.[1] || pathname?.match(/\/sales\/invoices\/([^\/]+)/)?.[1];
  
  // Determinar si estamos en la ruta de orders
  const isOrderRoute = pathname?.startsWith('/sales/orders');
  
  // Determinar si estamos EXACTAMENTE en /sales/orders (página principal de órdenes)
  const isOrdersListMainPage = pathname === '/sales/orders';
  
  // Determinar si estamos en la ruta de verkaufe (ventas completas)
  const isVerkaufeRoute = pathname?.startsWith('/sales/verkaufe');
  
  // Determinar si estamos en el detalle de una orden (tiene ID)
  const isOrderDetailRoute = pathname?.match(/\/sales\/orders\/[^\/]+/);
  
  // Extraer orderId del pathname para el HeaderNav
  const orderId = pathname?.match(/\/sales\/orders\/([^\/]+)/)?.[1];
  
  // Usar React Query hook para obtener invoice (comparte cache con otros componentes)
  // Solo obtener si estamos en una ruta de detalle de invoice
  const { data: invoiceForHeader } = useInvoice(
    isInvoiceDetailRoute && invoiceId ? invoiceId : null
  );
  
  // Usar React Query hook para obtener order (comparte cache con otros componentes)
  // Solo obtener si estamos en una ruta de detalle de order
  const { data: orderForHeader } = useOrder(
    isOrderDetailRoute && orderId ? orderId : null
  );
  
  // Determinar si estamos en la ruta de settings
  const isSettingsRoute = pathname?.startsWith('/store/settings');
  
  // Determinar si estamos en la ruta de my-qr
  const isMyQRRoute = pathname === '/my-qr' || pathname === '/my-qr/';
  
  // Determinar si estamos en la ruta de sales (página principal)
  const isSalesRoute = pathname === '/sales' || pathname === '/sales/';
  
  // Determinar si estamos en la lista de invoices (no detalle)
  const isInvoicesListRoute = (pathname === '/sales/invoices' || pathname === '/store/invoice') && !isInvoiceDetailRoute;
  
  // Determinar si estamos en la lista de orders (no detalle)
  const isOrdersListRoute = isOrderRoute && !isOrderDetailRoute;
  
  // Determinar si estamos en verkaufe (ventas completas)
  const isVerkaufeListRoute = isVerkaufeRoute;
  
  // Determinar si estamos en otras rutas de store
  const isCustomersRoute = pathname?.startsWith('/store/customers');
  const isProfileRoute = pathname?.startsWith('/store/profile');
  const isPrinterRoute = pathname?.startsWith('/store/printer');
  const isBackupsRoute = pathname?.startsWith('/store/backups');
  const isNotificationsRoute = pathname?.startsWith('/store/notifications');
  const isHelpRoute = pathname?.startsWith('/store/help');
  
  // Función para obtener el título del HeaderNav según la ruta
  const getHeaderNavTitleForStoreSales = (): string | null => {
    if (isPaymentMethodsRoute) return 'Zahlungsarten verwalten';
    if (isSettingsRoute) return 'Mein Geschäft';
    if (isDiscountsRoute) return 'Rabatte & Codes';
    if (isMyQRRoute) return 'Mein QR-Code';
    if (isCustomersRoute) return 'Kunden verwalten';
    if (isProfileRoute) return 'Mein Profil';
    if (isPrinterRoute) return 'POS-Drucker';
    if (isBackupsRoute) return 'Backups';
    if (isNotificationsRoute) return 'Benachrichtigungen';
    if (isHelpRoute) return 'Hilfe & FAQ';
    if (isInvoicesListRoute) {
      return pathname?.startsWith('/sales/invoices') ? 'Belege' : 'Rechnungen';
    }
    if (isVerkaufeListRoute) return 'Verkäufe';
    if (isOrdersListRoute) return 'Bestellungen';
    return null;
  };
  
  // Función para obtener el closeDestination según la ruta
  const getHeaderNavCloseDestination = (): string => {
    if (isPaymentMethodsRoute || isSettingsRoute || isDiscountsRoute || 
        isCustomersRoute || isProfileRoute || isPrinterRoute || 
        isBackupsRoute || isNotificationsRoute || isHelpRoute ||
        (isInvoicesListRoute && pathname?.startsWith('/store/invoice'))) {
      return '/store';
    }
    if (isMyQRRoute) {
      return '/store';
    }
    if (isInvoicesListRoute && pathname?.startsWith('/sales/invoices')) {
      return '/sales';
    }
    if (isVerkaufeListRoute || isOrdersListRoute) {
      return '/sales';
    }
    return '/dashboard';
  };
  
  const headerNavTitleForStoreSales = getHeaderNavTitleForStoreSales();
  const shouldShowStoreSalesHeaderNav = isMobile && headerNavTitleForStoreSales !== null;
  
  // Rutas que ocultan el navbar/sidebar
  const isStoreSubRoute = isDiscountsRoute || isPaymentMethodsRoute || isInvoiceRoute || 
                          isSettingsRoute || isCustomersRoute || isProfileRoute || 
                          isPrinterRoute || isBackupsRoute || isNotificationsRoute || isHelpRoute;
  
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

  // Determinar si mostrar el sidebar (ocultar en discounts y payment-methods)
  const shouldShowSidebar = (isDesktop || isTablet) && !isStoreSubRoute;

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
          setIsCategoryFormValid(window.__categoryFormIsValid || false);
          setHasCategoryChanges(window.__categoryFormHasChanges || false);
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
        "flex flex-col flex-1 overflow-hidden transition-ios-slow",
        isMobile ? "ml-0" : ""
      )}>
        {/* Header - Siempre visible (incluye logo) */}
        <ResponsiveHeader
          onMenuToggle={handleSidebarToggle}
          showMenuButton={isMobile && !isStoreSubRoute}
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

        {/* Header de invoice detail - Solo en móvil y en detalle de factura */}
        {isMobile && isInvoiceDetailRoute && (
          <HeaderNav 
            title={invoiceForHeader?.invoiceNumber || 'Rechnung'} 
            closeDestination={pathname?.startsWith('/sales/invoices') ? "/sales/invoices" : "/store/invoice"}
            isFixed={true}
            rightAction={invoiceForHeader?.orderId ? {
              icon: Receipt,
              onClick: () => router.push(`/sales/orders/${invoiceForHeader.orderId}`),
              label: 'Zugehörige Bestellung ansehen'
            } : undefined}
          />
        )}

        {/* Header de order detail - Solo en móvil y en detalle de orden */}
        {isMobile && isOrderDetailRoute && (
          <HeaderNav 
            title={orderForHeader ? `Bestellung #${orderForHeader.id.slice(-8).toUpperCase()}` : 'Bestellung'} 
            closeDestination="/sales/orders"
            isFixed={true} 
          />
        )}

        {/* HeaderNav para rutas de store y sales (listas y configuraciones) */}
        {shouldShowStoreSalesHeaderNav && (
          <HeaderNav 
            title={headerNavTitleForStoreSales || ''} 
            closeDestination={getHeaderNavCloseDestination()}
            isFixed={true} 
          />
        )}

        {/* Filtros de órdenes - Solo en móvil y EXACTAMENTE en /sales/orders */}
        {isMobile && isOrdersListMainPage && (
          <OrderFiltersWrapper />
        )}

        {/* Contenido principal */}
        <main
          ref={scrollContainerRef}
          className={clsx(
            "flex-1 overflow-y-auto overflow-x-hidden",
            isMobile ? "ios-scroll-fix" : "scroll-smooth",
            shouldShowCartSummary && "pb-24", // Padding para el CartSummary fixed
            isMobile && isInvoiceDetailRoute && "pb-24 pt-[calc(70px+env(safe-area-inset-top))]", // Padding para ResponsiveHeader (~85px) + HeaderNav fixed (~70px) y InvoiceActionsFooter fixed
            isMobile && isOrderDetailRoute && "pt-[calc(70px+env(safe-area-inset-top))]", // Padding para ResponsiveHeader (~85px) + HeaderNav fixed (~70px)
            shouldShowStoreSalesHeaderNav && "pt-[calc(70px+env(safe-area-inset-top))]" // Padding para ResponsiveHeader (~85px) + HeaderNav fixed (~70px)
          )}
        >
          <div className={clsx(
            "w-full min-h-full",
            isMobile ? "max-w-[430px] mx-auto bg-background-cream mobile-content-padding" : "bg-background-cream"
          )}>
            {children}
          </div>
        </main>

        {/* Footer móvil - Solo en móvil y NO en rutas de charge, products_list, categories, discounts, payment-methods o invoice */}
        {isMobile && !isProductsListRoute && !isChargeRoute && !isCategoriesRoute && !isAddCategoryPage && !isStoreSubRoute && (
          <ResponsiveFooterNav />
        )}

        {/* Invoice Actions Footer - Solo en móvil y en detalle de factura */}
        {isMobile && isInvoiceDetailRoute && (
          <InvoiceActionsFooter />
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
            isLoading={typeof window !== 'undefined' ? (window.__categoryFormIsSubmitting || false) : false}
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
