'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cartStore';
import { CreditCard, Smartphone, QrCode, Coins } from 'lucide-react';
import HeaderNav from '@/components/navigation/HeaderNav';
import PaymentModal from '@/components/dashboard/charge/PaymentModal';
import { useMyStore } from '@/hooks/queries/useMyStore';
import { usePaymentMethods } from '@/hooks/queries/usePaymentMethods';
import { useMyStoreInitialLoading, isInitialQueryLoading } from '@/hooks/queries/useStoreQueryScope';
import { Loader } from '@/components/ui/Loader';
import { ChargePageShell } from '@/components/dashboard/charge/ChargePageShell';
import ChargePaymentTotal from '@/components/dashboard/charge/ChargePaymentTotal';
import ChargePaymentMethods, {
  type ChargePaymentMethodItem,
} from '@/components/dashboard/charge/ChargePaymentMethods';
import ChargeSecurityNote from '@/components/dashboard/charge/ChargeSecurityNote';

const PAYMENT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  twint: Smartphone,
  'qr-rechnung': QrCode,
  bargeld: Coins,
  'debit-credit': CreditCard,
  postfinance: CreditCard,
  klarna: CreditCard,
};

export default function PaymentPage() {
  const {
    clearCart,
    getTotalItems,
    getSubtotal,
    getTotalWithDiscount,
    promoApplied,
  } = useCartStore();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const mountedRef = useRef(false);

  const { data: store, isFetched: storeFetched, isFetching: storeFetching } = useMyStore();
  const storeLoading = useMyStoreInitialLoading(store, storeFetched, storeFetching);
  const {
    data: paymentMethodsData,
    isFetched: methodsFetched,
    isFetching: methodsFetching,
  } = usePaymentMethods({
    storeId: store?.id || '',
    activeOnly: true,
  });
  const paymentMethodsLoading =
    isInitialQueryLoading(methodsFetched, methodsFetching) &&
    !(paymentMethodsData?.length);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      setMounted(true);
    }
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;
  const subtotal = mounted ? getSubtotal() : 0;
  const total = mounted ? getTotalWithDiscount() : 0;

  const paymentMethods: ChargePaymentMethodItem[] =
    paymentMethodsData?.map((method) => ({
      code: method.code,
      label: method.displayName,
      icon: PAYMENT_ICON_MAP[method.code] || CreditCard,
      bgColor: method.bgColor || '#6E7996',
    })) ?? [];

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setSelectedPaymentMethod('');
    router.push('/charge');
  };

  if (!mounted || ((storeLoading && !store) || paymentMethodsLoading)) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center animate-fade-in">
        <div className="text-center">
          <Loader size="lg" className="mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900">Wird geladen…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-w-0 animate-fade-in">
        <div className="lg:hidden">
          <HeaderNav
            title="Bezahlung"
            showAddButton={false}
            closeDestination="/charge/cart"
          />
        </div>

        <ChargePageShell bottomPad="pb-8">
          <div className="hidden lg:flex items-center justify-between gap-4 pt-6 pb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bezahlung</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Zahlungsart wählen
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/charge/cart')}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 active:scale-[0.98]"
            >
              ← Warenkorb
            </button>
          </div>

          <div className="mt-2 lg:mt-4 space-y-5">
            <ChargePaymentTotal
              storeName={store?.name || 'Geschäft'}
              subtotal={subtotal}
              total={total}
              totalItems={totalItems}
              promoApplied={promoApplied}
            />

            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                Zahlungsart
              </h2>
              <ChargePaymentMethods
                methods={paymentMethods}
                onSelect={handlePaymentMethodSelect}
              />
            </div>

            <ChargeSecurityNote />
          </div>
        </ChargePageShell>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedMethod={selectedPaymentMethod}
        totalAmount={total}
        storeId={store?.id}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}
