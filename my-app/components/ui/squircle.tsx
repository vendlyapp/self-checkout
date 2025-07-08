'use client';

import React from 'react';

type SquircleVariant = 'subtle' | 'medium' | 'strong' | 'sm' | 'ios';

interface SquircleProps {
  children: React.ReactNode;
  className?: string;
  variant?: SquircleVariant; // Predefined squircle variants
  smoothing?: number; // 0-1 for backward compatibility
  as?: keyof React.JSX.IntrinsicElements;
  [key: string]: any;
}

const Squircle: React.FC<SquircleProps> = ({ 
  children, 
  className = '', 
  variant = 'medium',
  smoothing,
  as: Component = 'div',
  ...restProps
}) => {
  // Si se especifica smoothing, mapear a variant
  const getVariantFromSmoothing = (smoothing: number): SquircleVariant => {
    if (smoothing <= 0.2) return 'sm';
    if (smoothing <= 0.4) return 'subtle';
    if (smoothing <= 0.6) return 'medium';
    if (smoothing <= 0.8) return 'strong';
    return 'strong';
  };

  // Usar smoothing para determinar variant si se proporciona
  const finalVariant = smoothing !== undefined 
    ? getVariantFromSmoothing(smoothing) 
    : variant;

  // Mapear variant a clase CSS
  const getSquircleClass = (variant: SquircleVariant): string => {
    switch (variant) {
      case 'subtle': return 'squircle-subtle';
      case 'strong': return 'squircle-strong';
      case 'sm': return 'squircle-sm';
      case 'ios': return 'squircle';
      case 'medium':
      default: return 'squircle';
    }
  };

  const squircleClass = getSquircleClass(finalVariant);

  const elementProps = {
    className: `${squircleClass} ${className}`,
    ...restProps,
  };

  return React.createElement(Component as any, elementProps, children);
};

export default Squircle; 