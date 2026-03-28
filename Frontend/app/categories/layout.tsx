"use client";
// app/categories/layout.tsx
import { ReactNode } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useResponsive } from "@/hooks";
import { LoadingProductsModalProvider } from "@/lib/contexts/LoadingProductsModalContext";

function CategoriesLayoutContent({ children }: { children: ReactNode }) {
  const { isMobile } = useResponsive();

  return (
    <AdminLayout>
      <div className={`${isMobile ? "pb-0" : "pb-6"} min-w-0`}>{children}</div>
    </AdminLayout>
  );
}

export default function CategoriesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LoadingProductsModalProvider>
      <CategoriesLayoutContent>{children}</CategoriesLayoutContent>
    </LoadingProductsModalProvider>
  );
}

