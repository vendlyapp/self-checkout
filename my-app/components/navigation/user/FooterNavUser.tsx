// components/navigation/FooterNav.tsx
'use client';

import { Home, Percent, ScanBarcode, Search, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { lightFeedback } from '@/lib/utils/safeFeedback';
import UserCartSummary from '@/components/user/UserCartSummary';
import UserCartSummaryCart from '@/components/user/UserCartSummaryCart';


interface NavItemUser {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  isMain?: boolean;
}

const navItems: NavItemUser[] = [
  {
    id: 'home',
    icon: Home,
    label: 'Home',
    href: '/user',
  },
  {
    id: 'search',
    icon: Search,
    label: 'Suche',
    href: '/user/search',
  },
  {
    id: 'actions',
    icon: ScanBarcode ,
    label: '',
    href: '/user/scan',
    isMain: true,
  },
  {
    id: 'percent',
    icon: Percent,
    label: 'Aktionen',
    href: '/actions',
  },
  {
    id: 'cart',
    icon: ShoppingCart,
    label: 'Warenkorb',
    href: '/user/cart',
  },
];

// Skeleton loader component
const SkeletonLoader = () => (
  <nav className="nav-container">
    <div className="flex items-center justify-around h-full px-4 max-w-[430px] mx-auto">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  </nav>
);

export default function FooterNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);
  const [pressedItem, setPressedItem] = useState<string | null>(null);

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
  const isItemActive = useCallback((item: NavItemUser) => {
    if (item.href === '/user' && pathname === '/user') return true;
    if (item.href !== '/user' && pathname?.startsWith(item.href)) return true;
    return false;
  }, [pathname]);

  // Manejar interacción con vibración háptica
  const handlePress = useCallback((itemId: string) => {
    setPressedItem(itemId);
    setIsPulsing(false);

    // Reset después de la animación
    setTimeout(() => setPressedItem(null), 150);
  }, []);

  // Manejar feedback en eventos válidos
  const handleValidInteraction = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Feedback seguro con haptic + visual
    lightFeedback(e.currentTarget);
  }, []);

  // Memoizar items procesados
  const processedItems = useMemo(() => 
    navItems.map(item => ({
      ...item,
      isActive: isItemActive(item),
      isPressed: pressedItem === item.id
    })),
    [isItemActive, pressedItem]
  );

  // Ocultar FooterNav en la pantalla de carrito
  if (pathname === '/charge/cart') {
    return null;
  }

  // Prevenir problemas de hidratación
  if (!mounted) {
    return <SkeletonLoader />;
  }

  // Determinar qué componente de carrito mostrar basado en la ruta
  const isCartRoute = pathname === '/user/cart';

  return (
    <nav className="nav-container-user ">
      {/* Resumen de carrito arriba solo cuando estoy en /user/cart */}
      {isCartRoute && (
        
          <UserCartSummaryCart variant="inline" />
        
      )}
      
      <div className="flex items-center justify-between w-full px-6 max-w-[430px] mx-auto pb-4 pt-2 border-t-2 border-gray-200  bg-white rounded-t-xl ">
        {processedItems.map((item) => {
          const Icon = item.icon;

          if (item.isMain) {
            // Botón principal (SCANEAR) con estilo modificado
            return (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  "relative inline-flex items-center justify-center w-16 h-16 transition-all duration-300 hover:scale-110 active:scale-95",
                  item.isPressed && "scale-90"
                )}
                onTouchStart={() => handlePress(item.id)}
                onMouseDown={(e) => {
                  handlePress(item.id);
                  handleValidInteraction(e);
                }}
                onClick={handleValidInteraction}
                aria-label="Scan"
              >
                {/* Animated Green Halo */}
                <div className="absolute inset-0 w-full h-full rounded-full bg-[#25D076]/30 animate-pulse" />
                <div className="absolute inset-1 w-14 h-14 rounded-full bg-[#25D076]/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <div className="absolute inset-2 w-12 h-12 rounded-full bg-[#25D076]/10 animate-pulse" style={{ animationDelay: '1s' }} />
                
                {/* White Circle with Lucide Icon */}
                <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Icon 
                    className={clsx(
                      "text-[#25D076]",
                      item.isPressed && "scale-95",
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
              className={clsx(
                "nav-item",
                item.isActive && "nav-item-active",
                item.isPressed && "scale-95 opacity-70"
              )}
              onTouchStart={() => handlePress(item.id)}
              onMouseDown={(e) => {
                handlePress(item.id);
                handleValidInteraction(e);
              }}
              onClick={handleValidInteraction}
              aria-label={item.label}
            >
              <Icon 
                className={clsx(
                  "nav-icon",
                  item.isActive && "nav-icon-active",
                  item.isPressed && "scale-90"
                )}
                strokeWidth={item.isActive ? 2.2 : 1.8}
              />
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
      
      {/* Resumen de carrito abajo solo cuando NO estoy en /user/cart */}
      {!isCartRoute && (
        <div className="w-full flex flex-col gap-2 px-4 py-2 ">
          <UserCartSummary variant="inline" />
        </div>
      )}
    </nav>
  );
}