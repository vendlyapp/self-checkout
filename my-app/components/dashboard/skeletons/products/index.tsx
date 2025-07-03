import React from 'react';
import { SkeletonBase } from '../common/SkeletonBase';
import { SearchSkeletonLoader } from '../analytics';

// ===== HEADER SKELETON =====
export const ProductsHeaderSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-2">
    <div className="space-y-2">
      <div className="h-8 bg-muted rounded w-32"></div>
      <div className="h-4 bg-muted rounded w-48"></div>
    </div>
  </SkeletonBase>
);

// ===== STAT CARD SKELETON =====
export const StatCardSkeletonLoader: React.FC = () => (
  <SkeletonBase>
    <div className="bg-card rounded-2xl p-5 border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 bg-muted rounded-xl"></div>
        <div className="h-5 bg-muted rounded w-12"></div>
      </div>

      <div className="mb-4">
        <div className="h-8 bg-muted rounded mb-2"></div>
        <div className="h-4 bg-muted rounded w-20"></div>
      </div>

      {/* Mini chart skeleton */}
      <div className="h-12 -mx-2 mb-2">
        <div className="h-full bg-muted rounded"></div>
      </div>

      {/* Trend indicator */}
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-muted rounded"></div>
        <div className="h-3 bg-muted rounded w-8"></div>
      </div>
    </div>
  </SkeletonBase>
);

// ===== STATS GRID SKELETON =====
export const StatsGridSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-4">
    <div className="grid grid-cols-2 gap-3">
      <StatCardSkeletonLoader />
      <StatCardSkeletonLoader />
    </div>
  </SkeletonBase>
);

// ===== ACTION BUTTON SKELETON =====
export const ActionButtonSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-4">
    <div className="bg-primary/10 rounded-2xl p-5 border border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-muted rounded-xl"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-24"></div>
            <div className="h-3 bg-muted rounded w-20"></div>
          </div>
        </div>
        <div className="w-5 h-5 bg-muted rounded"></div>
      </div>
    </div>
  </SkeletonBase>
);

// ===== NAVIGATION ITEM SKELETON =====
export const NavigationItemSkeletonLoader: React.FC = () => (
  <SkeletonBase>
    <div className="bg-card rounded-2xl p-5 border border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-muted rounded-xl"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-20"></div>
            <div className="h-3 bg-muted rounded w-16"></div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-5 bg-muted rounded w-12"></div>
          <div className="w-5 h-5 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  </SkeletonBase>
);

// ===== NAVIGATION LIST SKELETON =====
export const NavigationListSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-4">
    <div className="space-y-3">
      <NavigationItemSkeletonLoader />
      <NavigationItemSkeletonLoader />
    </div>
  </SkeletonBase>
);

// ===== COMPLETE PRODUCTS DASHBOARD SKELETON =====
export const ProductsDashboardSkeletonLoader: React.FC = () => (
  <div className="p-4 space-y-4 bg-background min-h-screen">
    <ProductsHeaderSkeletonLoader />
    <SearchSkeletonLoader />
    <StatsGridSkeletonLoader />
    <ActionButtonSkeletonLoader />
    <NavigationListSkeletonLoader />
  </div>
);

// ===== ERROR STATE =====
export const ProductsErrorState: React.FC<{ 
  error: string; 
  onRetry: () => void;
}> = ({ error, onRetry }) => (
  <div className="p-4 space-y-4 bg-background min-h-screen">
    <div className="mb-2">
      <h1 className="text-2xl font-bold text-foreground">Produkte</h1>
      <p className="text-sm text-red-500">Error: {error}</p>
    </div>
    
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg 
          className="w-8 h-8 text-red-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
      </div>
      
      <div className="text-destructive text-lg font-semibold mb-2">
        Fehler beim Laden der Produkte
      </div>
      <p className="text-muted-foreground mb-6 max-w-sm">
        {error}
      </p>
      
      <button 
        onClick={onRetry}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-fast tap-highlight-transparent font-medium"
      >
        Erneut versuchen
      </button>
    </div>
  </div>
); 