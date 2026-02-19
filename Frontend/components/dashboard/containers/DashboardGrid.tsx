'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface DashboardGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

const COLS_CLASSES: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};

const MD_COLS_CLASSES: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

const LG_COLS_CLASSES: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

const DashboardGrid = ({
  children,
  className = '',
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}: DashboardGridProps) => {
  const gapClasses = {
    sm: 'gap-2 md:gap-3',
    md: 'gap-3 md:gap-4 lg:gap-5',
    lg: 'gap-4 md:gap-5 lg:gap-6',
    xl: 'gap-6 md:gap-8'
  };

  const m = cols.mobile ?? 1;
  const t = cols.tablet ?? 2;
  const d = cols.desktop ?? 3;

  return (
    <div className={clsx(
      'grid w-full min-w-0',
      COLS_CLASSES[m] ?? 'grid-cols-1',
      MD_COLS_CLASSES[t] ?? 'md:grid-cols-2',
      LG_COLS_CLASSES[d] ?? 'lg:grid-cols-3',
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

export default DashboardGrid;
