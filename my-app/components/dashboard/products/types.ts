export interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  subtitle: string;
  trend?: 'up' | 'down' | 'neutral';
  trendData?: number[];
  badge?: string;
}

export interface ActionButtonProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export interface NavigationItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  badgeVariant?: 'success' | 'default';
  onClick?: () => void;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
  }>;
  label?: string;
}

export interface ProductData {
  total: number;
  trend: 'up' | 'down' | 'neutral';
  trendData: number[];
  newProducts: number;
}

export interface CategoryData {
  total: number;
  trend: 'up' | 'down' | 'neutral';
  trendData: number[];
  newCategories: number;
}

export interface ProductsAnalyticsData {
  products: ProductData;
  categories: CategoryData;
  lastUpdated?: string;
}

export interface UseProductsReturn {
  data: ProductsAnalyticsData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Action types for future backend integration
export type ProductAction = 
  | 'create_product'
  | 'view_products'
  | 'manage_categories'
  | 'view_analytics';

export interface ProductActionResult {
  success: boolean;
  message?: string;
  data?: unknown;
} 