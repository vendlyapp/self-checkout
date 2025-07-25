// app/(dashboard)/layout.tsx
import { ReactNode } from 'react';
import FooterNavUser from '@/components/navigation/user/FooterNavUser';


export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-mobile bg-background-cream">
      {/* Contenido scrolleable */}
      <main className="flex-1 overflow-y-auto pb-[140px] no-scrollbar">
        <div className="min-h-full">
          {children}
        </div>
      </main>
      {/* Footer de navegación primero (z-40 por defecto) */}
      <FooterNavUser />
      {/* Resumen de carrito fijo, siempre encima (z-50) */}
      
    </div>
  );
}