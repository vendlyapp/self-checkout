'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, useSidebar } from '@/lib/contexts/SidebarContext';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import SuperAdminSidebar from '@/components/admin/layout/SuperAdminSidebar';
import SuperAdminHeader from '@/components/admin/layout/SuperAdminHeader';
import Backdrop from '@/components/admin/layout/Backdrop';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { Loader } from '@/components/ui/Loader';
import { useAuth } from '@/lib/auth/AuthContext';

interface Props {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: Props) {
  const router = useRouter();
  const { session, loading: authLoading, userRole } = useAuth();

  useSessionTimeout({
    enabled: true,
    onSessionExpired: () => {},
  });

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (userRole !== 'SUPER_ADMIN') {
      router.push('/login');
    }
  }, [authLoading, session, userRole, router]);

  if (authLoading || !session || userRole !== 'SUPER_ADMIN') {
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
    <div className="flex flex-col flex-1 min-h-0 w-full overflow-hidden xl:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Sidebar and Backdrop */}
      <SuperAdminSidebar />
      <Backdrop />
      
      {/* Main Content Area */}
      <div className={`flex-1 min-h-0 flex flex-col transition-ios-slow ${mainContentMargin}`}>
        {/* Header */}
        <SuperAdminHeader />
        
        {/* Page Content — scroll interno, cabecera fija en columna */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="p-4 mx-auto max-w-[1920px] w-full md:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

