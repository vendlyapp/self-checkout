'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface DashboardContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'section' | 'grid';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

const DashboardContainer = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  responsive = true
}: DashboardContainerProps) => {
  const baseClasses = 'w-full';

  const variantClasses = {
    default: "bg-transparent",
    card: "bg-white/20 rounded-2xl shadow-md border border-gray-200",
    section: "bg-background-cream rounded-2xl p-6",
    grid: "bg-white rounded-2xl border border-gray-200 shadow-md p-6",
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const responsiveClasses = responsive ? {
    mobile: 'p-4',
    tablet: 'md:p-6',
    desktop: 'lg:p-8'
  } : {};

  return (
    <div className={clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      responsive && 'p-4 md:p-6 lg:p-8',
      className
    )}>
      {children}
    </div>
  );
};

export default DashboardContainer;
