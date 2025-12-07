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

// Order queries
export { useOrderStats } from './useOrderStats';
export { useRecentOrders } from './useRecentOrders';

// Store queries
export { useMyStore } from './useMyStore';
