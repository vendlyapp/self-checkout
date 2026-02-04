// app/(dashboard)/layout.tsx
"use client";

import { ReactNode } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AuthGuard } from "@/lib/guards/AuthGuard";
import { StoreOnboardingGuard } from "@/lib/guards/StoreOnboardingGuard";
import { LoadingProductsModalProvider } from "@/lib/contexts/LoadingProductsModalContext";
// El timeout de sesión se maneja globalmente en SessionTimeoutManager

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={['ADMIN', 'CUSTOMER']}>
      <StoreOnboardingGuard>
        <LoadingProductsModalProvider>
          <AdminLayout>
            <div className="gpu-accelerated">
              {children}
            </div>
          </AdminLayout>
        </LoadingProductsModalProvider>
      </StoreOnboardingGuard>
    </AuthGuard>
  );
}
