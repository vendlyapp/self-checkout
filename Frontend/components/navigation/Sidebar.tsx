'use client';

import { Home, Package, Plus, ShoppingBag, Store, User, Settings, LogOut, CreditCard, ShoppingCart, Zap, QrCode } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { lightFeedback } from '@/lib/utils/safeFeedback';
import Image from 'next/image';
import CartSummary from '@/components/cart/CartSummary';
import { useCartStore } from '@/lib/stores/cartStore';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';

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
  },
  {
    id: "add",
    icon: Plus,
    label: "Neues Produkt",
    href: "/products_list/add_product",
    isMain: true,
  },
];

// Flujo de Charge (Verkauf starten)
const chargeFlowItems: NavItem[] = [
  {
    id: "charge-start",
    icon: Zap,
    label: "Verkauf starten",
    href: "/charge",
  },
  {
    id: "charge-cart",
    icon: ShoppingCart,
    label: "Warenkorb",
    href: "/charge/cart",
  },
  {
    id: "charge-payment",
    icon: CreditCard,
    label: "Bezahlung",
    href: "/charge/payment",
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ isCollapsed = false, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [pressedItem, setPressedItem] = useState<string | null>(null);
  const { cartItems, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();
  const isEmpty = cartItems.length === 0;


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

      {/* Cart Summary - Solo en desktop/tablet y en la ruta /charge */}
      {pathname === '/charge' && (
        <div className="px-6 py-4 border-b border-gray-200">
          <CartSummary isMobile={false} />
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-1 p-6 space-y-3">
        {/* Navegación principal */}
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

        {/* Separador */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Flujo de Charge */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Verkauf Flow
          </h3>
          {chargeFlowItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item);
            const isPressed = pressedItem === item.id;
            const isWarenkorb = item.id === "charge-cart";

            return (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 relative",
                  "hover:bg-gray-50 hover:shadow-sm",
                  isActive && "bg-brand-50 text-brand-700 border border-brand-200 shadow-sm",
                  isPressed && "scale-95"
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
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-brand-600" : "text-gray-500"
                  )}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span className={clsx(
                  "text-sm font-medium flex-1",
                  isActive ? "text-brand-700" : "text-gray-600"
                )}>
                  {item.label}
                </span>

                {/* Badge de cantidad para Warenkorb - Posicionado a la derecha */}
                {isWarenkorb && !isEmpty && totalItems > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {totalItems} {totalItems === 1 ? 'Artikel' : 'Artikel'}
                    </span>
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] shadow-sm">
                      {totalItems}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer del Sidebar */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.user_metadata?.name || 'Admin User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'admin@vendly.ch'}
            </p>
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
          <button
            onClick={async () => {
              try {
                await signOut();
                toast.success('Erfolgreich abgemeldet');
                router.push('/');
              } catch (error) {
                toast.error('Fehler beim Abmelden');
              }
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left group"
          >
            <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-600 transition-colors" />
            <span className="text-sm text-gray-700 group-hover:text-red-600 transition-colors">Abmelden</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
