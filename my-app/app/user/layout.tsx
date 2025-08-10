'use client'

// app/user/layout.tsx
import { ReactNode } from 'react';
import FooterNavUser from '@/components/navigation/user/FooterNavUser';
import HeaderUser from '@/components/navigation/user/HeaderUser';
import { usePathname } from 'next/navigation';

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  const pathname = usePathname();
  const isScanRoute = pathname === '/user/scan';

  const containerBgClass = isScanRoute ? 'bg-[#191F2D]' : 'bg-background-cream';
  const headerBgClass = isScanRoute ? 'bg-[#191F2D]' : 'bg-white';

  return (
    <div className={`flex flex-col h-full w-full ${containerBgClass}`}>
      {/* Header principal fijo */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${headerBgClass}`}>
        <HeaderUser isDarkMode={isScanRoute} />
      </div>

      {/* Contenido principal con scroll y padding para el header fijo */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative pt-[85px]">
        {children}
      </main>

      {/* Footer de navegación fijo en la parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <FooterNavUser />
      </div>
    </div>
  );
};

export default UserLayout;