"use client";
// app/products_list/layout.tsx
import { ReactNode } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useResponsive } from "@/lib/hooks";
import {
  ProductsListProvider,
} from "@/components/dashboard/products_list/ProductsListContext";

function ProductsListLayoutContent({ children }: { children: ReactNode }) {
  const { isMobile } = useResponsive();

  return (
    <AdminLayout>
      <div className={isMobile ? "pb-24" : "pb-6"}>{children}</div>
    </AdminLayout>
  );
}

export default function ProductsListLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProductsListProvider>
      <ProductsListLayoutContent>{children}</ProductsListLayoutContent>
    </ProductsListProvider>
  );
}
