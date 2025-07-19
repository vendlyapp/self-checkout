'use client'
// app/(dashboard)/charge/layout.tsx
import { ReactNode } from 'react';

export default function ChargeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-mobile bg-background-cream">
      {/* Contenido scrolleable */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
} 