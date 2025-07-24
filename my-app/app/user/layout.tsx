// app/(dashboard)/layout.tsx
import { ReactNode } from 'react';
import FooterNavUser from '@/components/navigation/user/FooterNavUser';
import HeaderUser from '@/components/navigation/user/HeaderUser';

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-mobile bg-background-cream">
      {/* Header fijo */}
      <HeaderUser />
      
      {/* Contenido scrolleable */}
      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        <div className="min-h-full">
          {children}
        </div>
      </main>

      {/* Navegación fija */}
      <FooterNavUser />
    </div>
  );
}