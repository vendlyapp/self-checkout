"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/navigation/Header";
import FooterContinue from "@/components/dashboard/charge/FooterContinue";
import CartSummary from "@/components/dashboard/charge/CartSummary";
import PromoCodeInput from "@/components/dashboard/charge/PromoCodeInput";
import { useCartStore } from "@/lib/stores/cartStore";
import { usePromoCode } from "@/lib/hooks";

export default function ChargeLayout({ children }: { children: ReactNode }) {
  const { cartItems, getTotalItems } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();

  // Hook para manejar promociones
  const {
    promoCode,
    setPromoCode,
    promoApplied,
    discountAmount,
    promoError,
    setPromoError,
    subtotal,
    total,
    handleApplyPromo,
    handleRemovePromo,
  } = usePromoCode();

  // Cálculos del carrito
  const totalItems = getTotalItems();

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
    // Mostrar FooterContinue en cart y payment cuando hay items
    return (
      (pathname === "/charge/cart" || pathname === "/charge/payment") &&
      cartItems.length > 0
    );
  };

  const shouldShowCartSummary = () => {
    // Mostrar CartSummary en la página principal cuando hay items
    return pathname === "/charge" && cartItems.length > 0;
  };

  return (
    <div className="flex flex-col h-full w-full bg-background-cream">
      <Header />

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div>{children}</div>

        {/* PromoCodeInput solo en la página de cart */}
        {pathname === "/charge/cart" && cartItems.length > 0 && (
          <PromoCodeInput
            promoCode={promoCode}
            setPromoCode={setPromoCode}
            promoApplied={promoApplied}
            discountAmount={discountAmount}
            promoError={promoError}
            setPromoError={setPromoError}
            onApplyPromo={handleApplyPromo}
            onRemovePromo={handleRemovePromo}
          />
        )}
      </main>

      {/* FooterContinue para cart y payment */}
      {shouldShowFooterContinue() &&
        (pathname !== "/charge/payment" ? (
          <FooterContinue
            subtotal={subtotal}
            promoApplied={promoApplied}
            discountAmount={discountAmount}
            totalItems={totalItems}
            total={total}
            onContinue={handleContinue}
          />
        ) : (
          <></>
        ))}

      {/* CartSummary para la página principal */}
      {shouldShowCartSummary() && (
        <CartSummary items={cartItems} onContinue={handleContinue} />
      )}

      {/* Mostrar CartSummary vacío cuando no hay items en la página principal */}
      {pathname === "/charge" && cartItems.length === 0 && (
        <CartSummary items={[]} onContinue={handleContinueToProducts} />
      )}
    </div>
  );
}
