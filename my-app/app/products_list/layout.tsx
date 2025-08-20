"use client";
// app/products_list/layout.tsx
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import FooterAddProduct from "@/components/dashboard/products_list/FooterAddProduct";
import {
  ProductsListProvider,
  useProductsList,
} from "@/components/dashboard/products_list/ProductsListContext";
import { useRouter } from "next/navigation";
import Header from "@/components/navigation/Header";

function ProductsListLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { totalProducts, filteredProducts, hasActiveFilters, isLoading } =
    useProductsList();

  const handleAddProduct = () => {
    if (pathname === "/products_list/add_product") {
      // Si estamos en la página de agregar producto, ejecutar la función de guardado
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== "undefined" && (window as any).saveProduct) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).saveProduct();
      }
    } else {
      // Si estamos en la lista, navegamos a agregar producto
      router.push("/products_list/add_product");
    }
  };

  // Determinar el texto y comportamiento del botón según la ruta
  const isAddProductPage = pathname === "/products_list/add_product";
  const buttonText = isAddProductPage ? "Produkt speichern" : "Neues Produkt";

  return (
    <div className="flex flex-col h-full w-full bg-background-cream">
      <Header />

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="min-h-full pb-24">{children}</div>
      </main>

      {/* Footer siempre visible */}
      <FooterAddProduct
        onAddProduct={handleAddProduct}
        totalProducts={totalProducts}
        isLoading={isLoading}
        filteredProducts={filteredProducts}
        hasActiveFilters={hasActiveFilters}
        isAddProductPage={isAddProductPage}
        buttonText={buttonText}
      />
    </div>
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
