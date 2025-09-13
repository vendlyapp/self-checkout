"use client";

import { ReactNode, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/navigation/Header";
import FooterContinue from "@/components/dashboard/charge/FooterContinue";
import CartSummary from "@/components/dashboard/charge/CartSummary";
import { useScrollReset } from "@/lib/hooks";

import { useCartStore } from "@/lib/stores/cartStore";

// Contexto para el modal de filtros
interface FilterModalContextType {
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: (open: boolean) => void;
}

const FilterModalContext = createContext<FilterModalContextType | undefined>(
  undefined
);

export const useFilterModal = () => {
  const context = useContext(FilterModalContext);
  if (!context) {
    throw new Error("useFilterModal must be used within FilterModalProvider");
  }
  return context;
};

export default function ChargeLayout({ children }: { children: ReactNode }) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const { scrollContainerRef } = useScrollReset();

  const {
    cartItems,
    getTotalItems,
    getSubtotal,
    getTotalWithDiscount,
    promoApplied,
    discountAmount,
    promoCode,
  } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();

  // Cálculos del carrito
  const totalItems = getTotalItems();
  const subtotal = getSubtotal();
  const total = getTotalWithDiscount();

  // Navegación inteligente basada en la ruta actual
  const handleContinue = () => {
    if (pathname === "/charge") {
      // Si estamos en la página principal, ir al carrito
      router.push("/charge/cart");
    } else if (pathname === "/charge/cart") {
      // Si estamos en el carrito, ir al pago
      router.push("/charge/payment");
    } else {
      // Por defecto, ir al pago
      router.push("/charge/payment");
    }
  };

  // Navegación para el CartSummary (cuando no hay items)
  const handleContinueToProducts = () => {
    router.push("/charge");
  };

  // Determinar qué componente mostrar basado en la ruta y el estado del carrito
  const shouldShowFooterContinue = () => {
    // Mostrar FooterContinue SOLO en cart cuando hay items (NO en payment)
    return pathname === "/charge/cart" && cartItems.length > 0;
  };

  const shouldShowCartSummary = () => {
    // Mostrar CartSummary en la página principal cuando hay items
    return pathname === "/charge" && cartItems.length > 0;
  };

  return (
    <FilterModalContext.Provider
      value={{ isFilterModalOpen, setIsFilterModalOpen }}
    >
      <div className="flex flex-col h-full w-full bg-background-cream">
        <Header />

        <main
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden relative ios-scroll-fix"
        >
          <div>{children}</div>
        </main>

        {/* FooterContinue para cart y payment */}
        {shouldShowFooterContinue() && (
          <FooterContinue
            subtotal={subtotal}
            promoApplied={promoApplied}
            discountAmount={discountAmount}
            totalItems={totalItems}
            total={total}
            onContinue={handleContinue}
            promoCode={promoCode}
          />
        )}

        {/* CartSummary para la página principal */}
        {shouldShowCartSummary() && (
          <CartSummary
            items={cartItems}
            onContinue={handleContinue}
            isVisible={!isFilterModalOpen}
          />
        )}

        {/* Mostrar CartSummary vacío cuando no hay items en la página principal */}
        {pathname === "/charge" && cartItems.length === 0 && (
          <CartSummary
            items={[]}
            onContinue={handleContinueToProducts}
            isVisible={!isFilterModalOpen}
          />
        )}
      </div>
    </FilterModalContext.Provider>
  );
}
