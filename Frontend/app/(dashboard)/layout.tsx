// app/(dashboard)/layout.tsx
"use client";

import { ReactNode } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AuthGuard } from "@/lib/guards/AuthGuard";
import { StoreOnboardingGuard } from "@/lib/guards/StoreOnboardingGuard";
import { LoadingProductsModalProvider } from "@/lib/contexts/LoadingProductsModalContext";
import { StoreSettingsHeaderProvider } from "@/lib/contexts/StoreSettingsHeaderContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={['ADMIN', 'CUSTOMER']}>
      <StoreOnboardingGuard>
        <LoadingProductsModalProvider>
          <StoreSettingsHeaderProvider>
            <AdminLayout>
              <div className="min-w-0">{children}</div>
            </AdminLayout>
          </StoreSettingsHeaderProvider>
        </LoadingProductsModalProvider>
      </StoreOnboardingGuard>
    </AuthGuard>
  );
}
