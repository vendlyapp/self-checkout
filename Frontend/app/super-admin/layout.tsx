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
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-brand-50 via-background-cream to-brand-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Spinner minimalista y elegante */}
          <div className="relative w-14 h-14">
            {/* Glow suave */}
            <div className="absolute inset-0 rounded-full bg-[#25d076] opacity-10 blur-2xl animate-pulse"></div>
            
            {/* Círculo exterior sutil */}
            <div className="absolute inset-0 rounded-full border-[3px] border-gray-100 dark:border-gray-700"></div>
            
            {/* Círculo animado con gradiente verde elegante */}
            <div 
              className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#25d076] border-r-[#25d076] border-b-transparent animate-spin"
              style={{ 
                animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                filter: 'drop-shadow(0 0 8px rgba(37, 208, 118, 0.3))'
              }}
            ></div>
            
            {/* Punto central minimalista */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#25d076] rounded-full"></div>
          </div>
          
          {/* Texto elegante */}
          <div className="flex flex-col items-center space-y-3">
            <p className="text-gray-600 dark:text-gray-300 font-light text-sm tracking-wide">Verificando acceso...</p>
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#25d076] rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.4s' }}></div>
              <div className="w-1.5 h-1.5 bg-[#25d076] rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}></div>
              <div className="w-1.5 h-1.5 bg-[#25d076] rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}></div>
            </div>
          </div>
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
        <div className="p-4 mx-auto max-w-[1920px] w-full md:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

