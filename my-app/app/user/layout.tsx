// app/user/layout.tsx
import { ReactNode } from 'react';
import FooterNavUser from '@/components/navigation/user/FooterNavUser';
import HeaderUser from '@/components/navigation/user/HeaderUser';

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full w-full bg-background-cream">
      {/* Header principal fijo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        <HeaderUser />
      </div>
      
      {/* Contenido principal con scroll y padding para el header fijo */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative" style={{ paddingTop: '85px' }}>
        <div className="min-h-full pb-[140px]">
          {children}
        </div>
      </main>
      
      {/* Footer de navegación fijo en la parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <FooterNavUser />
      </div>
    </div>
  );
}