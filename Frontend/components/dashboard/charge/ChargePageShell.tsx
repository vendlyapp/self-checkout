'use client';

import { ReactNode } from 'react';

/** Zentrierter Inhalt wie Storefront — max-w-3xl */
export function ChargePageShell({
  children,
  className = '',
  bottomPad = 'pb-36',
}: {
  children: ReactNode;
  className?: string;
  bottomPad?: string;
}) {
  return (
    <div className={`mx-auto w-full min-w-0 max-w-3xl px-4 ${bottomPad} ${className}`}>
      {children}
    </div>
  );
}
