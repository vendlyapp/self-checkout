"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/stores/cartStore";
import ProductCard from "@/components/dashboard/charge/ProductCard";
import { useRouter } from "next/navigation";
import HeaderNav from "@/components/navigation/HeaderNav";
import { X } from "lucide-react";

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    promoCode,
    promoApplied,
    discountAmount,
    applyPromoCode,
    removePromoCode,
  } = useCartStore();
  const router = useRouter();

  // Estado local para manejo de errores
  const [promoError, setPromoError] = useState("");
  const [localPromoCode, setLocalPromoCode] = useState(promoCode);

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const handleApplyPromo = () => {
    if (localPromoCode.trim().toUpperCase() === "CHECK01") {
      applyPromoCode(localPromoCode);
      setPromoError("");
    } else {
      setPromoError("Der Code existiert nicht oder ist ungültig.");
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setLocalPromoCode("");
    setPromoError("");
  };

  return (
    <div>
      {/* HeaderNav específico para el carrito */}
      <HeaderNav title="Warenkorb" showAddButton={false} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto px-2 pt-2">
          <div className="space-y-3 pt-10">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="text-center text-gray-500">
                  Dein Warenkorb ist leer.
                </div>
                <button
                  onClick={() => router.push("/charge")}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-full px-6 py-3 text-[17px] mt-2 transition-colors shadow"
                  aria-label="Zurück zu den Produkten"
                >
                  Zurück zu den Produkten
                </button>
              </div>
            ) : (
              cartItems.map(({ product, quantity }) => (
                <div className="space-y-2 pl-4 pr-4" key={product.id}>
                  <ProductCard
                    key={product.id}
                    product={product}
                    initialQuantity={quantity}
                    onAddToCart={(_product, newQuantity) =>
                      handleQuantityChange(product.id, newQuantity)
                    }
                  />
                </div>
              ))
            )}
          </div>

          {/* Promo Code - Solo mostrar si hay items en el carrito */}
          {cartItems.length > 0 && (
            <div className="mt-6 px-2 pl-4 pr-4 pb-24">
              <label
                htmlFor="promo"
                className="text-[#25D076] text-[15px] font-semibold"
              >
                Promo Code?
              </label>
              {!promoApplied ? (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex gap-2">
                    <input
                      id="promo"
                      type="text"
                      autoCapitalize="characters"
                      maxLength={10}
                      value={localPromoCode}
                      onChange={(e) => {
                        setLocalPromoCode(e.target.value.toUpperCase());
                        setPromoError("");
                      }}
                      placeholder="Gib deinen Code ein"
                      className="block w-full rounded-lg border-2 uppercase bg-white px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-500"
                      aria-label="Promo Code"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleApplyPromo();
                      }}
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg px-4 py-2 text-[15px] transition-colors"
                      aria-label="Promo anwenden"
                    >
                      Anwenden
                    </button>
                  </div>
                  {promoError && (
                    <span className="text-red-600 text-[14px] font-medium mt-1">
                      {promoError}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center bg-[#F2FDF5] rounded-xl px-4 py-3 mt-2 mb-2 shadow-sm border border-brand-200">
                  <div className="flex-1">
                    <div className="text-[#3C7E44] font-semibold text-[15px] leading-tight">
                      10% Rabatt auf Bio-Produkte
                    </div>
                    <div className="text-[#3C7E44] text-[15px]">
                      - CHF {discountAmount.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="ml-2 p-1 rounded-full hover:bg-brand-200 focus:outline-none"
                    aria-label="Promo entfernen"
                    tabIndex={0}
                  >
                    <X className="w-5 h-5 text-brand-700" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
