// ===== DASHBOARD TYPES =====

export type SaleStatus = 'pending' | 'completed' | 'cancelled';

export interface Sale {
  id: string;
  name: string;
  receipt: string;
  time: string;
  amount: number;
  paymentMethod: string;
  status: SaleStatus;
}

export interface QuickAccessItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

export interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  isPrimary?: boolean;
  onClick?: () => void;
}

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  amount: string;
  count: string;
  trend: string;
  isDark?: boolean;
  showCurrency?: boolean;
  showCount?: boolean;
}

export interface SaleCardProps {
  sale: Sale;
}

export interface GreetingSectionProps {
  isStoreOpen: boolean;
  onToggleStore: () => void;
}

export interface DailyGoalCardProps {
  currentAmount: number;
  goalAmount: number;
  percentage: number;
}

export interface QuickAccessSliderProps {
  items: QuickAccessItem[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
}

export interface SliderIndicatorsProps {
  maxSlides: number;
  currentSlide: number;
  onSlideChange: (index: number) => void;
}

export interface RecentSalesSectionProps {
  sales: Sale[];
}

export interface SearchResult {
  id: number;
  name: string;
  type: string;
}

export interface SearchResultsSectionProps {
  isSearching: boolean;
  results: SearchResult[];
} 