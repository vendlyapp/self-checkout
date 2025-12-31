// components/navigation/FooterNav.tsx
"use client";

import { Home, Percent, ScanBarcode, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { clsx } from "clsx";
import { useState, useEffect, useCallback, useMemo } from "react";
import { lightFeedback } from "@/lib/utils/safeFeedback";
import UserCartSummary from "@/components/user/UserCartSummary";
import UserCartSummaryCart from "@/components/user/UserCartSummaryCart";
import { useCartStore } from "@/lib/stores/cartStore";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";

interface NavItemUser {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  isMain?: boolean;
}

const getNavItems = (baseRoute: string): NavItemUser[] => [
  {
    id: "home",
    icon: Home,
    label: "Home",
    href: baseRoute,
  },
  {
    id: "search",
    icon: Search,
    label: "Suche",
    href: `${baseRoute}/search`,
  },
  {
    id: "actions",
    icon: ScanBarcode,
    label: "",
    href: `${baseRoute}/scan`, // Va a scan de la tienda actual
    isMain: true,
  },
  {
    id: "promotion",
    icon: Percent,
    label: "Aktionen",
    href: `${baseRoute}/promotion`,
  },
  {
    id: "cart",
    icon: ShoppingCart,
    label: "Warenkorb",
    href: `${baseRoute}/cart`,
  },
];


export default function FooterNav() {
  const pathname = usePathname();
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);
  const [pressedItem, setPressedItem] = useState<string | null>(null);
  const { cartItems } = useCartStore();

  // Siempre usar /store/[slug] como base route
  // Si no hay slug, usar /user como fallback
  const isStoreRoute = pathname?.startsWith('/store/');
  const slug = params?.slug as string | undefined;
  const { store } = useScannedStoreStore();
  
  // Usar slug de params si está disponible, sino usar store.slug del store
  const currentSlug = slug || store?.slug;
  const baseRoute = currentSlug ? `/store/${currentSlug}` : '/user';
  
  const navItems = useMemo(() => getNavItems(baseRoute), [baseRoute]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-reactivar pulso después de 10 segundos
  useEffect(() => {
    if (!isPulsing) {
      const timer = setTimeout(() => setIsPulsing(true), 10000);
      return () => clearTimeout(timer);
    }
  }, [isPulsing]);

  // Memoizar función para verificar item activo
  const isItemActive = useCallback(
    (item: NavItemUser) => {
      if (item.href === baseRoute && pathname === baseRoute) return true;
      if (item.href !== baseRoute && pathname?.startsWith(item.href)) return true;
      return false;
    },
    [pathname, baseRoute]
  );

  // Manejar interacción con vibración háptica
  const handlePress = useCallback((itemId: string) => {
    setPressedItem(itemId);
    setIsPulsing(false);

    // Reset después de la animación
    setTimeout(() => setPressedItem(null), 150);
  }, []);

  // Manejar feedback en eventos válidos
  const handleValidInteraction = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Feedback seguro con haptic + visual
      lightFeedback(e.currentTarget);
    },
    []
  );

  // Memoizar items procesados
  const processedItems = useMemo(
    () =>
      navItems.map((item) => ({
        ...item,
        isActive: isItemActive(item),
        isPressed: pressedItem === item.id,
      })),
    [isItemActive, pressedItem, navItems]
  );

  // Contador de artículos en el carrito (suma de cantidades > 0)
  const cartItemCount = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems
      .filter((item) => item.quantity > 0)
      .reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // Verificar si hay items válidos en el carrito (cantidad > 0)
  const hasValidCartItems = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return false;
    return cartItems.some(item => item.quantity > 0);
  }, [cartItems]);

  // Determinar qué componente de carrito mostrar basado en la ruta
  const isCartRoute = pathname === "/user/cart" || pathname?.includes('/cart');
  const isPaymentRoute = pathname === "/user/payment" || pathname?.includes('/payment');

  // Ocultar FooterNav en la pantalla de carrito
  if (pathname === "/charge/cart") {
    return null;
  }

  // Prevenir problemas de hidratación
  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-white rounded-t-3xl">
      {/* Resumen de carrito arriba solo cuando estoy en /user/cart Y hay items en el carrito - fuera del nav para separación visual */}
      {isCartRoute && hasValidCartItems && (
        <div className="w-full max-w-[430px] mx-auto bg-white rounded-t-3xl pb-2">
          <UserCartSummaryCart variant="inline" />
        </div>
      )}

      {/* Footer Nav con borde y sombra para separación visual */}
      <div className="rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.12)] bg-white overflow-hidden">
        <nav className="bg-white rounded-t-3xl safe-area-bottom border-t border-[#E5E6F8]" style={{ borderTopWidth: '0.5px' }}>
          <div className="flex items-center justify-between w-full px-6 max-w-[430px] mx-auto pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2">
        {processedItems.map((item) => {
          const Icon = item.icon;

          if (item.isMain) {
            // Botón principal (SCANEAR) con animaciones de color
            return (
              <Link
                key={item.id}
                href={item.href}
                prefetch={true}
                className="relative inline-flex items-center justify-center w-16 h-16 transition-opacity active:opacity-70"
                onTouchStart={() => handlePress(item.id)}
                onMouseDown={(e) => {
                  handlePress(item.id);
                  handleValidInteraction(e);
                }}
                onClick={handleValidInteraction}
                aria-label="Scan"
              >
                {/* Animated Green Halo - Animaciones de color para el botón de scan */}
                <div
                  className={clsx(
                    "absolute inset-0 w-full h-full rounded-full animate-pulse",
                    pathname?.includes('/scan')
                      ? "bg-[#25D076]/30"
                      : "bg-[#766B6A]/30"
                  )}
                />

                <div
                  className={clsx(
                    "absolute inset-1 w-14 h-14 rounded-full animate-pulse",
                    pathname?.includes('/scan')
                      ? "bg-[#25D076]/20"
                      : "bg-[#766B6A]/20"
                  )}
                  style={{ animationDelay: "0.5s" }}
                />

                <div
                  className={clsx(
                    "absolute inset-2 w-12 h-12 rounded-full animate-pulse",
                    pathname?.includes('/scan')
                      ? "bg-[#25D076]/10"
                      : "bg-[#766B6A]/10"
                  )}
                  style={{ animationDelay: "1s" }}
                />

                {/* Circle with Lucide Icon */}
                <div
                  className={clsx(
                    "relative w-[49px] h-[49px] bg-[#766B6A] rounded-full flex items-center justify-center shadow-lg text-white",
                    item.isActive && "bg-white text-[#25D076]"
                  )}
                >
                  <Icon
                    className={clsx(
                      "w-[25px] h-[25px]",
                      item.isActive && "text-[#25D076]"
                    )}
                    strokeWidth={2.5}
                  />
                </div>
              </Link>
            );
          }

          // Items regulares
          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch={true}
              className={clsx(
                "nav-item transition-opacity active:opacity-70",
                item.isActive && "nav-item-active"
              )}
              onTouchStart={() => handlePress(item.id)}
              onMouseDown={(e) => {
                handlePress(item.id);
                handleValidInteraction(e);
              }}
              onClick={handleValidInteraction}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon
                  className={clsx(
                    "nav-icon",
                    item.isActive && "nav-icon-active"
                  )}
                  strokeWidth={item.isActive ? 2.2 : 1.8}
                />
                {item.id === "cart" && cartItemCount > 0 && (
                  <span
                    className={clsx(
                      "absolute -top-1.5 -right-2.5 min-w-5 h-5 px-1 rounded-full text-white text-[10px] leading-5 font-bold text-center",
                      item.isActive ? "bg-red-500" : "bg-red-500/70"
                    )}
                    aria-label={`Artículos en carrito: ${cartItemCount}`}
                    aria-live="polite"
                  >
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </div>
              <span
                className={clsx(
                  "nav-label",
                  item.isActive && "nav-label-active"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
        </div>

          {/* Resumen de carrito abajo solo cuando NO estoy en /user/cart Y NO estoy en /user/payment - con contenedor limitado */}
          {!isCartRoute && !isPaymentRoute && (
            <div className="w-full max-w-[430px] mx-auto flex flex-col gap-2 px-4 pb-[env(safe-area-inset-bottom)]">
              <UserCartSummary variant="inline" />
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
