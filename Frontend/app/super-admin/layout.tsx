'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, useSidebar } from '@/lib/contexts/SidebarContext';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import SuperAdminSidebar from '@/components/admin/layout/SuperAdminSidebar';
import SuperAdminHeader from '@/components/admin/layout/SuperAdminHeader';
import Backdrop from '@/components/admin/layout/Backdrop';

interface Props {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verificando acceso...</p>
        </div>
      </div>
    );
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
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        {/* Header */}
        <SuperAdminHeader />
        
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-7xl md:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

