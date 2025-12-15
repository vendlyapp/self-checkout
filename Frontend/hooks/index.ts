/**
 * Centralized Hooks Library
 * Organized by category for better maintainability
 */

// UI Hooks - Responsive design, scroll management
export * from './ui';

// Business Logic Hooks - Promotions, cart logic
export * from './business';

// Data Hooks - Dashboard, analytics, products
// Export useProducts from data as useProductsData to avoid conflict
export { useProducts as useProductsData, useProductActions } from './data/useProducts';
export { useDashboard } from './data/useDashboard';
export { useAnalytics, useQuickAccess } from './data/useAnalytics';

// Query Hooks - React Query hooks with caching
export * from './queries';

// Mutation Hooks - React Query mutations for write operations
export * from './mutations';

// Core Hooks - Essential utilities
export * from './core';
