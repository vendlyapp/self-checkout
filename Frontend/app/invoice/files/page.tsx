'use client';

import { useParams, useRouter } from 'next/navigation';
import InvoiceTemplate from '@/components/invoice/InvoiceTemplate';
import { useResponsive } from '@/hooks';
import { useInvoice } from '@/hooks/queries/useInvoice';
import { AlertCircle, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '@/components/ui/Loader';
import { useEffect } from 'react';
import Link from 'next/link';

export default function SalesInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const invoiceId = params.id as string;

  const {
    data: invoice,
    isLoading,
    error: queryError,
    isFetching,
  } = useInvoice(invoiceId);

  useEffect(() => {
    if (queryError) {
      const msg =
        queryError instanceof Error
          ? queryError.message
          : 'Rechnung nicht gefunden';
      toast.error(msg);
    }
  }, [queryError]);

  const loading = isLoading || isFetching;
  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
      ? String(queryError)
      : null;

  // ─── Loading State ─────────────────────────────────────────────────────────

  if (loading && !invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Loader size="lg" />
        <p className="text-sm text-gray-500 font-medium mt-4 tracking-wide">
          Rechnung wird geladen…
        </p>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────────────────────

  if (error && !invoice) {
    return (
      <div className={`w-full ${isMobile ? 'p-4' : 'p-6 max-w-4xl mx-auto'}`}>
        <div
          className={`
            flex items-center justify-center
            ${isMobile ? 'min-h-[60vh]' : 'min-h-[40vh]'}
          `}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
            {/* Error icon */}
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 ring-1 ring-red-100">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>

            <h2
              className="text-xl font-semibold text-gray-900 mb-2"
              style={{ letterSpacing: '-0.02em' }}
            >
              Rechnung nicht gefunden
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              {error || 'Die angeforderte Rechnung konnte nicht gefunden werden.'}
            </p>

            <button
              onClick={() => router.push('/sales/invoices')}
              className="
                inline-flex items-center justify-center gap-2
                w-full bg-gray-900 hover:bg-gray-800
                text-white text-sm font-semibold
                rounded-xl py-3 px-6
                transition-colors active:scale-[0.98]
              "
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zu Belegen
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  // ─── Invoice View ──────────────────────────────────────────────────────────

  return (
    <div className="invoice-print-container w-full h-full">
      <div className={isMobile ? 'w-full' : 'p-6 max-w-4xl mx-auto'}>
        {/* Order link banner */}
        {invoice.orderId && (
          <div className={isMobile ? 'px-4 pt-3 pb-1' : 'mb-5'}>
            <Link
              href={`/sales/orders/${invoice.orderId}`}
              className="
                group flex items-center justify-between gap-3
                p-3 md:p-4
                bg-gray-50 hover:bg-gray-100
                rounded-xl border border-gray-200 hover:border-gray-300
                transition-all duration-150
                active:scale-[0.99]
              "
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-white shadow-sm border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs md:text-sm font-semibold text-gray-800">
                    Zugehörige Bestellung
                  </div>
                  <div className="text-[11px] text-gray-400 truncate font-mono">
                    #{invoice.orderId.slice(-8).toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-400 group-hover:text-gray-700 group-hover:gap-2 transition-all flex-shrink-0">
                <span className="text-xs font-medium hidden sm:inline">Ansehen</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        )}

        {/* Invoice Template */}
        <InvoiceTemplate
          invoice={invoice}
          showActions={!isMobile}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}
