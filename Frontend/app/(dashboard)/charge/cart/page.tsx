'use client';

import { useCartStore } from '@/lib/stores/cartStore';
import ProductCard from '@/components/dashboard/charge/ProductCard';
import { useRouter } from 'next/navigation';
import HeaderNav from '@/components/navigation/HeaderNav';
import { ChargePageShell } from '@/components/dashboard/charge/ChargePageShell';
import ChargeEmptyCart from '@/components/dashboard/charge/ChargeEmptyCart';
import ChargePromoBlock from '@/components/dashboard/charge/ChargePromoBlock';
import { formatSwissPriceWithCHF } from '@/lib/utils';
import { usePromoLogic } from '@/hooks';

export default function CartPage() {
  const { cartItems, updateQuantity, clearCart, getTotalWithDiscount } = useCartStore();
  const router = useRouter();
  const { promoApplied, discountAmount } = usePromoLogic();

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const total = getTotalWithDiscount();
  const hasItems = cartItems.length > 0;

  return (
    <div className="w-full min-w-0 animate-fade-in">
      <div className="lg:hidden">
        <HeaderNav title="Warenkorb" showAddButton={false} closeDestination="/charge" />
      </div>

      <ChargePageShell bottomPad="pb-40 lg:pb-8">
        <div className="hidden lg:flex items-center justify-between gap-4 pt-6 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Warenkorb</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {cartItems.length}{' '}
              {cartItems.length === 1 ? 'Artikel' : 'Artikel'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/charge')}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 active:scale-[0.98]"
          >
            ← Produkte
          </button>
        </div>

        {!hasItems ? (
          <ChargeEmptyCart />
        ) : (
          <>
            <section className="lg:mt-0 mt-2">
              <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Artikel
              </h2>
              <ul className="mt-2 space-y-2">
                {cartItems.map(({ product }) => (
                  <li key={product.id}>
                    <ProductCard
                      product={product}
                      isCartView
                      onAddToCart={(_product, newQuantity) =>
                        handleQuantityChange(product.id, newQuantity)
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-5">
              <ChargePromoBlock />
            </section>

            <section className="mt-6 hidden lg:block rounded-2xl bg-white p-5 shadow-card">
              {promoApplied && (
                <div className="mb-3 flex justify-between text-sm text-[#3C7E44]">
                  <span>Rabatt</span>
                  <span className="tabular-nums">
                    −{formatSwissPriceWithCHF(discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex items-end justify-between border-t border-gray-100 pt-3">
                <span className="text-sm font-medium text-gray-500">Gesamtbetrag</span>
                <span className="text-2xl font-extrabold tabular-nums text-gray-900">
                  {formatSwissPriceWithCHF(total)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => router.push('/charge/payment')}
                className="mt-4 flex h-14 w-full items-center justify-center rounded-2xl bg-[#25D076] text-base font-bold text-white shadow-[0_4px_16px_rgba(37,208,118,0.35)] active:scale-[0.98]"
              >
                Zur Bezahlung
              </button>
              <button
                type="button"
                onClick={() => clearCart()}
                className="mt-2 w-full rounded-xl py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 active:scale-[0.98]"
              >
                Warenkorb leeren
              </button>
            </section>
          </>
        )}
      </ChargePageShell>
    </div>
  );
}
