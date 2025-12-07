// app/(dashboard)/layout.tsx
"use client";

import { ReactNode } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AuthGuard } from "@/lib/guards/AuthGuard";
// El timeout de sesión se maneja globalmente en SessionTimeoutManager

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={['ADMIN', 'CUSTOMER']}>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AuthGuard>
  );
}
