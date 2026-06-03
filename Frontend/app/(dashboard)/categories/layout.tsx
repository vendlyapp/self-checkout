"use client";
// app/categories/layout.tsx
import { ReactNode } from "react";
import { useResponsive } from "@/hooks";
import { LoadingProductsModalProvider } from "@/lib/contexts/LoadingProductsModalContext";

function CategoriesLayoutContent({ children }: { children: ReactNode }) {
  const { isMobile } = useResponsive();

  return (
    <div className={`${isMobile ? "pb-0" : "pb-6"} min-w-0`}>{children}</div>
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

