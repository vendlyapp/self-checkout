export interface Customer {
  id: string;
  avatar: string;
  name: string;
  status: 'active' | 'inactive';
}

export interface PaymentMethod {
  type: string;
  percentage: number;
  total: number;
  color: string;
  transactions: number;
}

export interface SalesData {
  day: string;
  currentWeek: number;
  lastWeek: number;
  date: string;
}

export interface CartData {
  averageValue: number;
  percentageChange: number;
  trend: 'up' | 'down';
  comparisonPeriod: string;
  maxValue: number;
  minValue: number;
}

export interface ShopActivity {
  activeCustomers: Customer[];
  totalActive: number;
  totalInactive: number;
  openCartsValue: number;
  progressPercentage: number;
}

export interface QuickAccessItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  iconColor: string;
  action: () => void;
}

export interface AnalyticsData {
  shopActivity: ShopActivity;
  salesData: SalesData[];
  paymentMethods: PaymentMethod[];
  cartData: CartData;
  quickAccess: Omit<QuickAccessItem, 'icon' | 'action'>[];
}

export type TimePeriod = 'heute' | 'woche' | 'monat' | 'jahr';

export interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
} 