/**
 * Escala de diseño del dashboard (app/(dashboard)).
 * Una sola fuente de verdad para mantener consistencia UI/UX en móvil, tablet y desktop.
 *
 * Breakpoints (alineados con useResponsive y Tailwind):
 * - Mobile:  < 768px   (default, sin prefijo)
 * - Tablet:  768px+    (md:)
 * - Desktop: 1024px+   (lg:)
 * - Wide:    1280px+   (xl:)
 */

/** Breakpoints en px (para cálculos o media queries) */
export const BREAKPOINT_MD_PX = 768;
export const BREAKPOINT_LG_PX = 1024;
export const BREAKPOINT_XL_PX = 1280;

/** Padding del contenido principal por viewport (clases Tailwind) */
export const CONTENT_PADDING_MOBILE = "p-4";
export const CONTENT_PADDING_TABLET = "md:px-6 md:pt-10 md:pb-6";
export const CONTENT_PADDING_DESKTOP = "lg:p-6 xl:p-8";
/** Contenedor móvil: espacio entre secciones */
export const CONTENT_SPACE_Y_MOBILE = "space-y-6";
export const CONTENT_SPACE_Y_TABLET = "md:space-y-8";
export const CONTENT_SPACE_Y_DESKTOP = "lg:space-y-10 xl:space-y-12";

/** Tipografía: títulos de página */
export const PAGE_TITLE_MOBILE = "text-xl";
export const PAGE_TITLE_TABLET = "md:text-xl lg:text-2xl";
export const PAGE_TITLE_DESKTOP = "xl:text-3xl";
/** Subtítulo / descripción de página */
export const PAGE_SUBTITLE_MOBILE = "text-sm";
export const PAGE_SUBTITLE_DESKTOP = "lg:text-base";
/** Título de sección (Dienste, Systemeinstellungen, etc.) */
export const SECTION_TITLE_MOBILE = "text-base";
export const SECTION_TITLE_DESKTOP = "lg:text-lg";
/** Card title (Mein Geschäft, etc.) */
export const CARD_TITLE_MOBILE = "text-lg";
export const CARD_TITLE_DESKTOP = "lg:text-lg";
/** Body / labels */
export const BODY_MOBILE = "text-sm";
export const BODY_SMALL_MOBILE = "text-xs";

/** Altura mínima de inputs de búsqueda en móvil (px) — touch target y consistencia */
export const SEARCH_INPUT_HEIGHT_MOBILE_PX = 54;
/** Clase equivalente para SearchInput en móvil */
export const SEARCH_INPUT_HEIGHT_MOBILE_CLASS = "h-[54px] min-h-[54px]";

/** Área táctil mínima recomendada (px) para botones/links en móvil */
export const TOUCH_TARGET_MIN_PX = 44;

/** Ancho máximo del contenido en desktop (evitar líneas demasiado largas) */
export const CONTENT_MAX_WIDTH = "max-w-[1600px]";
export const CONTENT_MAX_WIDTH_FORM = "max-w-4xl";
