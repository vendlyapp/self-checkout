// app/(dashboard)/layout.tsx
"use client";

import { ReactNode } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AuthGuard } from "@/lib/guards/AuthGuard";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Configurar timeout de sesión de 30 minutos
  useSessionTimeout({
    enabled: true,
    onSessionExpired: () => {
      console.log('Sesión expirada por inactividad (30 minutos)');
    },
  });

  return (
    <AuthGuard allowedRoles={['ADMIN', 'CUSTOMER']}>
      <AdminLayout>
        {children}
      </AdminLayout>
    </AuthGuard>
  );
}
