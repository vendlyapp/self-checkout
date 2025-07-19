'use client'

import React from 'react';
import Header from '@/components/navigation/Header';
import HeaderNav from '@/components/navigation/HeaderNav';

interface FixedHeaderContainerSimpleProps {
  title?: string;
  children: React.ReactNode;
}

export default function FixedHeaderContainerSimple({
  title = 'Warenkorb',
  children
}: FixedHeaderContainerSimpleProps) {
  return (
    <div className="flex flex-col h-full bg-background-cream">
      {/* Header principal fijo - Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        <Header />
      </div>

      {/* Header secundario fijo - HeaderNav */}
      <div className="fixed top-[57px] left-0 right-0 z-50 bg-background-cream border-b border-gray-200">
        <HeaderNav title={title} />
      </div>

      {/* Contenido scrolleable con padding para los elementos fijos */}
      <div className="flex-1 overflow-hidden" style={{ paddingTop: '130px' }}>
        {children}
      </div>
    </div>
  );
} 