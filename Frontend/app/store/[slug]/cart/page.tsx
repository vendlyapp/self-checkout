'use client'

import { useCartStore } from "@/lib/stores/cartStore";
import React, { useState } from "react";
import ProductCard from "@/components/dashboard/charge/ProductCard";
import { Product } from "@/components/dashboard/products_list/data/mockProducts";
import { ChevronRight, ShoppingCart, X } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { formatSwissPriceWithCHF } from "@/lib/utils";
import { usePromoLogic } from "@/hooks";

export default function StoreCartPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { cartItems, updateQuantity } = useCartStore();
  const [showPromoInput, setShowPromoInput] = useState(false);

  const {
    promoApplied,
    discountAmount,
    promoError,
    localPromoCode,
    setLocalPromoCode,
    handleApplyPromo,
    handleRemovePromo,
  } = usePromoLogic();
  
  const { promoInfo } = useCartStore();

  const handleUpdateQuantity = (product: Product, newQuantity: number) => {
    updateQuantity(product.id, newQuantity);
  };

  return (
    <>
      {/* Lista de productos */}
      <div className="flex-1 px-4 pt-4 pb-48 mt-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 -mt-20">
            <div className="text-center max-w-md">
              {/* Icono de carrito vacío */}
              <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                <div className="w-24 h-24 bg-[#25D076]/10 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-12 h-12 text-[#25D076]" strokeWidth={1.5} />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-[#373F49] mb-3">
                Warenkorb ist leer
              </h2>
              <p className="text-lg text-[#6E7996] mb-8">
                Fügen Sie Produkte hinzu, um fortzufahren
              </p>
              
              {/* Botón para volver a la tienda */}
              {slug && (
                <button
                  onClick={() => router.push(`/store/${slug}`)}
                  className="inline-flex items-center gap-2 bg-[#25D076] hover:bg-[#20B865] active:bg-[#1EA55A] text-white font-semibold rounded-xl px-6 py-3 transition-ios shadow-lg shadow-[#25D076]/20 active:scale-[0.98] touch-target"
                >
                  <ChevronRight className="w-5 h-5" />
                  Produkte anzeigen
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(({ product }) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleUpdateQuantity}
                isCartView={true}
              />
            ))}

            {/* Promo Code - Solo mostrar si hay items en el carrito */}
            {cartItems.length > 0 && (
              <div className="mt-6 px-2 pl-4 pr-4 pb-24">
                {!promoApplied ? (
                  <>
                    <button
                      onClick={() => setShowPromoInput(!showPromoInput)}
                      className="text-[#25D076] text-[15px] font-semibold hover:underline cursor-pointer"
                    >
                      Promo Code?
                    </button>
                    {showPromoInput && (
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
                            }}
                            placeholder="Gib deinen Code ein"
                            className="block w-full rounded-lg border-2 uppercase bg-white px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-500"
                            aria-label="Promo Code"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleApplyPromo();
                            }}
                            autoFocus
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
                    )}
                  </>
                ) : (
                  <div className="flex items-center bg-[#F2FDF5] rounded-xl px-4 py-3 mt-2 mb-2 shadow-sm border border-brand-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-[#3C7E44] font-semibold text-[15px] leading-tight">
                          Code: {localPromoCode}
                        </div>
                      </div>
                      <div className="text-[#3C7E44] text-[14px] leading-tight">
                        {promoInfo?.discountType === 'percentage' 
                          ? `${Math.round(promoInfo.discountValue)}% Rabatt auf deine Produkte`
                          : promoInfo?.description 
                          ? promoInfo.description
                          : 'Rabatt'
                        } - {formatSwissPriceWithCHF(discountAmount)}
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


