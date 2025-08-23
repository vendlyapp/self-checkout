"use client";

import { useCartStore } from "@/lib/stores/cartStore";
import HeaderNav from "@/components/navigation/HeaderNav";
import React from "react";
import ProductCard from "@/components/dashboard/charge/ProductCard";
import { Product } from "@/components/dashboard/products_list/data/mockProducts";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserCartPage() {
  const router = useRouter();
  const { cartItems, updateQuantity } = useCartStore();

  const handleUpdateQuantity = (product: Product, newQuantity: number) => {
    updateQuantity(product.id, newQuantity);
  };

  return (
    <div className="flex flex-col min-h-full bg-background-cream">
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
          <div className="space-y-4 pb-48">
            {cartItems.map(({ product, quantity }) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleUpdateQuantity}
                initialQuantity={quantity}
              />
            ))}
            {/* Promo code */}
            <div className="text-[#25D076] text-sm font-semibold mt-2 cursor-pointer">
              Promo Code?
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
