'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, useSidebar } from '@/lib/contexts/SidebarContext';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import SuperAdminSidebar from '@/components/admin/layout/SuperAdminSidebar';
import SuperAdminHeader from '@/components/admin/layout/SuperAdminHeader';
import Backdrop from '@/components/admin/layout/Backdrop';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { Loader } from '@/components/ui/Loader';

interface Props {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Configurar timeout de sesión de 30 minutos
  useSessionTimeout({
    enabled: true,
    onSessionExpired: () => {
      console.log('Sitzung aufgrund von Inaktivität abgelaufen (30 Minuten)');
    },
  });

  useEffect(() => {
    // Verificar que el usuario tenga rol SUPER_ADMIN
    const role = localStorage.getItem('userRole');
    if (role !== 'SUPER_ADMIN') {
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  // Mostrar loading mientras verifica
  if (isLoading) {
    return <Loader variant="fullscreen" message="Zugriff wird überprüft..." />;
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <SuperAdminLayoutContent>{children}</SuperAdminLayoutContent>
      </SidebarProvider>
    </ThemeProvider>
  );
}

function SuperAdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isMobileOpen, isHovered } = useSidebar();
  
  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar and Backdrop */}
      <SuperAdminSidebar />
      <Backdrop />
      
      {/* Main Content Area */}
      <div className={`flex-1 transition-ios-slow ${mainContentMargin}`}>
        {/* Header */}
        <SuperAdminHeader />
        
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-[1920px] w-full md:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

