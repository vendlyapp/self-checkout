import React from 'react';
import { SkeletonBase } from '../common/SkeletonBase';

// ===== GREETING SECTION SKELETON =====
export const GreetingSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className="bg-card rounded-2xl p-5 border border-border/50">
      {/* Header con saludo */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded-lg w-32"></div>
          <div className="h-4 bg-muted rounded w-24"></div>
        </div>
        <div className="w-16 h-8 bg-muted rounded-full"></div>
      </div>
      
      {/* Status info */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-muted rounded-full"></div>
        <div className="h-4 bg-muted rounded w-20"></div>
        <div className="h-4 bg-muted rounded w-16"></div>
      </div>
    </div>
  </SkeletonBase>
);

// ===== MAIN ACTION CARDS SKELETON =====
export const MainActionCardsSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className="grid grid-cols-2 gap-3">
      {/* Primary card */}
      <div className="bg-primary/10 rounded-2xl p-5 border border-border/50">
        <div className="space-y-3">
          <div className="w-8 h-8 bg-muted rounded-xl"></div>
          <div className="space-y-2">
            <div className="h-5 bg-muted rounded w-20"></div>
            <div className="h-4 bg-muted rounded w-16"></div>
          </div>
        </div>
      </div>
      
      {/* Secondary card */}
      <div className="bg-card rounded-2xl p-5 border border-border/50">
        <div className="space-y-3">
          <div className="w-8 h-8 bg-muted rounded-xl"></div>
          <div className="space-y-2">
            <div className="h-5 bg-muted rounded w-18"></div>
            <div className="h-4 bg-muted rounded w-14"></div>
          </div>
        </div>
      </div>
    </div>
  </SkeletonBase>
);

// ===== SEARCH BAR SKELETON =====
export const SearchSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className="w-full h-12 bg-muted rounded-xl border border-border/50"></div>
  </SkeletonBase>
);

// ===== TODAY STATS SKELETON =====
export const TodayStatsSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className="grid grid-cols-2 gap-3">
      {/* Stats card 1 */}
      <div className="bg-card rounded-2xl p-4 border border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-16"></div>
            <div className="h-6 bg-muted rounded w-20"></div>
            <div className="h-3 bg-muted rounded w-12"></div>
          </div>
        </div>
      </div>
      
      {/* Stats card 2 */}
      <div className="bg-card rounded-2xl p-4 border border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-14"></div>
            <div className="h-6 bg-muted rounded w-18"></div>
            <div className="h-3 bg-muted rounded w-10"></div>
          </div>
        </div>
      </div>
    </div>
  </SkeletonBase>
);

// ===== DAILY GOAL SKELETON =====
export const DailyGoalSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className="bg-card rounded-2xl p-5 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-muted rounded w-24"></div>
        <div className="h-4 bg-muted rounded w-16"></div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Circular progress */}
        <div className="w-20 h-20 bg-muted rounded-full"></div>
        
        {/* Progress info */}
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded w-24"></div>
            <div className="h-4 bg-muted rounded w-20"></div>
          </div>
          <div className="h-2 bg-muted rounded-full w-full"></div>
        </div>
      </div>
    </div>
  </SkeletonBase>
);

// ===== QUICK ACCESS SLIDER SKELETON =====
export const QuickAccessSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className="space-y-4">
      <div className="h-5 bg-muted rounded w-28"></div>
      
      {/* Slider items */}
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div 
            key={idx}
            className="flex-shrink-0 bg-card rounded-xl p-3 border border-border/50"
            style={{ width: '70px' }}
          >
            <div className="space-y-2 text-center">
              <div className="w-8 h-8 bg-muted rounded-xl mx-auto"></div>
              <div className="h-3 bg-muted rounded w-12 mx-auto"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination dots */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="w-2 h-2 bg-muted rounded-full"></div>
        ))}
      </div>
    </div>
  </SkeletonBase>
);

// ===== HOME DASHBOARD COMPLETE SKELETON =====
export const HomeDashboardSkeletonLoader: React.FC = () => (
  <div className="px-4 pt-2 pb-4 min-h-screen bg-background">
    <GreetingSkeletonLoader />
    <MainActionCardsSkeletonLoader />
    <SearchSkeletonLoader />
    <TodayStatsSkeletonLoader />
    <DailyGoalSkeletonLoader />
    <QuickAccessSkeletonLoader />
  </div>
);

// ===== ERROR STATE =====
export const DashboardErrorState: React.FC<{ 
  error: string; 
  onRetry: () => void;
}> = ({ error, onRetry }) => (
  <div className="px-4 pt-8 pb-4 min-h-screen bg-background">
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
        Fehler beim Laden
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