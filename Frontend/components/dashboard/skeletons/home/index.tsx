import React from 'react';
import { SkeletonBase } from '../common/SkeletonBase';

// Clase común para cards tipo skeleton (alineada con diseño real tablet/desktop)
const CARD_CLASS = 'bg-white rounded-2xl border border-gray-200 shadow-sm';

// ===== GREETING SECTION SKELETON =====
export const GreetingSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className={`${CARD_CLASS} p-5 md:p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded-lg w-32 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
        <div className="w-16 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
      </div>
    </div>
  </SkeletonBase>
);

// ===== MAIN ACTION CARDS SKELETON =====
export const MainActionCardsSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      <div className="bg-brand-500/10 rounded-2xl p-5 md:p-6 border border-gray-200 min-h-[160px] md:min-h-[180px]">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 h-full">
          <div className="w-12 h-12 md:w-10 md:h-10 bg-gray-300 rounded-xl animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
          </div>
        </div>
      </div>
      <div className={`${CARD_CLASS} p-5 md:p-6 min-h-[160px] md:min-h-[180px]`}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 h-full">
          <div className="w-12 h-12 md:w-10 md:h-10 bg-gray-200 rounded-xl animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </SkeletonBase>
);

// ===== SEARCH BAR SKELETON =====
export const SearchSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className="w-full h-12 md:h-11 bg-gray-200 rounded-xl animate-pulse" />
  </SkeletonBase>
);

// ===== TODAY STATS SKELETON =====
export const TodayStatsSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`${CARD_CLASS} p-3 md:p-4`}>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="h-3.5 bg-gray-200 rounded w-14 animate-pulse" />
              <div className="h-5 md:h-6 bg-gray-200 rounded w-16 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-10 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </SkeletonBase>
);

// ===== DAILY GOAL SKELETON =====
export const DailyGoalSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className={`${CARD_CLASS} p-4 md:p-6`}>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="h-5 md:h-6 bg-gray-200 rounded w-28 animate-pulse" />
        <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      <div className="flex items-center gap-4 md:gap-6">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded-full flex-shrink-0 animate-pulse" />
        <div className="flex-1 space-y-3 min-w-0">
          <div className="space-y-2">
            <div className="h-6 md:h-8 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
          <div className="h-2 bg-gray-200 rounded-full w-full animate-pulse" />
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </SkeletonBase>
);

// ===== QUICK ACCESS SLIDER SKELETON =====
export const QuickAccessSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className="space-y-4">
      <div className="h-5 bg-gray-200 rounded w-28 animate-pulse" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="flex-shrink-0 w-[70px] md:w-auto md:flex-1">
            <div className={`${CARD_CLASS} p-3 md:p-4 h-full`}>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-xl animate-pulse mx-auto md:mx-0" />
                <div className="space-y-1 text-center md:text-left">
                  <div className="h-3 bg-gray-200 rounded w-12 md:w-16 animate-pulse mx-auto md:mx-0" />
                  <div className="h-2.5 bg-gray-200 rounded w-10 md:w-14 animate-pulse mx-auto md:mx-0 hidden md:block" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </SkeletonBase>
);

// ===== SYSTEM STATUS SKELETON =====
export const SystemStatusSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className={`${CARD_CLASS} p-4 md:p-5`}>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="h-4 md:h-5 bg-gray-200 rounded w-28 animate-pulse" />
        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 md:w-4 md:h-4 bg-gray-200 rounded-full animate-pulse" />
            <div className="space-y-1">
              <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </SkeletonBase>
);

// ===== QUICK METRICS SKELETON =====
export const QuickMetricsSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className={`${CARD_CLASS} p-4 md:p-5`}>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-14 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-5 md:h-6 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-3 mt-1 bg-gray-200 rounded w-12 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </SkeletonBase>
);

// ===== RECENT SALES SECTION SKELETON (para home) =====
export const RecentSalesSectionSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className={`${CARD_CLASS} p-4 md:p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 md:h-6 bg-gray-200 rounded w-36 animate-pulse" />
      </div>
      <div className="space-y-2 md:space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded w-24 md:w-32 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
              <div className="h-3 mt-1 bg-gray-200 rounded w-12 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </SkeletonBase>
);

// ===== DESKTOP/TABLET HOME DASHBOARD SKELETON =====
export const HomeDashboardSkeletonLoaderDesktop: React.FC = () => (
  <div className="hidden md:block p-4 md:px-6 md:pt-10 md:pb-6 lg:p-8 space-y-6 md:space-y-8 lg:space-y-10 xl:space-y-12 bg-background-cream min-h-dvh">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
      <div className="space-y-2">
        <div className="h-7 md:h-8 bg-gray-200 rounded-lg w-32 md:w-40 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-56 md:w-72 animate-pulse" />
      </div>
      <div className="w-full md:max-w-sm lg:w-[420px] h-11 bg-gray-200 rounded-xl animate-pulse" />
    </div>

    {/* Greeting card (ya incluye card internamente) */}
    <GreetingSkeletonLoader />

    {/* Main actions card */}
    <div className={`${CARD_CLASS} p-5 md:p-6`}>
      <div className="h-5 bg-gray-200 rounded w-28 mb-4 animate-pulse" />
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-brand-500/10 rounded-2xl p-5 md:p-6 border border-gray-200 min-h-[160px] md:min-h-[180px]">
          <div className="flex flex-col md:flex-row md:items-center gap-3 h-full">
            <div className="w-12 h-12 md:w-10 md:h-10 bg-gray-300 rounded-xl animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-200 min-h-[160px] md:min-h-[180px]">
          <div className="flex flex-col md:flex-row md:items-center gap-3 h-full">
            <div className="w-12 h-12 md:w-10 md:h-10 bg-gray-200 rounded-xl animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* System Status */}
    <SystemStatusSkeletonLoader />

    {/* Today Stats card */}
    <div className={`${CARD_CLASS} p-4 md:p-6`}>
      <div className="h-5 bg-gray-200 rounded w-16 mb-4 animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl p-3 md:p-4 border border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-gray-200 rounded-xl animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <div className="h-3.5 bg-gray-200 rounded w-14 animate-pulse" />
                <div className="h-5 md:h-6 bg-gray-200 rounded w-16 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-10 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Daily Goal card */}
    <DailyGoalSkeletonLoader />

    {/* Quick Metrics */}
    <QuickMetricsSkeletonLoader />

    {/* Tools & Shortcuts card */}
    <div className={`${CARD_CLASS} p-5 md:p-6`}>
      <div className="h-5 bg-gray-200 rounded w-36 mb-4 animate-pulse" />
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {Array.from({ length: 10 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="h-3.5 bg-gray-200 rounded w-16 animate-pulse" />
              <div className="h-2.5 bg-gray-200 rounded w-12 animate-pulse hidden md:block" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Recent Sales card */}
    <RecentSalesSectionSkeletonLoader />
  </div>
);

// ===== HOME DASHBOARD COMPLETE SKELETON (móvil + tablet/desktop responsivo) =====
export const HomeDashboardSkeletonLoader: React.FC = () => (
  <div className="w-full min-h-dvh bg-background-cream">
    {/* Vista móvil */}
    <div className="block md:hidden px-4 pt-2 pb-4 space-y-6 bg-background-cream">
      <GreetingSkeletonLoader />
      <MainActionCardsSkeletonLoader />
      <SearchSkeletonLoader />
      <TodayStatsSkeletonLoader />
      <DailyGoalSkeletonLoader />
      <QuickAccessSkeletonLoader />
    </div>
    {/* Vista tablet + desktop */}
    <HomeDashboardSkeletonLoaderDesktop />
  </div>
);

// ===== ERROR STATE =====
export const DashboardErrorState: React.FC<{ 
  error: string; 
  onRetry: () => void;
}> = ({ error, onRetry }) => (
  <div className="px-4 pt-8 pb-4 min-h-dvh bg-background">
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