import React from 'react';
import { SkeletonBase } from '../common/SkeletonBase';

const CARD_CLASS = 'bg-white rounded-2xl border border-gray-200 shadow-sm';

// ===== SEARCH BAR SKELETON =====
export const SearchSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className="w-full h-11 bg-gray-200 rounded-full animate-pulse" />
  </SkeletonBase>
);

// ===== ANALYTICS HEADER SKELETON =====
export const AnalyticsHeaderSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-5">
    <div className="flex items-center justify-end">
      <div className="w-9 h-9 bg-muted rounded-lg mr-4"></div>
    </div>
  </SkeletonBase>
);

// ===== ACTIVE CUSTOMERS SKELETON =====
export const ActiveCustomersSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-5">
    <div className={`${CARD_CLASS} p-5 md:p-6`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-12 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-12 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
          </div>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  </SkeletonBase>
);

// ===== SALES CHART SKELETON =====
export const SalesChartSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-5">
    <div className={`${CARD_CLASS} p-5 md:p-6`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
        <div className="h-40 md:h-48 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  </SkeletonBase>
);

// ===== QUICK ACCESS GRID SKELETON =====
export const QuickAccessGridSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-5">
    <div className="space-y-4">
      <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className={`${CARD_CLASS} p-4`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-16 md:w-20 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </SkeletonBase>
);

// ===== PAYMENT METHODS SKELETON =====
export const PaymentMethodsSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-5">
    <div className={`${CARD_CLASS} p-5 md:p-6`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-28 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </SkeletonBase>
);

// ===== CART GAUGE SKELETON =====
export const CartGaugeSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-5">
    <div className={`${CARD_CLASS} p-5 md:p-6`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-28 h-28 md:w-32 md:h-32 bg-gray-200 rounded-full animate-pulse" />
          <div className="space-y-2 text-center">
            <div className="h-6 bg-gray-200 rounded w-16 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-24 mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </SkeletonBase>
);

// ===== DESKTOP/TABLET ANALYTICS DASHBOARD SKELETON =====
export const AnalyticsDashboardSkeletonLoaderDesktop: React.FC = () => (
  <div className="hidden md:block p-4 md:p-6 lg:p-8 space-y-6 md:space-y-10 lg:space-y-12 bg-background-cream min-h-screen">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
      <div className="space-y-2">
        <div className="h-7 md:h-8 bg-gray-200 rounded-lg w-40 md:w-52 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-64 md:w-80 animate-pulse" />
      </div>
      <div className="w-full md:max-w-sm lg:w-[380px] h-11 bg-gray-200 rounded-full animate-pulse" />
    </div>

    {/* Top Row: 2 cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <ActiveCustomersSkeletonLoader />
      <SalesChartSkeletonLoader />
    </div>

    {/* Middle Row: 2 cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className={CARD_CLASS}>
        <div className="p-5 md:p-6">
          <QuickAccessGridSkeletonLoader />
        </div>
      </div>
      <PaymentMethodsSkeletonLoader />
    </div>

    {/* Bottom: Cart Gauge */}
    <CartGaugeSkeletonLoader />
  </div>
);

// ===== FULL ANALYTICS DASHBOARD SKELETON (responsive) =====
export const AnalyticsDashboardSkeletonLoader: React.FC = () => (
  <div className="w-full min-h-screen bg-background-cream">
    {/* Vista móvil */}
    <div className="block md:hidden p-4 space-y-5">
      <SearchSkeletonLoader />
      <ActiveCustomersSkeletonLoader />
      <SalesChartSkeletonLoader />
      <QuickAccessGridSkeletonLoader />
      <PaymentMethodsSkeletonLoader />
      <CartGaugeSkeletonLoader />
      <div className="h-20" aria-hidden="true" />
    </div>
    {/* Vista tablet + desktop */}
    <AnalyticsDashboardSkeletonLoaderDesktop />
  </div>
); 