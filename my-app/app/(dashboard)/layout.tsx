// app/(dashboard)/layout.tsx
"use client";

import { ReactNode } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}
