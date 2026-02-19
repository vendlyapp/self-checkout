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
    card: "bg-white rounded-2xl shadow-sm border border-gray-200",
    section: "bg-background-cream rounded-2xl",
    grid: "bg-white rounded-2xl border border-gray-200 shadow-sm",
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8'
  };

  const responsivePadding = responsive && (variant === 'card' || variant === 'grid' || variant === 'section')
    ? 'p-5 md:p-6'
    : responsive
      ? 'p-5 md:p-6'
      : '';

  return (
    <div className={clsx(
      baseClasses,
      variantClasses[variant],
      !responsive && sizeClasses[size],
      responsivePadding,
      className
    )}>
      {children}
    </div>
  );
};

export default DashboardContainer;
