"use client";
// app/products_list/layout.tsx
import { ReactNode } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useResponsive } from "@/hooks";
import {
  ProductsListProvider,
} from "@/components/dashboard/products_list/ProductsListContext";
import { LoadingProductsModalProvider } from "@/lib/contexts/LoadingProductsModalContext";

function ProductsListLayoutContent({ children }: { children: ReactNode }) {
  const { isMobile } = useResponsive();

  return (
    <AdminLayout>
      <div className={`${isMobile ? "pb-24" : "pb-6"} gpu-accelerated`}>{children}</div>
    </AdminLayout>
  );
}

export default function ProductsListLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LoadingProductsModalProvider>
      <ProductsListProvider>
        <ProductsListLayoutContent>{children}</ProductsListLayoutContent>
      </ProductsListProvider>
    </LoadingProductsModalProvider>
  );
}
