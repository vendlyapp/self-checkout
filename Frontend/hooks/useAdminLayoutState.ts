'use client';

import { usePathname } from 'next/navigation';
import { useInvoice } from '@/hooks/queries/useInvoice';
import { useOrder } from '@/hooks/queries/useOrder';

export function useAdminLayoutState() {
  const pathname = usePathname() ?? '';

  // Route flags
  const isProductsListRoute        = pathname.startsWith('/products_list');
  const isProductsListMainPage     = pathname === '/products_list';
  const isProductsListAddProductPage = pathname === '/products_list/add_product';
  const isProductsListViewProductRoute = pathname.startsWith('/products_list/view/');
  const isCategoriesRoute          = pathname.startsWith('/categories');
  const isCategoriesMainPage       = pathname === '/categories';
  const isAddCategoryPage          = pathname === '/categories/add';
  const isEditingCategory          = isAddCategoryPage && typeof window !== 'undefined' && window.location.search.includes('id=');
  const isDiscountsRoute           = pathname.startsWith('/store/discounts');
  const isPaymentMethodsRoute      = pathname.startsWith('/store/payment-methods');
  const isInvoiceRoute             = pathname.startsWith('/store/invoice') || pathname.startsWith('/sales/invoices');
  const isInvoiceDetailRoute       = !!(pathname.match(/\/store\/invoice\/[^/]+/) || pathname.match(/\/sales\/invoices\/[^/]+/));
  const isOrderRoute               = pathname.startsWith('/sales/orders');
  const isOrdersListMainPage       = pathname === '/sales/orders';
  const isVerkaufeRoute            = pathname.startsWith('/sales/verkaufe');
  const isGoalsRoute               = pathname.startsWith('/sales/goals');
  const isBestsellerRoute          = pathname.startsWith('/sales/bestseller');
  const isOrderDetailRoute         = !!pathname.match(/\/sales\/orders\/[^/]+/);
  const isSettingsRoute            = pathname.startsWith('/store/settings');
  const isMyQRRoute                = pathname === '/my-qr' || pathname === '/my-qr/';
  const isInvoicesListRoute        = (pathname === '/sales/invoices' || pathname === '/store/invoice') && !isInvoiceDetailRoute;
  const isOrdersListRoute          = isOrderRoute && !isOrderDetailRoute;
  const isVerkaufeListRoute        = isVerkaufeRoute;
  const isCustomersRoute           = pathname.startsWith('/store/customers');
  const isProfileRoute             = pathname.startsWith('/store/profile');
  const isPrinterRoute             = pathname.startsWith('/store/printer');
  const isBackupsRoute             = pathname.startsWith('/store/backups');
  const isNotificationsRoute       = pathname.startsWith('/store/notifications');
  const isHelpRoute                = pathname.startsWith('/store/help');
  const isQrBarcodesRoute          = pathname.startsWith('/store/qr-barcodes');
  const isChargeRoute              = pathname.startsWith('/charge');
  const isChargeMainPage           = pathname === '/charge';
  const isEditMode                 = pathname.includes('/products_list/edit/') || pathname.includes('/products_list/view/');
  const isStoreSubRoute            = isPaymentMethodsRoute || isInvoiceRoute || isSettingsRoute ||
                                     isQrBarcodesRoute || isCustomersRoute || isProfileRoute ||
                                     isPrinterRoute || isBackupsRoute || isNotificationsRoute || isHelpRoute;

  // IDs from pathname
  const invoiceId = pathname.match(/\/store\/invoice\/([^/]+)/)?.[1] || pathname.match(/\/sales\/invoices\/([^/]+)/)?.[1];
  const orderId   = pathname.match(/\/sales\/orders\/([^/]+)/)?.[1];

  // Conditional queries — only fire when on the relevant route
  const { data: invoiceForHeader } = useInvoice(isInvoiceDetailRoute && invoiceId ? invoiceId : null);
  const { data: orderForHeader }   = useOrder(isOrderDetailRoute && orderId ? orderId : null);

  // Header nav title
  const headerNavTitle = (() => {
    if (isPaymentMethodsRoute) return 'Zahlungsarten verwalten';
    if (isSettingsRoute) return 'Einstellungen';
    if (isDiscountsRoute) return 'Rabatte & Codes';
    if (isQrBarcodesRoute) return 'QR- & Barcodes';
    if (isMyQRRoute) return 'Mein QR-Code';
    if (isCustomersRoute) return 'Kunden verwalten';
    if (isProfileRoute) return 'Mein Profil';
    if (isPrinterRoute) return 'POS-Drucker';
    if (isBackupsRoute) return 'Backups';
    if (isNotificationsRoute) return 'Benachrichtigungen';
    if (isHelpRoute) return 'Hilfe & FAQ';
    if (isInvoicesListRoute) return pathname.startsWith('/sales/invoices') ? 'Belege' : 'Rechnungen';
    if (isVerkaufeListRoute) return 'Verkäufe';
    if (isOrdersListRoute) return 'Bestellungen';
    if (isGoalsRoute) return 'Ziele konfigurieren';
    if (isBestsellerRoute) return 'Bestseller';
    return null;
  })();

  const headerNavCloseDestination = (() => {
    if (isPaymentMethodsRoute || isSettingsRoute || isDiscountsRoute ||
        isQrBarcodesRoute || isCustomersRoute || isProfileRoute || isPrinterRoute ||
        isBackupsRoute || isNotificationsRoute || isHelpRoute ||
        (isInvoicesListRoute && pathname.startsWith('/store/invoice'))) return '/store';
    if (isMyQRRoute) return '/store';
    if (isInvoicesListRoute && pathname.startsWith('/sales/invoices')) return '/sales';
    if (isVerkaufeListRoute || isOrdersListRoute || isGoalsRoute || isBestsellerRoute) return '/sales';
    return '/dashboard';
  })();

  const invoiceTitle = invoiceForHeader?.invoiceNumber || 'Rechnung';
  const orderTitle   = orderForHeader?.id != null && String(orderForHeader.id).length > 0
    ? `Bestellung #${String(orderForHeader.id).slice(-8).toUpperCase()}`
    : 'Bestellung';

  return {
    pathname,
    isProductsListRoute, isProductsListMainPage, isProductsListAddProductPage, isProductsListViewProductRoute,
    isCategoriesRoute, isCategoriesMainPage, isAddCategoryPage, isEditingCategory,
    isDiscountsRoute, isPaymentMethodsRoute, isInvoiceRoute, isInvoiceDetailRoute,
    isOrderRoute, isOrdersListMainPage, isVerkaufeRoute, isGoalsRoute, isBestsellerRoute,
    isOrderDetailRoute, isSettingsRoute, isMyQRRoute, isInvoicesListRoute,
    isOrdersListRoute, isVerkaufeListRoute, isCustomersRoute, isProfileRoute,
    isPrinterRoute, isBackupsRoute, isNotificationsRoute, isHelpRoute, isQrBarcodesRoute,
    isChargeRoute, isChargeMainPage, isEditMode, isStoreSubRoute,
    invoiceId, orderId,
    invoiceForHeader, orderForHeader,
    headerNavTitle, headerNavCloseDestination,
    invoiceTitle, orderTitle,
  };
}
