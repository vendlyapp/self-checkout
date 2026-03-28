'use client';

import { useParams, useRouter } from 'next/navigation';
import InvoiceTemplate from '@/components/invoice/InvoiceTemplate';
import { useResponsive } from '@/hooks';
import { useInvoice } from '@/hooks/queries/useInvoice';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '@/components/ui/Loader';
import { useEffect } from 'react';

export default function InvoicePage() {
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
      <div className="flex flex-col items-center justify-center min-h-dvh p-4">
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
                  onClick={() => router.push('/store/invoice')}
                  className="w-full bg-[#25D076] hover:bg-[#25D076]/90 text-white rounded-xl py-3 px-6 font-semibold transition-colors touch-target"
                >
                  Zurück zu Rechnungen
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
                onClick={() => router.push('/store/invoice')}
                className="bg-[#25D076] hover:bg-[#25D076]/90 text-white rounded-xl py-3 px-6 font-semibold transition-colors"
              >
                Zurück zu Rechnungen
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Si no hay invoice después de cargar, no renderizar nada
  if (!invoice) {
    return null;
  }

  return (
    <div className="invoice-print-container w-full h-full">
      {/* Mobile Layout */}
      {isMobile && (
        <div className="w-full">
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
