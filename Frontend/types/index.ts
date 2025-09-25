/**
 * Centralized Types Library
 * All application types in one place
 */

// Hook types
export * from './hooks';

// Product types (from existing mockProducts)
export type { Product, ProductCategory } from '@/components/dashboard/products_list/data/mockProducts';

// Dashboard component types
export type {
  StatCardProps,
  ActionButtonProps,
  NavigationItemProps,
  ChartTooltipProps,
  ProductAction,
  ProductActionResult
} from '@/components/dashboard/products/types';
