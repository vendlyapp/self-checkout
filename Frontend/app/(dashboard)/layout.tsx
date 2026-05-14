// app/(dashboard)/layout.tsx
"use client";

import { ReactNode } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AuthGuard } from "@/lib/guards/AuthGuard";
import { StoreOnboardingGuard } from "@/lib/guards/StoreOnboardingGuard";
import { LoadingProductsModalProvider } from "@/lib/contexts/LoadingProductsModalContext";
import { SessionTimeoutManager } from "@/components/auth/SessionTimeoutManager";
import { StoreSettingsHeaderProvider } from "@/lib/contexts/StoreSettingsHeaderContext";
import { Toaster } from "sonner";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={['ADMIN']}>
      <StoreOnboardingGuard>
        <LoadingProductsModalProvider>
          <StoreSettingsHeaderProvider>
            <SessionTimeoutManager />
            <AdminLayout>
              <div className="min-w-0">{children}</div>
            </AdminLayout>
            <Toaster
              position="top-center"
              richColors
              offset={16}
              toastOptions={{
                classNames: {
                  toast: '!rounded-2xl !shadow-card !border-0 !text-sm !font-medium',
                  title: '!font-semibold',
                  description: '!text-xs !opacity-80',
                },
              }}
            />
          </StoreSettingsHeaderProvider>
        </LoadingProductsModalProvider>
      </StoreOnboardingGuard>
    </AuthGuard>
  );
}
