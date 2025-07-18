'use client'
// app/(dashboard)/charge/layout.tsx
import { ReactNode } from 'react';
import Header from '@/components/navigation/Header';
import HeaderNav from '@/components/navigation/HeaderNav';
import { usePathname } from 'next/navigation';

export default function ChargeLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  let title = 'Verkauf starten';
  if (pathname === '/charge/cart') title = 'Warenkorb';
  else if (pathname === '/charge/payment') title = 'Bezahlung';

  return (
    <div className="flex flex-col h-mobile bg-background-cream">
      {/* Header fijo */}
      <Header />
      <HeaderNav title={title} />
      {/* Contenido scrolleable sin FooterNav */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
} 