"use client";

import { useCartStore } from "@/lib/stores/cartStore";
import ProductCard from "@/components/dashboard/charge/ProductCard";
import { useRouter } from "next/navigation";
import HeaderNav from "@/components/navigation/HeaderNav";
import { X } from "lucide-react";
import { formatSwissPriceWithCHF } from "@/lib/utils";
import { usePromoLogic } from "@/hooks";

export default function CartPage() {
  const { cartItems, updateQuantity } = useCartStore();
  const router = useRouter();
  const {
    promoApplied,
    discountAmount,
    promoError,
    localPromoCode,
    setLocalPromoCode,
    handleApplyPromo,
    handleRemovePromo,
  } = usePromoLogic();

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  return (
    <div className="w-full animate-page-enter gpu-accelerated">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        {/* HeaderNav específico para el carrito */}
        <div className="animate-slide-in-right">
          <HeaderNav title="Warenkorb" showAddButton={false} />
        </div>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto px-2 pt-2">
            <div className="space-y-3 pt-10 animate-fade-in-scale">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 animate-scale-in">
                  <div className="text-center text-gray-500 transition-interactive">
                    Dein Warenkorb ist leer.
                  </div>
                  <button
                    onClick={() => router.push("/charge")}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-full px-6 py-3 text-[17px] mt-2 
                             transition-interactive gpu-accelerated shadow hover:shadow-lg hover:scale-105 active:scale-95"
                    aria-label="Zurück zu den Produkten"
                  >
                    Zurück zu den Produkten
                  </button>
                </div>
              ) : (
                cartItems.map(({ product, quantity }, index) => (
                  <div 
                    className="space-y-2 pl-4 pr-4 animate-slide-up-fade gpu-accelerated" 
                    key={product.id}
                    style={{
                      animationDelay: `${index * 0.05}s`,
                      animationFillMode: 'both'
                    }}
                  >
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
              <div className="mt-6 px-2 pl-4 pr-4 pb-24 animate-slide-up-fade">
                <label
                  htmlFor="promo"
                  className="text-[#25D076] text-[15px] font-semibold transition-interactive"
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
                        className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg px-4 py-2 text-[15px] 
                                 transition-interactive gpu-accelerated hover:scale-105 active:scale-95"
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
        </main>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between animate-stagger-1">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 transition-interactive">Warenkorb</h1>
              <p className="text-gray-600 mt-1 transition-interactive">{cartItems.length} Artikel im Warenkorb</p>
            </div>
            <button
              onClick={() => router.push("/charge")}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 
                       transition-interactive gpu-accelerated hover:bg-gray-100 rounded-lg active:scale-95"
            >
              <span>← Zurück zu Produkten</span>
            </button>
          </div>

          {/* Cart Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-stagger-2">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-fade-in-scale">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 transition-interactive">Artikel</h2>
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 animate-scale-in">
                    <div className="text-center text-gray-500 text-lg transition-interactive">
                      Dein Warenkorb ist leer.
                    </div>
                    <button
                      onClick={() => router.push("/charge")}
                      className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl px-6 py-3 text-lg 
                               transition-interactive gpu-accelerated shadow hover:shadow-lg hover:scale-105 active:scale-95"
                      aria-label="Zurück zu den Produkten"
                    >
                      Produkte hinzufügen
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map(({ product, quantity }, index) => (
                      <div 
                        key={product.id}
                        className="animate-slide-up-fade gpu-accelerated"
                        style={{
                          animationDelay: `${index * 0.05}s`,
                          animationFillMode: 'both'
                        }}
                      >
                        <ProductCard
                          product={product}
                          initialQuantity={quantity}
                          onAddToCart={(_product, newQuantity) =>
                            handleQuantityChange(product.id, newQuantity)
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-6 animate-stagger-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 transition-interactive">Zusammenfassung</h2>

                {/* Promo Code Section */}
                <div className="mb-6">
                  <label
                    htmlFor="promo-desktop"
                    className="text-[#25D076] text-sm font-semibold block mb-2"
                  >
                    Promo Code?
                  </label>
                  {!promoApplied ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          id="promo-desktop"
                          type="text"
                          autoCapitalize="characters"
                          maxLength={10}
                          value={localPromoCode}
                          onChange={(e) => {
                            setLocalPromoCode(e.target.value.toUpperCase());
                          }}
                          placeholder="Code eingeben"
                          className="flex-1 rounded-lg border-2 uppercase bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          aria-label="Promo Code"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleApplyPromo();
                          }}
                        />
                        <button
                          onClick={handleApplyPromo}
                          className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
                          aria-label="Promo anwenden"
                        >
                          Anwenden
                        </button>
                      </div>
                      {promoError && (
                        <span className="text-red-600 text-xs font-medium">
                          {promoError}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center bg-[#F2FDF5] rounded-xl px-4 py-3 shadow-sm border border-brand-200">
                      <div className="flex-1">
                        <div className="text-[#3C7E44] font-semibold text-sm leading-tight">
                          10% Rabatt auf Bio-Produkte
                        </div>
                        <div className="text-[#3C7E44] text-sm">
                          - {formatSwissPriceWithCHF(discountAmount)}
                        </div>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="ml-2 p-1 rounded-full hover:bg-brand-200 focus:outline-none"
                        aria-label="Promo entfernen"
                        tabIndex={0}
                      >
                        <X className="w-4 h-4 text-brand-700" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatSwissPriceWithCHF(cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0))}</span>
                  </div>
                  <button
                    onClick={() => router.push("/charge/payment")}
                    className="w-full mt-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl px-6 py-3 text-lg 
                             transition-interactive gpu-accelerated shadow hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={cartItems.length === 0}
                  >
                    Zur Kasse
                  </button>

                  {/* Botón Leeren */}
                  <button
                    onClick={() => {
                      const { clearCart } = useCartStore.getState();
                      clearCart();
                    }}
                    className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl px-6 py-3 text-lg 
                             transition-interactive gpu-accelerated shadow hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    Warenkorb leeren
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
