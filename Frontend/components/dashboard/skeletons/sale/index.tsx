import React from 'react';
import { SkeletonBase } from '../common/SkeletonBase';

// ===== RECENT SALES SKELETON =====
export const RecentSalesSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-muted rounded w-32"></div>
        <div className="h-4 bg-muted rounded w-16"></div>
      </div>
      
      {/* Sales list */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="bg-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </div>
              </div>
              
              <div className="text-right space-y-2">
                <div className="h-4 bg-muted rounded w-16"></div>
                <div className="h-3 bg-muted rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </SkeletonBase>
);

// ===== SALE CARD SKELETON =====
export const SaleCardSkeletonLoader: React.FC = () => (
  <SkeletonBase>
    <div className="bg-card rounded-xl p-4 border border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-24"></div>
            <div className="h-3 bg-muted rounded w-20"></div>
          </div>
        </div>
        
        <div className="text-right space-y-2">
          <div className="h-4 bg-muted rounded w-16"></div>
          <div className="h-3 bg-muted rounded w-12"></div>
        </div>
      </div>
    </div>
  </SkeletonBase>
);

// ===== SALES SECTION SKELETON =====
export const SalesSectionSkeletonLoader: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="h-5 bg-muted rounded w-32"></div>
      <div className="h-4 bg-muted rounded w-16"></div>
    </div>
    
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, idx) => (
        <SaleCardSkeletonLoader key={idx} />
      ))}
    </div>
  </div>
); 