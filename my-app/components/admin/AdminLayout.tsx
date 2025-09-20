'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import Sidebar from '@/components/navigation/Sidebar';
import ResponsiveHeader from '@/components/navigation/ResponsiveHeader';
import ResponsiveFooterNav from '@/components/navigation/ResponsiveFooterNav';
import { useResponsive } from '@/lib/hooks/useResponsive';
import { useScrollReset } from '@/lib/hooks';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isMobile, isTablet, isDesktop, isCollapsed, setIsCollapsed } = useResponsive();
  const { scrollContainerRef } = useScrollReset();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Determinar si mostrar el sidebar
  const shouldShowSidebar = isDesktop || isTablet;

  // Manejar toggle del sidebar
  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    }
    // En desktop y tablet no hay toggle - la sidebar siempre está visible
  };

  // Cerrar sidebar en móvil al cambiar de ruta
  const handleRouteChange = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-responsive bg-background-cream">
      {/* Sidebar */}
      {shouldShowSidebar && (
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={handleSidebarToggle}
          isMobile={isMobile}
        />
      )}

      {/* Overlay para móvil */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className={clsx(
        "flex flex-col flex-1 overflow-hidden transition-all duration-300",
        isMobile ? "ml-0" : ""
      )}>
        {/* Header */}
        <ResponsiveHeader
          onMenuToggle={handleSidebarToggle}
          showMenuButton={isMobile}
          isMobile={isMobile}
          isTablet={isTablet}
          isDesktop={isDesktop}
        />

        {/* Contenido principal */}
        <main
          ref={scrollContainerRef}
          className={clsx(
            "flex-1 overflow-y-auto overflow-x-hidden",
            isMobile ? "ios-scroll-fix" : "scroll-smooth"
          )}
        >
          <div className={clsx(
            "w-full min-h-full",
            isMobile ? "max-w-[430px] mx-auto bg-background-cream mobile-content-padding" : "bg-background-cream"
          )}>
            {children}
          </div>
        </main>

        {/* Footer móvil - Solo en móvil y cuando no estamos en ciertas rutas */}
        {isMobile && !pathname.includes('/charge/cart') && (
          <ResponsiveFooterNav />
        )}
      </div>
    </div>
  );
}
