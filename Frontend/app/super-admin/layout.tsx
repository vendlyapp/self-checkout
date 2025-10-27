'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  TrendingUp, 
  LogOut,
  Menu,
  X,
  ShoppingCart,
  Settings
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);

  useEffect(() => {
    // Verificar que el usuario tenga rol SUPER_ADMIN
    const role = localStorage.getItem('userRole');
    if (role !== 'SUPER_ADMIN') {
      // Redirigir a login si no es super admin
      router.push('/login');
    }
    setIsLoadingQuestion(false);
  }, [router]);

  const handleLogout = async () => {
    try {
      const { supabase } = await import('@/lib/supabase/client');
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  const navItems = [
    { href: '/super-admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/super-admin/stores', icon: Store, label: 'Tiendas' },
    { href: '/super-admin/users', icon: Users, label: 'Usuarios' },
    { href: '/super-admin/products', icon: ShoppingCart, label: 'Productos' },
    { href: '/super-admin/analytics', icon: TrendingUp, label: 'Analytics' },
  ];

  const isActive = (href: string) => pathname === href;

  // Mostrar loading mientras verifica
  if (isLoadingQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col bg-white border-r border-gray-200">
        <div className="flex flex-col flex-grow pt-8 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-8 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Super Admin</h1>
                <p className="text-xs text-gray-500">Vendly Platform</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors
                    ${isActive(item.href)
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed w-full bg-white border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <Settings className="w-7 h-7 text-purple-600" />
            <h1 className="text-lg font-bold text-gray-900">Super Admin</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-40 pt-16">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-base font-medium rounded-xl
                    ${isActive(item.href)
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700'
                    }
                  `}
                >
                  <Icon className="w-6 h-6 mr-3" />
                  {item.label}
                </a>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 mt-4 text-base font-medium text-red-600 rounded-xl"
            >
              <LogOut className="w-6 h-6 mr-3" />
              Cerrar Sesión
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="lg:pt-0 pt-16">
          {children}
        </div>
      </main>
    </div>
  );
}

