// app/(dashboard)/layout.tsx
import { ReactNode } from 'react';
import FooterNav from '@/components/navigation/FooterNav';
import Header from '@/components/navigation/Header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-mobile bg-background-cream">
      {/* Header fijo */}
      <Header />
      
      {/* Contenido scrolleable */}
      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        <div className="min-h-full">
          {children}
        </div>
      </main>

      {/* Navegación fija */}
      <FooterNav />
    </div>
  );
}