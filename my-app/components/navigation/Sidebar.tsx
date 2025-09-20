'use client';

import { Home, Package, Plus, ShoppingBag, Store, Menu, X, User, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { lightFeedback } from '@/lib/utils/safeFeedback';
import Image from 'next/image';

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  isMain?: boolean;
}

const navItems: NavItem[] = [
  {
    id: "home",
    icon: Home,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    id: "sales",
    icon: ShoppingBag,
    label: "Verkauf",
    href: "/sales",
  },
  {
    id: "products",
    icon: Package,
    label: "Produkte",
    href: "/products",
  },
  {
    id: "store",
    icon: Store,
    label: "Geschäft",
    href: "/store",
  }
  ,
  {
    id: "add",
    icon: Plus,
    label: "Neues Produkt",
    href: "/products_list/add_product",
    isMain: true,
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ isCollapsed = false, onToggle, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [pressedItem, setPressedItem] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoizar función para verificar item activo
  const isItemActive = useCallback((item: NavItem) => {
    if (item.href === '/dashboard' && pathname === '/dashboard') return true;
    if (item.href !== '/dashboard' && pathname?.startsWith(item.href)) return true;
    return false;
  }, [pathname]);

  // Manejar interacción con vibración háptica
  const handlePress = useCallback((itemId: string) => {
    setPressedItem(itemId);
    setTimeout(() => setPressedItem(null), 150);
  }, []);

  // Manejar feedback en eventos válidos
  const handleValidInteraction = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
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

  // Prevenir problemas de hidratación
  if (!mounted) {
    return (
      <aside className={clsx(
        "bg-white border-r border-gray-200 transition-all duration-300",
        isMobile ? "fixed inset-y-0 left-0 z-50 w-64" : "relative",
        isCollapsed && !isMobile ? "w-16" : "w-64"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </nav>
        </div>
      </aside>
    );
  }

  return (
    <aside className={clsx(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
      isMobile ? "fixed inset-y-0 left-0 z-50 w-64" : "relative w-80"
    )}>
      {/* Header del Sidebar */}
      <div className="p-6 border-b h-[80px] border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Self-Checkout Logo"
            width={40}
            height={40}
            priority
          />
          <div>
            <span className="font-bold text-gray-900 text-lg">Self-Checkout</span>
            <p className="text-sm text-gray-500">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-6 space-y-3">
        {processedItems.map((item) => {
          const Icon = item.icon;

          if (item.isMain) {
            // Botón principal (Plus) con estilo especial
            return (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  "flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200",
                  "bg-brand-500 hover:bg-brand-600 text-white font-semibold",
                  "shadow-lg hover:shadow-xl transform hover:scale-105",
                  item.isPressed && "scale-95"
                )}
                onTouchStart={() => handlePress(item.id)}
                onMouseDown={(e) => {
                  handlePress(item.id);
                  handleValidInteraction(e);
                }}
                onClick={handleValidInteraction}
                aria-label={item.label}
              >
                <Icon className="w-6 h-6 flex-shrink-0" strokeWidth={2.5} />
                <span className="text-base font-semibold">{item.label}</span>
              </Link>
            );
          }

          // Items regulares
          return (
            <Link
              key={item.id}
              href={item.href}
              className={clsx(
                "flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200",
                "hover:bg-gray-100 hover:shadow-sm",
                item.isActive && "bg-brand-50 text-brand-700 border-2 border-brand-200 shadow-sm",
                item.isPressed && "scale-95"
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
                  "w-6 h-6 flex-shrink-0",
                  item.isActive ? "text-brand-600" : "text-gray-500"
                )}
                strokeWidth={item.isActive ? 2.2 : 1.8}
              />
              <span className={clsx(
                "text-base font-medium",
                item.isActive ? "text-brand-700" : "text-gray-700"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer del Sidebar */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">admin@selfcheckout.com</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Einstellungen</span>
          </Link>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-left">
            <LogOut className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Abmelden</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
