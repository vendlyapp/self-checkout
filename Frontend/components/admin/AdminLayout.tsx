'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { Receipt } from 'lucide-react';
import Sidebar from '@/components/navigation/Sidebar';
import ResponsiveHeader from '@/components/navigation/ResponsiveHeader';
import ResponsiveFooterNav from '@/components/navigation/ResponsiveFooterNav';
import { useResponsive, useScrollReset } from '@/hooks';
import { useCartStore } from '@/lib/stores/cartStore';
import { useProductFormStore } from '@/lib/stores/productFormStore';
import { useCategoryFormStore } from '@/lib/stores/categoryFormStore';
import FooterAddProduct from '@/components/dashboard/products_list/FooterAddProduct';
import FooterAddCategory from '@/components/dashboard/categories/FooterAddCategory';
import CartSummary from '@/components/dashboard/charge/CartSummary';
import FooterContinue from '@/components/dashboard/charge/FooterContinue';
import HeaderNav from '@/components/navigation/HeaderNav';
import Filter_Busqueda from '@/components/dashboard/products_list/Filter_Busqueda';
import OrderFilters from '@/components/dashboard/orders/OrderFilters';
import { useOrdersContext } from '@/components/dashboard/orders/OrdersContext';
import InvoiceActionsFooter from '@/components/dashboard/invoice/InvoiceActionsFooter';
import LoadingProductsModal from '@/components/dashboard/home/LoadingProductsModal';
import { useLoadingProductsModal } from '@/lib/contexts/LoadingProductsModalContext';
import { useStoreSettingsHeader } from '@/lib/contexts/StoreSettingsHeaderContext';
import { useProductsList } from '@/components/dashboard/products_list/ProductsListContext';
import { useAdminLayoutState } from '@/hooks/useAdminLayoutState';
import {
  TOP_HEADER_NAV_PX,
  MAIN_PT_HEADER_NAV_ONLY_PX,
  MAIN_PT_STORE_SECTION_PX,
  MAIN_PT_WITH_FILTER_BARS_PX,
  MAIN_PT_ORDERS_LIST_MOBILE_PX,
  BESTSELLER_TOP_OFFSET_PX,
} from '@/lib/constants/layoutHeights';

function OrderFiltersWrapper() {
  try {
    const ctx = useOrdersContext();
    return <OrderFilters searchQuery={ctx.searchQuery} onSearch={ctx.onSearch} isFixed={true} />;
  } catch {
    return <OrderFilters searchQuery="" onSearch={() => {}} isFixed={true} />;
  }
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isMobile, isTablet, isDesktop, isCollapsed } = useResponsive();
  const { scrollContainerRef } = useScrollReset();
  const router = useRouter();
  const storeSettingsHeader = useStoreSettingsHeader();
  const { isOpen: isProductsLoadingModalOpen, closeModal } = useLoadingProductsModal();
  const productsListContext = useProductsList();

  const {
    pathname,
    isProductsListRoute, isProductsListMainPage, isProductsListAddProductPage, isProductsListViewProductRoute,
    isCategoriesRoute, isCategoriesMainPage, isAddCategoryPage, isEditingCategory,
    isInvoiceDetailRoute, isOrdersListMainPage, isGoalsRoute, isBestsellerRoute,
    isOrderDetailRoute, isSettingsRoute, isMyQRRoute, isInvoicesListRoute, isVerkaufeListRoute,
    isOrdersListRoute, isChargeRoute, isChargeMainPage, isEditMode, isStoreSubRoute,
    invoiceForHeader, headerNavTitle, headerNavCloseDestination, invoiceTitle, orderTitle,
  } = useAdminLayoutState();

  const {
    cartItems, getTotalItems, getSubtotal, getTotalWithDiscount,
    promoApplied, discountAmount,
  } = useCartStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasFormChanges    = useProductFormStore((s) => s.hasChanges);
  const triggerProductSave = useProductFormStore((s) => s.triggerSave);
  const isCategoryFormValid      = useCategoryFormStore((s) => s.isFormValid);
  const hasCategoryChanges       = useCategoryFormStore((s) => s.hasChanges);
  const isCategoryFormSubmitting = useCategoryFormStore((s) => s.isSubmitting);

  // Close loading modal on route change
  useEffect(() => {
    if (isProductsLoadingModalOpen) closeModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const shouldShowSidebar = isDesktop || isTablet;
  const totalItems = getTotalItems();
  const subtotal   = getSubtotal();
  const total      = getTotalWithDiscount();

  const handleSidebarToggle = () => { if (isMobile) setSidebarOpen(p => !p); };

  const handleAddProduct = () => {
    if (isEditMode || pathname === '/products_list/add_product') triggerProductSave();
    else window.location.href = '/products_list/add_product';
  };

  const handleSaveCategory = () => {
    const form = document.getElementById('category-form') as HTMLFormElement | null;
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  };

  const handleChargeContinue = () => {
    router.push(pathname === '/charge' ? '/charge/cart' : '/charge/payment');
  };

  const isAddProductPage  = pathname === '/products_list/add_product';
  const buttonText        = isEditMode ? 'Änderungen speichern' : isAddProductPage ? 'Produkt speichern' : 'Neues Produkt';
  const shouldShowStoreSalesHeaderNav = isMobile && headerNavTitle !== null;

  // Padding-top calculation
  const needsFilterBarsPt   = isProductsListMainPage || isOrdersListMainPage;
  const needsHeaderNavOnlyPt = isInvoiceDetailRoute || isOrderDetailRoute || isProductsListAddProductPage || isProductsListViewProductRoute || headerNavTitle !== null;
  const isStoreSectionRoute  = (pathname.startsWith('/store/') || isInvoicesListRoute || isVerkaufeListRoute) && headerNavTitle !== null;
  const mainPtPx = needsFilterBarsPt
    ? (isOrdersListMainPage ? MAIN_PT_ORDERS_LIST_MOBILE_PX : MAIN_PT_WITH_FILTER_BARS_PX)
    : isBestsellerRoute ? BESTSELLER_TOP_OFFSET_PX
    : isStoreSectionRoute ? MAIN_PT_STORE_SECTION_PX
    : needsHeaderNavOnlyPt ? MAIN_PT_HEADER_NAV_ONLY_PX
    : null;

  return (
    <>
      <LoadingProductsModal isOpen={isProductsLoadingModalOpen} />

      <div className="flex flex-1 min-h-0 h-full w-full min-w-0 overflow-hidden bg-background-cream">
        {shouldShowSidebar && (
          <Sidebar isCollapsed={isCollapsed} onToggle={handleSidebarToggle} isMobile={isMobile} />
        )}

        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSidebarOpen(false)} />
        )}

        <div className={clsx('flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden transition-ios-slow', isMobile && 'ml-0')}>
          <ResponsiveHeader
            onMenuToggle={handleSidebarToggle}
            showMenuButton={isMobile && !isStoreSubRoute}
            isMobile={isMobile}
            isTablet={isTablet}
            isDesktop={isDesktop}
            sidebarVisible={shouldShowSidebar}
          />

          {/* Charge + ProductsList — HeaderNav + filtros fijos */}
          {isMobile && isProductsListMainPage && (
            <div className="fixed left-0 right-0 z-40 bg-background-cream flex flex-col"
              style={{ top: `calc(${TOP_HEADER_NAV_PX}px + env(safe-area-inset-top))` }}>
              {isProductsListMainPage && productsListContext && (
                <>
                  <HeaderNav title="Produkte" showAddButton={true} isFixed={false} noSafeArea={true} />
                  <Filter_Busqueda
                    searchQuery={productsListContext.searchQuery} onSearch={productsListContext.onSearch}
                    selectedFilters={productsListContext.selectedFilters} onFilterChange={productsListContext.onFilterChange}
                    onOpenFilterModal={productsListContext.onOpenFilterModal} activeFiltersCount={productsListContext.activeFiltersCount}
                    productsListFilters={productsListContext.productsListFilters} isFixed={false}
                  />
                </>
              )}
            </div>
          )}

          {/* Add/View product header */}
          {((isProductsListAddProductPage && isMobile) || (isProductsListViewProductRoute && (isMobile || isTablet))) && (
            <div className="fixed left-0 right-0 z-50 bg-background-cream flex flex-col"
              style={{ top: `calc(${TOP_HEADER_NAV_PX}px + env(safe-area-inset-top))` }}>
              <HeaderNav
                title={isProductsListAddProductPage ? 'Produkt erstellen' : 'Produktdetails'}
                isFixed={false} noSafeArea={true}
              />
            </div>
          )}

          {/* Invoice detail header */}
          {isMobile && isInvoiceDetailRoute && (
            <HeaderNav
              title={invoiceTitle}
              closeDestination={pathname.startsWith('/sales/invoices') ? '/sales/invoices' : '/store/invoice'}
              isFixed={true}
              rightAction={invoiceForHeader?.orderId ? {
                icon: Receipt,
                onClick: () => router.push(`/sales/orders/${invoiceForHeader.orderId}`),
                label: 'Zugehörige Bestellung ansehen',
              } : undefined}
            />
          )}

          {/* Order detail header */}
          {isMobile && isOrderDetailRoute && (
            <HeaderNav title={orderTitle} closeDestination="/sales/orders" isFixed={true} />
          )}

          {/* Store/Sales list headers */}
          {shouldShowStoreSalesHeaderNav && (
            <HeaderNav
              title={headerNavTitle!}
              closeDestination={headerNavCloseDestination}
              isFixed={true}
              rightContent={isSettingsRoute ? storeSettingsHeader?.rightContent ?? undefined : undefined}
            />
          )}

          {/* Orders filter bar */}
          {isMobile && isOrdersListMainPage && <OrderFiltersWrapper />}

          {/* Main content */}
          <main
            ref={scrollContainerRef}
            className={clsx(
              'flex-1 overflow-y-auto overflow-x-hidden',
              isMobile ? 'ios-scroll-fix' : 'scroll-smooth',
              isMobile && isInvoiceDetailRoute && 'pb-24',
              mainPtPx != null && 'main-pt-mobile-only',
            )}
            style={mainPtPx != null ? {
              paddingTop: (isProductsListAddProductPage || isProductsListViewProductRoute || isMyQRRoute)
                ? '100px'
                : `calc(${mainPtPx}px + env(safe-area-inset-top))`,
            } : undefined}
          >
            <div className={clsx(
              'w-full',
              isMobile && 'max-w-[430px] mx-auto bg-background-cream',
              isMobile && !isGoalsRoute && !isBestsellerRoute && 'min-h-full mobile-content-padding',
              isMobile && (isGoalsRoute || isBestsellerRoute) && 'pb-[120px]',
              !isMobile && 'bg-background-cream px-4 md:px-6 lg:px-8',
            )}>
              {children}
            </div>
          </main>

          {/* Footer nav */}
          {isMobile && !isProductsListRoute && !isChargeRoute && !isCategoriesRoute && !isAddCategoryPage && !isStoreSubRoute && (
            <ResponsiveFooterNav />
          )}

          {isMobile && isInvoiceDetailRoute && <InvoiceActionsFooter />}

          {isMobile && isProductsListRoute && (
            <FooterAddProduct
              onAddProduct={handleAddProduct}
              buttonText={buttonText}
              isAddProductPage={isAddProductPage || isEditMode}
              hasChanges={isEditMode ? hasFormChanges : undefined}
            />
          )}

          {isMobile && isCategoriesMainPage && (
            <FooterAddCategory
              onAddCategory={() => window.dispatchEvent(new CustomEvent('openCategoryForm'))}
              buttonText="Neue Kategorie erstellen"
            />
          )}

          {isMobile && isAddCategoryPage && (
            <FooterAddCategory
              onAddCategory={handleSaveCategory}
              isLoading={isCategoryFormSubmitting}
              buttonText={isEditingCategory ? 'Änderungen speichern' : 'Kategorie speichern'}
              isFormValid={isCategoryFormValid}
              isAddCategoryPage={true}
              hasChanges={hasCategoryChanges}
            />
          )}

          {isMobile && pathname === '/charge/cart' && cartItems.length > 0 && (
            <FooterContinue
              subtotal={subtotal} promoApplied={promoApplied} discountAmount={discountAmount}
              totalItems={totalItems} total={total} onContinue={handleChargeContinue}
            />
          )}

          {isMobile && isChargeMainPage && (
            <CartSummary
              items={cartItems}
              onContinue={cartItems.length > 0 ? handleChargeContinue : () => router.push('/charge')}
              isVisible={true}
            />
          )}
        </div>
      </div>
    </>
  );
}
