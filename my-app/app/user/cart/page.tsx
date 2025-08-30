"use client";

import { useCartStore } from "@/lib/stores/cartStore";
import HeaderNav from "@/components/navigation/HeaderNav";
import React, { useState } from "react";
import ProductCard from "@/components/dashboard/charge/ProductCard";
import { Product } from "@/components/dashboard/products_list/data/mockProducts";
import { ChevronRight, ShoppingCart, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatSwissPriceWithCHF } from "@/lib/utils";

export default function UserCartPage() {
  const router = useRouter();
  const {
    cartItems,
    updateQuantity,
    promoCode,
    promoApplied,
    discountAmount,
    applyPromoCode,
    removePromoCode
  } = useCartStore();

  // Estado local para manejo de errores
  const [promoError, setPromoError] = useState("");
  const [localPromoCode, setLocalPromoCode] = useState(promoCode);

  const handleUpdateQuantity = (product: Product, newQuantity: number) => {
    updateQuantity(product.id, newQuantity);
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
    <>
      <HeaderNav title="Warenkorb" />
      {/* Lista de productos */}
      <div className="flex-1 px-4 pt-4 pb-32 mt-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full mt-16">
            <ShoppingCart className="w-20 h-20 text-[#766B6A] mb-4" />
            <p className="text-2xl font-bold mb-2">Warenkorb ist leer</p>
            <p className="text-gray-500 mb-4">
              Fügen Sie Produkte hinzu um zu beginnen
            </p>
            <button
              className="bg-[#25D076] text-white px-4 py-2 font-semibold rounded-full mt-4 w-65 h-12 flex items-center justify-center gap-2"
              onClick={() => router.push("/user")}
            >
              Produkte anzeigen{" "}
              <ChevronRight className="w-5 h-5 text-white font-semibold" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(({ product, quantity }) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleUpdateQuantity}
                initialQuantity={quantity}
              />
            ))}

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
                        - {formatSwissPriceWithCHF(discountAmount)}
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
        )}
      </div>
    </>
  );
}
