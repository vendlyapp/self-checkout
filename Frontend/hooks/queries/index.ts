/**
 * React Query Hooks
 * Hooks que usan TanStack Query para manejo de datos con cache
 */

// Product queries
export { useProductStats } from './useProductStats';
export { useProducts } from './useProducts';
export type { UseProductsOptions } from './useProducts';
export { useProductById } from './useProductById';
export { useProductByQR } from './useProductByQR';
export { useProductsAnalytics } from './useProductsAnalytics';

// Category queries
export { useCategoryStats } from './useCategoryStats';
export { useCategories } from './useCategories';

// Order queries
export { useOrderStats } from './useOrderStats';
export { useRecentOrders } from './useRecentOrders';
export { useOrders } from './useOrders';
export type { UseOrdersOptions } from './useOrders';
export { useOrder } from './useOrder';

// Store queries
export { useMyStore } from './useMyStore';

// Payment Method queries
export { usePaymentMethods } from './usePaymentMethods';
export type { PaymentMethod } from './usePaymentMethods';

// Invoice queries
export { useInvoices } from './useInvoices';
export type { UseInvoicesOptions } from './useInvoices';
export { useInvoice } from './useInvoice';
export { useInvoicesByOrderId } from './useInvoicesByOrderId';
