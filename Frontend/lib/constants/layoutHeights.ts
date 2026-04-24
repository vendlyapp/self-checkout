/**
 * Alturas y posiciones fijas del layout admin (móvil).
 * Una sola fuente de verdad para que HeaderNav, Filter_Busqueda y OrderFilters
 * mantengan la misma posición al cambiar de página.
 */

/** Altura del ResponsiveHeader (debe coincidir con ResponsiveHeader) */
export const RESPONSIVE_HEADER_HEIGHT_PX = 80;

/** Donde empieza el HeaderNav (justo debajo del ResponsiveHeader) */
export const TOP_HEADER_NAV_PX = RESPONSIVE_HEADER_HEIGHT_PX;

/** Altura aproximada de la barra HeaderNav (padding + contenido) — pegado a la barra de filtros, sin hueco (charge, products_list, orders) */
export const HEADER_NAV_BAR_HEIGHT_PX = 60;

/** Offset para Bestseller: contenido un poco más arriba y sticky estable (evita jank en scroll) */
export const BESTSELLER_TOP_OFFSET_PX = 32;

/** Donde empieza la primera barra de filtros (búsqueda) debajo del HeaderNav */
export const TOP_FILTER_SEARCH_BAR_PX = TOP_HEADER_NAV_PX + HEADER_NAV_BAR_HEIGHT_PX;

/** Altura aproximada de la barra de búsqueda/filtro */
export const FILTER_SEARCH_BAR_HEIGHT_PX = 78;

/** Donde empieza la segunda fila (FilterSlider / chips de status) */
export const TOP_FILTER_SLIDER_BAR_PX = TOP_FILTER_SEARCH_BAR_PX + FILTER_SEARCH_BAR_HEIGHT_PX;

/** Altura aproximada de la barra FilterSlider / chips */
export const FILTER_SLIDER_BAR_HEIGHT_PX = 60;

/** Padding-top del main cuando solo hay HeaderNav (add_product, view, invoice, order, store/sales) */
export const MAIN_PT_HEADER_NAV_ONLY_PX = TOP_HEADER_NAV_PX + HEADER_NAV_BAR_HEIGHT_PX;

/** Padding-top del main en secciones /store (discounts, settings, notifications, etc.) — menor que MAIN_PT_HEADER_NAV_ONLY_PX */
export const MAIN_PT_STORE_SECTION_PX = 80;

/** Espacio entre la segunda barra de filtros y el inicio del contenido — menor = lista más arriba */
export const MAIN_GAP_BELOW_FILTER_BARS_PX = -100;

/** Padding-top del main cuando hay HeaderNav + Filter_Busqueda (products_list) o OrderFilters (orders) */
export const MAIN_PT_WITH_FILTER_BARS_PX = TOP_FILTER_SLIDER_BAR_PX + MAIN_GAP_BELOW_FILTER_BARS_PX;

/**
 * OrderFilters (móvil): chips medianos en flex-wrap (≈min-h-40/44, bis 2 Zeilen).
 */
export const ORDER_FILTERS_STATUS_BLOCK_HEIGHT_PX = 10;

/** Espacio entre el borde inferior de OrderFilters y el contenido desplazable */
export const MAIN_GAP_BELOW_ORDER_FILTERS_PX = 5;

/** padding-top del main en /sales/orders (solo aplica en móvil vía .main-pt-mobile-only) */
export const MAIN_PT_ORDERS_LIST_MOBILE_PX =
  TOP_FILTER_SLIDER_BAR_PX +
  ORDER_FILTERS_STATUS_BLOCK_HEIGHT_PX +
  MAIN_GAP_BELOW_ORDER_FILTERS_PX;

/** Consistencia UI dashboard: padding horizontal y vertical del contenido en móvil (clases: p-4) */
export const DASHBOARD_MOBILE_CONTENT_PADDING = 16;

/** Altura estándar de inputs de búsqueda en móvil (px) — usada en HomeDashboard, StoreDashboard, Analytics, OrderFilters, Filter_Busqueda */
export const SEARCH_INPUT_MOBILE_HEIGHT_PX = 54;

/** Escala completa por viewport (tipografía, spacing, touch targets): ver @/lib/constants/dashboardDesignScale */
