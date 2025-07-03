// ===== DASHBOARD COMPONENTS INDEX =====

// ===== DASHBOARD COMPONENTS - ORGANIZED BY SECTIONS =====

// Home section components
export * from './home';

// Main Dashboard Component (primary export)
export { HomeDashboard } from './home';

// Sale section components  
export * from './sale';

// Analytics section (already organized) - specific exports to avoid conflicts
export { 
  default as AnalyticsDashboard,
  AnalyticsDashboard as NewAnalyticsDashboard,
  ActiveCustomers,
  SalesChart,
  QuickAccessGrid,
  PaymentMethods,
  CartGauge,
  useAnalytics,
  useQuickAccess
} from './analytics';

// Dashboard hooks
export { useDashboard } from './hooks/useDashboard';

// Skeleton loaders (organized by sections)
export * from './skeletons';

// Legacy component (deprecated) - uses new analytics dashboard
export { default as TIenda } from './sale/SalesMain';

// Analytics types (avoiding conflicts)
export type {
  AnalyticsData,
  TimePeriod,
  SalesData,
  PaymentMethod,
  CartData,
  ShopActivity,
  Customer,
  QuickAccessItem as AnalyticsQuickAccessItem
} from './analytics';

// Dashboard types
export * from './types'; 