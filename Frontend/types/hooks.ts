/**
 * Centralized Hook Types
 * All hook return types and interfaces in one place
 */

// ===== UI HOOKS TYPES =====

/**
 * Responsive design hook return type
 */
export interface ResponsiveState {
  /** Indica si está en dispositivo móvil (< 768px) */
  isMobile: boolean;
  /** Indica si está en tablet (768px - 1023px) */
  isTablet: boolean;
  /** Indica si está en desktop (>= 1024px) */
  isDesktop: boolean;
  /** Ancho actual de la pantalla en píxeles */
  screenWidth: number;
  /** Estado de colapso del sidebar */
  isCollapsed: boolean;
  /** Función para cambiar el estado de colapso */
  setIsCollapsed: (collapsed: boolean) => void;
}

/**
 * Scroll reset hook return type
 */
export interface ScrollResetReturn {
  /** Referencia al contenedor de scroll */
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  /** Función para resetear scroll manualmente */
  resetScroll: () => void;
}

// ===== BUSINESS HOOKS TYPES =====

/**
 * Promo logic hook return type
 */
export interface PromoLogicReturn {
  /** Estado de promoción aplicada */
  promoApplied: boolean;
  /** Cantidad de descuento aplicado */
  discountAmount: number;
  /** Mensaje de error de promoción */
  promoError: string;
  /** Código promocional local (input) */
  localPromoCode: string;
  /** Función para actualizar código promocional local */
  setLocalPromoCode: (code: string) => void;
  /** Función para aplicar código promocional */
  handleApplyPromo: () => void;
  /** Función para remover código promocional */
  handleRemovePromo: () => void;
}

/**
 * Promo code hook return type
 */
export interface PromoCodeReturn {
  /** Código promocional actual */
  promoCode: string;
  /** Función para actualizar código promocional */
  setPromoCode: (code: string) => void;
  /** Estado de promoción aplicada */
  promoApplied: boolean;
  /** Cantidad de descuento aplicado */
  discountAmount: number;
  /** Mensaje de error de promoción */
  promoError: string;
  /** Función para actualizar mensaje de error */
  setPromoError: (error: string) => void;
  /** Subtotal del carrito */
  subtotal: number;
  /** Total con descuento aplicado */
  total: number;
  /** Función para aplicar código promocional */
  handleApplyPromo: () => void;
  /** Función para remover código promocional */
  handleRemovePromo: () => void;
}

// ===== DATA HOOKS TYPES =====

/**
 * Dashboard data interface
 */
export interface DashboardData {
  /** Monto actual de ventas */
  currentAmount: number;
  /** Meta de ventas del día */
  goalAmount: number;
  /** Porcentaje de progreso hacia la meta */
  percentage: number;
  /** Items de acceso rápido */
  quickAccessItems: QuickAccessItem[];
  /** Ventas recientes */
  recentSales: Sale[];
}

/**
 * Dashboard hook return type
 */
export interface UseDashboardReturn {
  /** Datos del dashboard */
  data: DashboardData | null;
  /** Estado de carga */
  loading: boolean;
  /** Mensaje de error */
  error: string | null;
  /** Estado de la tienda (abierta/cerrada) */
  isStoreOpen: boolean;
  /** Query de búsqueda actual */
  searchQuery: string;
  /** Estado de búsqueda en progreso */
  isSearching: boolean;
  /** Resultados de búsqueda */
  searchResults: SearchResult[];
  /** Índice del slide actual */
  currentSlideIndex: number;
  /** Función para cambiar estado de la tienda */
  setIsStoreOpen: (open: boolean) => void;
  /** Función para actualizar query de búsqueda */
  setSearchQuery: (query: string) => void;
  /** Función para cambiar índice del slide */
  setCurrentSlideIndex: (index: number) => void;
  /** Función para ejecutar búsqueda */
  handleSearch: (query: string) => Promise<void>;
  /** Función para alternar estado de la tienda */
  handleToggleStore: () => void;
  /** Función para refrescar datos */
  refreshData: () => Promise<void>;
}

/**
 * Analytics hook return type
 */
export interface UseAnalyticsReturn {
  /** Datos de analytics */
  data: AnalyticsData | null;
  /** Estado de carga */
  loading: boolean;
  /** Mensaje de error */
  error: string | null;
  /** Período de ventas seleccionado */
  salesPeriod: TimePeriod;
  /** Período de pagos seleccionado */
  paymentPeriod: TimePeriod;
  /** Período del carrito seleccionado */
  cartPeriod: TimePeriod;
  /** Función para cambiar período de ventas */
  setSalesPeriod: (period: TimePeriod) => void;
  /** Función para cambiar período de pagos */
  setPaymentPeriod: (period: TimePeriod) => void;
  /** Función para cambiar período del carrito */
  setCartPeriod: (period: TimePeriod) => void;
  /** Función para refrescar datos */
  refreshData: () => Promise<void>;
  /** Total de ventas calculado */
  totalSales: number;
  /** Crecimiento de ventas calculado */
  salesGrowth: number;
}

/**
 * Quick access hook return type
 */
export interface QuickAccessReturn {
  /** Función para ver ventas */
  handleViewSales: () => void;
  /** Función para cancelar venta */
  handleCancelSale: () => void;
  /** Función para ver recibos */
  handleViewReceipts: () => void;
  /** Función para ir al carrito */
  handleGoToCart: () => void;
}

/**
 * Products analytics data interface
 */
export interface ProductsAnalyticsData {
  products: ProductData;
  categories: CategoryData;
  lastUpdated?: string;
}

/**
 * Products hook return type
 */
export interface UseProductsReturn {
  /** Datos de productos y analytics */
  data: ProductsAnalyticsData;
  /** Estado de carga */
  loading: boolean;
  /** Mensaje de error */
  error: string | null;
  /** Función para refrescar datos */
  refresh: () => Promise<void>;
}

/**
 * Product actions hook return type
 */
export interface ProductActionsReturn {
  /** Estado de carga de acciones */
  loading: boolean;
  /** Función para crear nuevo producto */
  handleNewProduct: () => Promise<void>;
  /** Función para ver lista de productos */
  handleProductList: () => Promise<void>;
  /** Función para gestionar categorías */
  handleCategories: () => Promise<void>;
}

// ===== SHARED TYPES =====

/**
 * Quick access item interface
 */
export interface QuickAccessItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  iconColor: string;
  action: () => void;
}

/**
 * Sale interface
 */
export interface Sale {
  id: string;
  name: string;
  receipt: string;
  time: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'cancelled';
}

/**
 * Search result interface
 */
export interface SearchResult {
  id: number;
  name: string;
  type: string;
}

/**
 * Analytics data interface
 */
export interface AnalyticsData {
  shopActivity: ShopActivity;
  salesData: SalesData[];
  paymentMethods: PaymentMethod[];
  cartData: CartData;
  quickAccess: Omit<QuickAccessItem, 'icon' | 'action'>[];
}

/**
 * Time period type
 */
export type TimePeriod = 'heute' | 'woche' | 'monat' | 'jahr';

/**
 * Sales data interface
 */
export interface SalesData {
  day: string;
  currentWeek: number;
  lastWeek: number;
  date: string;
}

/**
 * Payment method interface
 */
export interface PaymentMethod {
  type: string;
  percentage: number;
  total: number;
  color: string;
  transactions: number;
}

/**
 * Cart data interface
 */
export interface CartData {
  averageValue: number;
  percentageChange: number;
  trend: 'up' | 'down';
  comparisonPeriod: string;
  maxValue: number;
  minValue: number;
}

/**
 * Shop activity interface
 */
export interface ShopActivity {
  activeCustomers: Customer[];
  totalActive: number;
  totalInactive: number;
  openCartsValue: number;
  progressPercentage: number;
}

/**
 * Customer interface
 */
export interface Customer {
  id: string;
  avatar: string;
  name: string;
  status: 'active' | 'inactive';
}

/**
 * Product data interface
 */
export interface ProductData {
  total: number;
  trend: 'up' | 'down' | 'neutral';
  trendData: number[];
  newProducts: number;
}

/**
 * Category data interface
 */
export interface CategoryData {
  total: number;
  trend: 'up' | 'down' | 'neutral';
  trendData: number[];
  newCategories: number;
}
