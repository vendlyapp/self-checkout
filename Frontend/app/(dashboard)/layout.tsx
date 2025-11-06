// app/(dashboard)/layout.tsx
"use client";

import { ReactNode } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AuthGuard } from "@/lib/guards/AuthGuard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={['ADMIN', 'CUSTOMER']}>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AuthGuard>
  );
}
