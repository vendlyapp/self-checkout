import React from 'react';
import { SkeletonBase } from '../common/SkeletonBase';

// ===== SEARCH BAR SKELETON =====
export const SearchSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className="w-full h-12 bg-muted rounded-xl border border-border/50"></div>
  </SkeletonBase>
);

// ===== ANALYTICS HEADER SKELETON =====
export const AnalyticsHeaderSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-5">
    <div className="flex items-center justify-between">
      <div className="h-8 bg-muted rounded w-48"></div>
      <div className="w-9 h-9 bg-muted rounded-lg"></div>
    </div>
  </SkeletonBase>
);

// ===== ACTIVE CUSTOMERS SKELETON =====
export const ActiveCustomersSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-5">
    <div className="bg-card rounded-xl p-4 border border-border/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-muted rounded w-32"></div>
          <div className="h-4 bg-muted rounded w-16"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-12"></div>
            <div className="h-4 bg-muted rounded w-20"></div>
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-12"></div>
            <div className="h-4 bg-muted rounded w-20"></div>
          </div>
        </div>
        
        <div className="w-full h-2 bg-muted rounded-full"></div>
      </div>
    </div>
  </SkeletonBase>
);

// ===== SALES CHART SKELETON =====
export const SalesChartSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-5">
    <div className="bg-card rounded-xl p-4 border border-border/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 bg-muted rounded w-24"></div>
            <div className="h-8 bg-muted rounded w-32"></div>
          </div>
          <div className="h-8 bg-muted rounded w-24"></div>
        </div>
        
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    </div>
  </SkeletonBase>
);

// ===== QUICK ACCESS GRID SKELETON =====
export const QuickAccessGridSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-5">
    <div className="space-y-4">
      <div className="h-5 bg-muted rounded w-32"></div>
      
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="bg-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-lg"></div>
              <div className="h-4 bg-muted rounded w-16"></div>
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
    <div className="bg-card rounded-xl p-4 border border-border/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-muted rounded w-28"></div>
          <div className="h-8 bg-muted rounded w-24"></div>
        </div>
        
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
              </div>
              <div className="h-4 bg-muted rounded w-12"></div>
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
    <div className="bg-card rounded-xl p-4 border border-border/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-muted rounded w-32"></div>
          <div className="h-8 bg-muted rounded w-24"></div>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 bg-muted rounded-full"></div>
          <div className="space-y-2 text-center">
            <div className="h-6 bg-muted rounded w-16 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-24 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  </SkeletonBase>
);

// ===== FULL ANALYTICS DASHBOARD SKELETON =====
export const AnalyticsDashboardSkeletonLoader: React.FC = () => (
  <div className="p-4 space-y-5 bg-background min-h-screen">
    <AnalyticsHeaderSkeletonLoader />
    <SearchSkeletonLoader />
    <ActiveCustomersSkeletonLoader />
    <SalesChartSkeletonLoader />
    <QuickAccessGridSkeletonLoader />
    <PaymentMethodsSkeletonLoader />
    <CartGaugeSkeletonLoader />
    <div className="h-20" aria-hidden="true" />
  </div>
); 