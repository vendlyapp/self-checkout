'use client';

import { useParams, useRouter } from 'next/navigation';
import InvoiceTemplate from '@/components/invoice/InvoiceTemplate';
import { useResponsive } from '@/hooks';
import { useInvoice } from '@/hooks/queries/useInvoice';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '@/components/ui/Loader';
import { useEffect } from 'react';
import { lightFeedback } from '@/lib/utils/safeFeedback';
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

  // ─── Print and Download Handlers ────────────────────────────────────────────

  const handlePrint = () => {
    lightFeedback();
    window.print();
  };

  const handleDownload = async () => {
    lightFeedback();
    
    try {
      // Ocultar elementos que no deben aparecer al imprimir
      const footer = document.querySelector('[class*="InvoiceActionsFooter"]') || document.querySelector('[class*="invoice-actions-footer"]');
      const headerNav = document.querySelector('[class*="HeaderNav"]');
      const responsiveHeader = document.querySelector('[class*="ResponsiveHeader"]');
      
      const originalFooterDisplay = footer ? (footer as HTMLElement).style.display : '';
      const originalHeaderNavDisplay = headerNav ? (headerNav as HTMLElement).style.display : '';
      const originalResponsiveHeaderDisplay = responsiveHeader ? (responsiveHeader as HTMLElement).style.display : '';
      
      if (footer) (footer as HTMLElement).style.display = 'none';
      if (headerNav) (headerNav as HTMLElement).style.display = 'none';
      if (responsiveHeader) (responsiveHeader as HTMLElement).style.display = 'none';
      
      // Pequeño delay para asegurar que los elementos se oculten
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Usar window.print() que respetará los estilos @media print
      // El navegador mostrará el diálogo donde el usuario puede guardar como PDF
      window.print();
      
      // Restaurar elementos después de imprimir
      setTimeout(() => {
        if (footer) (footer as HTMLElement).style.display = originalFooterDisplay;
        if (headerNav) (headerNav as HTMLElement).style.display = originalHeaderNavDisplay;
        if (responsiveHeader) (responsiveHeader as HTMLElement).style.display = originalResponsiveHeaderDisplay;
      }, 1000);
    } catch (error) {
      console.error('Error printing:', error);
      toast.error('Fehler beim Drucken');
    }
  };

  // ─── Invoice View ──────────────────────────────────────────────────────────

  return (
    <div className="invoice-print-container w-full h-full">
      <div className={isMobile ? 'px-4 py-4' : 'px-6 py-6 max-w-4xl mx-auto'}>
        {/* Invoice Template */}
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
