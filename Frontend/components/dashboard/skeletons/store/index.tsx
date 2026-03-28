'use client';

import React from 'react';
import { SkeletonBase } from '../common/SkeletonBase';

// ===== STORE HEADER CARD SKELETON (mobile) =====
const StoreHeaderCardSkeleton: React.FC = () => (
  <SkeletonBase>
    <div className="bg-card rounded-2xl p-4 border border-border">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 bg-muted rounded-2xl animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <div className="h-5 bg-muted rounded w-32 animate-pulse" />
          <div className="h-3 bg-muted rounded w-48 animate-pulse" />
        </div>
      </div>
    </div>
  </SkeletonBase>
);

// ===== STORE DASHBOARD SKELETON — TABLET + DESKTOP =====
export const StoreDashboardSkeletonLoaderDesktop: React.FC = () => (
  <div className="hidden md:block min-w-0 bg-background-cream min-h-dvh">
    <div className="p-4 md:px-6 md:pt-10 md:pb-6 lg:p-6 xl:p-8 space-y-5 md:space-y-6 lg:space-y-8 xl:space-y-10 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-5 lg:gap-6">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-7 md:h-7 lg:h-8 bg-muted rounded-lg w-52 md:w-56 animate-pulse" />
          <div className="h-4 bg-muted rounded w-72 md:w-80 animate-pulse" />
        </div>
        <div className="w-full md:w-[200px] lg:w-[280px] h-9 lg:h-11 bg-muted rounded-full animate-pulse flex-shrink-0" />
      </div>

      {/* Mein Geschäft link card */}
      <div className="bg-card rounded-2xl p-4 lg:p-5 border border-border">
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="w-12 h-12 lg:w-14 lg:h-14 bg-muted rounded-xl animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-5 lg:h-6 bg-muted rounded w-36 animate-pulse" />
            <div className="h-4 bg-muted rounded w-64 animate-pulse" />
          </div>
          <div className="w-5 h-5 lg:w-6 lg:h-6 bg-muted rounded animate-pulse flex-shrink-0" />
        </div>
      </div>

      {/* StoreHeader + PlanCard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
        <div className="bg-card rounded-2xl p-4 lg:p-5 border border-border min-h-[140px]">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-muted rounded-2xl animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-muted rounded w-28 animate-pulse" />
              <div className="h-3 bg-muted rounded w-40 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 lg:p-5 border border-border min-h-[140px]">
          <div className="h-5 bg-muted rounded w-24 mb-3 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full animate-pulse" />
            <div className="h-4 bg-muted rounded w-[75%] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Dienste */}
      <div className="bg-card rounded-2xl p-4 lg:p-5 border border-border">
        <div className="h-5 lg:h-6 bg-muted rounded w-24 mb-3 lg:mb-4 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3 lg:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl p-3 lg:p-4 border border-border min-h-[88px] lg:min-h-[100px] flex flex-col justify-between">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-muted rounded-xl animate-pulse" />
              <div className="space-y-1.5 mt-2">
                <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                <div className="h-3 bg-muted rounded w-14 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Systemeinstellungen */}
      <div className="bg-card rounded-2xl p-4 lg:p-5 border border-border">
        <div className="h-5 lg:h-6 bg-muted rounded w-40 mb-3 lg:mb-4 animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="h-4 bg-muted rounded w-32 animate-pulse" />
              <div className="h-4 bg-muted rounded w-16 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Contact + System info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
        <div className="bg-card rounded-2xl p-4 lg:p-5 border border-border min-h-[120px]">
          <div className="h-5 bg-muted rounded w-28 mb-3 animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-full animate-pulse" />
            <div className="h-3 bg-muted rounded w-[80%] animate-pulse" />
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 lg:p-5 border border-border flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="h-4 bg-muted rounded w-36 mx-auto animate-pulse" />
            <div className="h-3 bg-muted rounded w-16 mx-auto animate-pulse" />
            <div className="h-3 bg-muted rounded w-20 mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ===== STORE DASHBOARD SKELETON — MOBILE =====
export const StoreDashboardSkeletonLoader: React.FC = () => (
  <div className="w-full min-h-dvh bg-background-cream">
    {/* Vista móvil */}
    <div className="block md:hidden min-w-0 p-4 space-y-6">
      <StoreHeaderCardSkeleton />
      <div className="w-full h-12 bg-muted rounded-full animate-pulse" />
      {/* Mein Geschäft card */}
      <div className="bg-card rounded-2xl p-4 border border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-muted rounded-xl animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-4 bg-muted rounded w-28 animate-pulse" />
            <div className="h-3 bg-muted rounded w-48 animate-pulse" />
          </div>
          <div className="w-5 h-5 bg-muted rounded animate-pulse flex-shrink-0" />
        </div>
      </div>
      {/* Plan card */}
      <div className="bg-card rounded-2xl p-4 border border-border">
        <div className="h-5 bg-muted rounded w-24 mb-3 animate-pulse" />
        <div className="h-4 bg-muted rounded w-full animate-pulse" />
        <div className="h-4 bg-muted rounded w-3/4 mt-2 animate-pulse" />
      </div>
      {/* Dienste */}
      <div>
        <div className="h-4 bg-muted rounded w-20 mb-3 animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-2xl p-3 border border-border min-h-[88px]">
              <div className="w-10 h-10 bg-muted rounded-xl animate-pulse" />
              <div className="mt-2 space-y-1.5">
                <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                <div className="h-3 bg-muted rounded w-12 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* System settings list */}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-border">
            <div className="h-4 bg-muted rounded w-24 animate-pulse" />
            <div className="h-4 bg-muted rounded w-12 animate-pulse" />
          </div>
        ))}
      </div>
      {/* Contact card */}
      <div className="bg-card rounded-2xl p-4 border border-border">
        <div className="h-5 bg-muted rounded w-24 mb-3 animate-pulse" />
        <div className="h-3 bg-muted rounded w-full animate-pulse" />
        <div className="h-3 bg-muted rounded w-4/5 mt-2 animate-pulse" />
      </div>
      <div className="h-4 bg-muted rounded w-48 mx-auto animate-pulse" />
    </div>
    {/* Vista tablet + desktop */}
    <StoreDashboardSkeletonLoaderDesktop />
  </div>
);
