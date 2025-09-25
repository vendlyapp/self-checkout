'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface DashboardSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: 'default' | 'compact' | 'spacious';
  showHeader?: boolean;
}

const DashboardSection = ({
  children,
  title,
  subtitle,
  className = '',
  headerClassName = '',
  contentClassName = '',
  variant = 'default',
  showHeader = true
}: DashboardSectionProps) => {
  const variantClasses = {
    default: 'mb-6',
    compact: 'mb-4',
    spacious: 'mb-8'
  };

  const headerSpacing = {
    default: 'mb-4',
    compact: 'mb-3',
    spacious: 'mb-6'
  };

  return (
    <section className={clsx(
      'w-full',
      variantClasses[variant],
      className
    )}>
      {showHeader && (title || subtitle) && (
        <div className={clsx(
          'flex flex-col',
          headerSpacing[variant],
          headerClassName
        )}>
          {title && (
            <h2 className={clsx(
              'font-semibold text-gray-900',
              variant === 'compact' ? 'text-lg' : 'text-xl',
              variant === 'spacious' ? 'text-2xl' : ''
            )}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={clsx(
              'text-gray-600',
              variant === 'compact' ? 'text-sm' : 'text-base'
            )}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className={clsx(
        'w-full',
        contentClassName
      )}>
        {children}
      </div>
    </section>
  );
};

export default DashboardSection;
