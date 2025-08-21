"use client";

import { useCartStore } from "@/lib/stores/cartStore";
import ProductCard from "@/components/dashboard/charge/ProductCard";
import { useRouter } from "next/navigation";
import HeaderNav from "@/components/navigation/HeaderNav";

export default function CartPage() {
  const { cartItems, updateQuantity } = useCartStore();
  const router = useRouter();

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
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
        </div>
      </main>
    </div>
  );
}
