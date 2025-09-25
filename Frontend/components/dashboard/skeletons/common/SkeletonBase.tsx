import React from 'react';

// ===== SKELETON BASE COMPONENT =====
export const SkeletonBase: React.FC<{ 
  className?: string; 
  children?: React.ReactNode;
}> = ({ className = "", children }) => (
  <div className={`animate-pulse ${className}`}>
    {children}
  </div>
); 