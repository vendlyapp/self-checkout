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

const DashboardGrid = ({
  children,
  className = '',
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}: DashboardGridProps) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const gridCols = {
    mobile: `grid-cols-${cols.mobile || 1}`,
    tablet: `md:grid-cols-${cols.tablet || 2}`,
    desktop: `lg:grid-cols-${cols.desktop || 3}`
  };

  return (
    <div className={clsx(
      'grid w-full',
      gridCols.mobile,
      gridCols.tablet,
      gridCols.desktop,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

export default DashboardGrid;
