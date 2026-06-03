'use client';

import { useRouter } from 'next/navigation';
import InvoiceTemplate from '@/components/invoice/InvoiceTemplate';
import { useResponsive } from '@/hooks';
import { useInvoice } from '@/hooks/queries/useInvoice';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLoadingState } from '@/components/ui/DashboardLoadingState';
import { useEffect } from 'react';
import { lightFeedback } from '@/lib/utils/safeFeedback';
import { devError } from '@/lib/utils/logger';
import { InvoiceService } from '@/lib/services/invoiceService';
import { isInitialQueryLoading } from '@/hooks/queries/useStoreQueryScope';

interface SalesInvoiceDetailClientProps {
  invoiceId: string;
}

export default function SalesInvoiceDetailClient({
  invoiceId,
}: SalesInvoiceDetailClientProps) {
  const router = useRouter();
  const { isMobile } = useResponsive();

  const {
    data: invoice,
    isFetched,
    isFetching,
    error: queryError,
  } = useInvoice(invoiceId);

  useEffect(() => {
    if (queryError) {
      const msg =
        queryError instanceof Error ? queryError.message : 'Rechnung nicht gefunden';
      toast.error(msg);
    }
  }, [queryError]);

  const loading = isInitialQueryLoading(isFetched, isFetching);
  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? String(queryError)
        : null;

  if (loading && !invoice) {
    return <DashboardLoadingState mode="page" message="Rechnung wird geladen…" />;
  }

  if (error && !invoice) {
    return (
      <div className={`w-full ${isMobile ? 'p-4' : 'p-6 max-w-4xl mx-auto'}`}>
        <div
          className={`flex items-center justify-center ${isMobile ? 'min-h-[60vh]' : 'min-h-[40vh]'}`}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
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
              className="inline-flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl py-3 px-6 transition-colors active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zu Belegen
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice && !loading && !error) {
    return <DashboardLoadingState mode="page" message="Rechnung wird geladen…" />;
  }

  if (!invoice) return null;

  const handlePrint = () => {
    lightFeedback();
    window.print();
  };

  const handleDownload = async () => {
    lightFeedback();
    try {
      const filename = invoice.invoiceNumber
        ? `Rechnung-${invoice.invoiceNumber}`
        : `Rechnung-${invoice.id.slice(0, 8)}`;
      await InvoiceService.downloadPDF(invoice.id, filename);
    } catch (err) {
      devError('Error downloading PDF:', err);
      toast.error('Fehler beim Herunterladen der Rechnung');
    }
  };

  return (
    <div className="invoice-print-container w-full h-full">
      <div className={isMobile ? 'px-4 py-4' : 'px-6 py-6 max-w-4xl mx-auto'}>
        <InvoiceTemplate
          invoice={invoice}
          showActions={!isMobile}
          isMobile={isMobile}
          onPrint={handlePrint}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
}
