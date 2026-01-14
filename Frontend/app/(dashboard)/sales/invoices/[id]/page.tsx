'use client';

import { useParams, useRouter } from 'next/navigation';
import InvoiceTemplate from '@/components/invoice/InvoiceTemplate';
import { useResponsive } from '@/hooks';
import { useInvoice } from '@/hooks/queries/useInvoice';
import { AlertCircle, ShoppingCart, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '@/components/ui/Loader';
import { useEffect } from 'react';
import Link from 'next/link';

export default function SalesInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const invoiceId = params.id as string;
  
  // Usar React Query hook para obtener invoice con cache
  const { data: invoice, isLoading, error: queryError, isFetching } = useInvoice(invoiceId);

  // Mostrar toast de error si hay error
  useEffect(() => {
    if (queryError) {
      const errorMessage = queryError instanceof Error ? queryError.message : 'Rechnung nicht gefunden';
      toast.error(errorMessage);
    }
  }, [queryError]);

  const loading = isLoading || isFetching;
  const error = queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null;

  if (loading && !invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader size="lg" />
        <p className="text-gray-600 font-medium mt-4">Rechnung wird geladen...</p>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="w-full h-full">
        {isMobile && (
          <div className="w-full p-4">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Rechnung nicht gefunden</h2>
                <p className="text-gray-600 mb-6">{error || 'Die angeforderte Rechnung konnte nicht gefunden werden.'}</p>
                <button
                  onClick={() => router.push('/sales/invoices')}
                  className="w-full bg-[#25D076] hover:bg-[#25D076]/90 text-white rounded-xl py-3 px-6 font-semibold transition-colors touch-target"
                >
                  Zurück zu Belegen
                </button>
              </div>
            </div>
          </div>
        )}
        {!isMobile && (
          <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Rechnung nicht gefunden</h2>
              <p className="text-gray-600 mb-6">{error || 'Die angeforderte Rechnung konnte nicht gefunden werden.'}</p>
              <button
                onClick={() => router.push('/sales/invoices')}
                className="bg-[#25D076] hover:bg-[#25D076]/90 text-white rounded-xl py-3 px-6 font-semibold transition-colors"
              >
                Zurück zu Belegen
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className="invoice-print-container w-full h-full">
      {/* Mobile Layout */}
      {isMobile && (
        <div className="w-full">
          {invoice.orderId && (
            <div className="p-4">
              <Link
                href={`/sales/orders/${invoice.orderId}`}
                className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl shadow-sm border border-[#25D076]/20 hover:border-[#25D076]/40 hover:shadow-md transition-all touch-target active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-[#25D076]/10 flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="w-5 h-5 text-[#25D076]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900">Zugehörige Bestellung</div>
                    <div className="text-xs text-gray-500 truncate">
                      Bestellung #{invoice.orderId.slice(-8).toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[#25D076] flex-shrink-0">
                  <span className="text-sm font-medium">Ansehen</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              </Link>
            </div>
          )}
          <InvoiceTemplate
            invoice={invoice}
            showActions={false}
            isMobile={true}
          />
        </div>
      )}

      {/* Desktop Layout */}
      {!isMobile && (
        <div className="p-6 max-w-4xl mx-auto">
          {invoice.orderId && (
            <div className="mb-6">
              <Link
                href={`/sales/orders/${invoice.orderId}`}
                className="flex items-center justify-between gap-4 p-4 bg-gradient-to-r from-[#25D076]/5 to-[#25D076]/10 rounded-xl border border-[#25D076]/20 hover:border-[#25D076]/40 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <ShoppingCart className="w-6 h-6 text-[#25D076]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-gray-900 mb-0.5">Zugehörige Bestellung</div>
                    <div className="text-sm text-gray-600">
                      Bestellung #{invoice.orderId.slice(-8).toUpperCase()} ansehen
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[#25D076] font-medium group-hover:gap-3 transition-all flex-shrink-0">
                  <span>Details</span>
                  <ExternalLink className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>
          )}
          <InvoiceTemplate
            invoice={invoice}
            showActions={true}
            isMobile={false}
          />
        </div>
      )}
    </div>
  );
}

