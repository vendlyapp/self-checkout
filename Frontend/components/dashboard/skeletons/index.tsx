// ===== SKELETON LOADERS - ORGANIZED BY SECTIONS =====

// Common skeleton base
export { SkeletonBase } from './common/SkeletonBase';

// Home section skeletons
export {
  GreetingSkeletonLoader,
  MainActionCardsSkeletonLoader,
  SearchSkeletonLoader,
  TodayStatsSkeletonLoader,
  DailyGoalSkeletonLoader,
  QuickAccessSkeletonLoader,
  HomeDashboardSkeletonLoader,
  DashboardErrorState
} from './home';

// Sale section skeletons  
export {
  RecentSalesSkeletonLoader,
  SaleCardSkeletonLoader,
  SalesSectionSkeletonLoader
} from './sale';

// Analytics section skeletons
export {
  SearchSkeletonLoader as AnalyticsSearchSkeletonLoader,
  AnalyticsHeaderSkeletonLoader,
  ActiveCustomersSkeletonLoader,
  SalesChartSkeletonLoader,
  QuickAccessGridSkeletonLoader,
  PaymentMethodsSkeletonLoader,
  CartGaugeSkeletonLoader,
  AnalyticsDashboardSkeletonLoader
} from './analytics';

// Products section skeletons
export {
  ProductsHeaderSkeletonLoader,
  StatCardSkeletonLoader,
  StatsGridSkeletonLoader,
  ActionButtonSkeletonLoader,
  NavigationItemSkeletonLoader,
  NavigationListSkeletonLoader,
  ProductsDashboardSkeletonLoader,
  ProductsErrorState
} from './products';

// Legacy exports for backward compatibility
export { HomeDashboardSkeletonLoader as DashboardSkeletonLoader } from './home'; 