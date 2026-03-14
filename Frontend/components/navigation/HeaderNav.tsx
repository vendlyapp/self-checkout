import { ArrowLeftIcon, Plus, X, Zap, Receipt, LucideIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useCartStore } from "@/lib/stores/cartStore";
import {
  getPromotionalProducts,
  Product,
} from "../dashboard/products_list/data/mockProducts";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { TOP_HEADER_NAV_PX } from "@/lib/constants/layoutHeights";

export type HeaderNavPadding = "default" | "comfortable" | "compact";

interface HeaderNavProps {
  title?: string;
  showAddButton?: boolean;
  closeDestination?: string;
  isFixed?: boolean;
  promotionCount?: number;
  variant?: "default" | "subtle";
  rightAction?: {
    icon: LucideIcon;
    onClick: () => void;
    label: string;
  };
  /** Contenido custom a la derecha (ej. botones Bearbeiten/Speichern en Einstellungen) */
  rightContent?: React.ReactNode;
  /** Padding estándar: default (px-4 py-3), comfortable (px-5 py-4), compact (px-3 py-2) */
  padding?: HeaderNavPadding;

  /** Clase adicional en el contenedor raíz (útil cuando el padre controla fixed/sticky) */
  className?: string;
  /** Clase adicional en el contenedor del contenido centrado */
  contentClassName?: string;
  /** Deshabilita el safe-area-top interno — usar cuando el padre ya gestiona el offset de safe area */
  noSafeArea?: boolean;
}

// Padding horizontal + bottom — el top-padding se maneja separado para evitar conflicto con safeTop
const PADDING_BASE: Record<HeaderNavPadding, string> = {
  default: "px-4 pb-3",
  comfortable: "px-5 pb-4",
  compact: "px-3 pb-2",
};

// Top padding simétrico — solo cuando noSafeArea=true (el padre ya controla safe area)
const PADDING_TOP: Record<HeaderNavPadding, string> = {
  default: "pt-3",
  comfortable: "pt-4",
  compact: "pt-2",
};

export default function HeaderNav({
  title = "Warenkorb",
  showAddButton = false,
  closeDestination = "/dashboard",
  isFixed = false,
  promotionCount,
  variant = "default",
  rightAction,
  rightContent,
  padding = "default",
  className,
  contentClassName,
  noSafeArea = false,
}: HeaderNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { cartItems, clearCart } = useCartStore();
  const isCartPage = pathname === "/charge/cart" || pathname?.includes("/cart");
  const isPromotionPage = pathname?.includes("/promotion");
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    if (promotionCount === undefined) {
      const promotionalProducts = getPromotionalProducts();
      setProducts(promotionalProducts);
    }
  }, [promotionCount]);
  const hasItems = cartItems.length > 0;
  const displayCount = promotionCount !== undefined ? promotionCount : products.length;
  const isSubtle = variant === "subtle";

  // Top padding: si noSafeArea, usa pt simétrico; si no, incluye safe-area-inset-top
  const topPadding = noSafeArea
    ? PADDING_TOP[padding]
    : isSubtle
    ? "pt-[calc(0.5rem+env(safe-area-inset-top))]"
    : "pt-[calc(0.75rem+env(safe-area-inset-top))]";

  return (
    <div
      className={clsx(
        "flex items-center justify-center w-full min-h-[52px]",
        isFixed && "fixed left-0 right-0 z-40",
        !isSubtle && "bg-white",
        topPadding,
        PADDING_BASE[padding],
        className
      )}
      style={isFixed ? { top: `${TOP_HEADER_NAV_PX}px` } : undefined}
    >
      <div
        className={clsx(
          "flex items-center justify-between w-full min-w-0 max-w-[430px] gap-3 touch-target",
          contentClassName
        )}
      >
        <button
          className={`flex items-center gap-2 cursor-pointer ${isSubtle ? 'hover:bg-white/50 active:bg-white/70 rounded-full p-2 -ml-2 transition-ios' : ''}`}
          onClick={() => router.back()}
          aria-label="Zurück"
          tabIndex={0}
        >
          <ArrowLeftIcon className={`${isSubtle ? 'w-5 h-5' : 'w-5 h-5'} ${isSubtle ? 'text-gray-800' : ''}`} />
          {!isSubtle && <span className="text-[16px] font-semibold">{title}</span>}
        </button>
        <div className="flex items-center gap-2 flex-shrink-0">
          {rightContent != null && rightContent}
          {isCartPage && hasItems && rightContent == null && (
            <button
              type="button"
              className="cursor-pointer text-red-600 font-semibold text-sm px-3 py-2 min-h-[44px] rounded-lg hover:bg-red-50 transition-colors"
              onClick={clearCart}
              aria-label="Leeren"
              tabIndex={0}
            >
              Leeren
            </button>
          )}
          {rightContent == null && isPromotionPage && (
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-black" />
              <span className="text-sm font-semibold">
                {displayCount}
              </span>
              <button
                type="button"
                className="cursor-pointer text-black text-sm px-3 py-2 min-h-[44px] rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => {
                  // Redirigir a promotion de la tienda actual si estamos en una ruta de tienda
                  if (pathname?.includes('/store/')) {
                    const slug = pathname.split('/store/')[1]?.split('/')[0]
                    if (slug) {
                      router.push(`/store/${slug}/promotion`)
                    }
                  }
                }}
                aria-label="Aktionen"
                tabIndex={0}
              >
                Aktionen
              </button>
            </div>
          )}
          {rightContent == null && rightAction && (
            <button
              type="button"
              className="cursor-pointer flex items-center justify-center w-10 h-10 min-w-10 min-h-10 rounded-full hover:bg-gray-100 transition-colors"
              onClick={rightAction.onClick}
              aria-label={rightAction.label}
              tabIndex={0}
            >
              <rightAction.icon className="w-5 h-5 text-[#25D076]" />
            </button>
          )}
          {rightContent == null && !isCartPage && !showAddButton && !isPromotionPage && !isSubtle && !rightAction && (
            <button
              type="button"
              className="cursor-pointer flex items-center justify-center w-10 h-10 min-w-10 min-h-10 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => router.push(closeDestination)}
              aria-label="Schliessen"
              tabIndex={0}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
          {rightContent == null && showAddButton && (
            <button
              className="flex items-center gap-2 cursor-pointer bg-brand-600 rounded-full p-2"
              onClick={() => router.push("/products_list/add_product")}
              aria-label="Hinzufügen"
              tabIndex={0}
            >
              <Plus className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
