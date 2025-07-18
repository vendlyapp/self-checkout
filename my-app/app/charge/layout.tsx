'use client'
// app/(dashboard)/charge/layout.tsx
import { ReactNode } from 'react';
import Header from '@/components/navigation/Header';
import HeaderNav from '@/components/navigation/HeaderNav';

export default function ChargeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-mobile bg-background-cream">
      {/* Header fijo */}
      <Header />
      <HeaderNav />
      
      {/* Contenido scrolleable sin FooterNav */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
} 