// components/navigation/FooterNav.tsx
'use client';

import { Home, Package, Plus, ShoppingBag, Store } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { lightFeedback } from '@/lib/utils/safeFeedback';

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  isMain?: boolean;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    icon: Home,
    label: 'Home',
    href: '/dashboard',
  },
  {
    id: 'sales',
    icon: ShoppingBag,
    label: 'Verkauf',
    href: '/sales',
  },
  {
    id: 'add',
    icon: Plus,
    label: '',
    href: '/products_list/add_product',
    isMain: true,
  },
  {
    id: 'products',
    icon: Package,
    label: 'Produkte',
    href: '/products',
  },
  {
    id: 'store',
    icon: Store,
    label: 'Geschäft',
    href: '/store',
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
  const isItemActive = useCallback((item: NavItem) => {
    if (item.href === '/dashboard' && pathname === '/dashboard') return true;
    if (item.href !== '/dashboard' && pathname?.startsWith(item.href)) return true;
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

  return (
    <nav className="nav-container safe-area-bottom">
      <div className="flex items-center justify-around h-full px-4 max-w-[430px] mx-auto pb-[env(safe-area-inset-bottom)]">
        {processedItems.map((item) => {
          const Icon = item.icon;

          if (item.isMain) {
            // Botón principal (Plus) con estilo modificado
            return (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  "nav-main-button ripple",
                  "transform -translate-y-4", // Sobresale 24px más arriba
                  isPulsing && "nav-main-button-pulse",
                  item.isPressed && "scale-90"
                )}
                onTouchStart={() => handlePress(item.id)}
                onMouseDown={(e) => {
                  handlePress(item.id);
                  handleValidInteraction(e);
                }}
                onClick={handleValidInteraction}
                aria-label="Agregar nuevo producto"
              >
                <Icon
                  className={clsx(
                    "nav-main-icon",
                    item.isPressed && "scale-95"
                  )}
                  strokeWidth={2.5}
                />
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
    </nav>
  );
}
