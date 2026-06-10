'use client';

import { Home, Package, Plus, ShoppingBag, Store } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useResponsive } from '@/hooks';

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

export default function ResponsiveFooterNav() {
  const pathname = usePathname();
  const { isMobile } = useResponsive();

  if (pathname === '/charge/cart' || !isMobile) return null;

  const isItemActive = (item: NavItem) => {
    if (item.href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(item.href) ?? false;
  };

  return (
    <nav className="nav-container">
      <div className="flex items-center justify-around min-h-[64px] px-4 max-w-[430px] mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);

          if (item.isMain) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className="nav-main-button transform -translate-y-4"
                aria-label="Neues Produkt hinzufügen"
              >
                <Icon className="nav-main-icon" strokeWidth={2.5} />
              </Link>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={clsx("nav-item", active && "nav-item-active")}
              aria-label={item.label}
            >
              <Icon
                className={clsx("nav-icon", active && "nav-icon-active")}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span className={clsx("nav-label", active && "nav-label-active")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
