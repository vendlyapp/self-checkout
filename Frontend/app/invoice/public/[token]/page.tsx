'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { InvoiceService, Invoice } from '@/lib/services/invoiceService';
import InvoiceTemplate from '@/components/invoice/InvoiceTemplate';
import { Loader2, AlertCircle, Download, Printer, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { lightFeedback } from '@/lib/utils/safeFeedback';

export default function PublicInvoicePage() {
  const params = useParams();
  const token = params.token as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!token) {
        setError('Kein Token angegeben');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await InvoiceService.getInvoiceByShareToken(token);

        if (result.success && result.data) {
          setInvoice(result.data);
        } else {
          setError(result.error || 'Rechnung nicht gefunden');
          toast.error('Rechnung nicht gefunden');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Fehler beim Laden der Rechnung';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [token]);

  const handlePrint = () => {
    lightFeedback();
    window.print();
  };

  const handleShare = async () => {
    lightFeedback();
    
    if (!invoice) {
      toast.error('Rechnung nicht gefunden');
      return;
    }

    const publicUrl = `${window.location.origin}/invoice/public/${token}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Rechnung ${invoice.invoiceNumber}`,
          text: `Rechnung ${invoice.invoiceNumber} von ${invoice.storeName || 'Vendly'}`,
          url: publicUrl,
        });
        toast.success('Rechnung geteilt');
      } catch (error) {
        // Usuario canceló
      }
    } else {
      try {
        await navigator.clipboard.writeText(publicUrl);
        toast.success('Link zur Rechnung wurde in die Zwischenablage kopiert');
      } catch (err) {
        toast.error('Fehler beim Kopieren');
      }
    }
  };

  const handleDownload = async () => {
    lightFeedback();
    
    try {
      // Ocultar elementos que no deben aparecer al imprimir
      const footer = document.querySelector('[class*="invoice-actions-footer"]');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#25D076] animate-spin" />
        <p className="text-gray-600 font-medium mt-4">Rechnung wird geladen...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rechnung nicht gefunden</h2>
          <p className="text-gray-600 mb-6">{error || 'Die angeforderte Rechnung konnte nicht gefunden werden.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Contenido compacto para móvil */}
      <div className={`${isMobile ? 'px-3 py-4' : 'px-4 py-8 max-w-3xl mx-auto'}`}>
        <InvoiceTemplate
          invoice={invoice}
          showActions={false}
          isMobile={isMobile}
        />
      </div>

      {/* Footer de acciones fijo en la parte inferior - estilo iOS */}
      <div className="invoice-actions-footer fixed bottom-0 left-0 right-0 z-50 no-print">
        <div className="rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.12)] bg-white overflow-hidden">
          <div className="bg-white rounded-t-3xl border-t border-gray-200" style={{ borderTopWidth: '0.5px' }}>
            <div className="flex items-center justify-around w-full px-6 max-w-[430px] mx-auto pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] gap-3">
              {/* Botón Drucken */}
              <button
                onClick={handlePrint}
                className="flex flex-col items-center justify-center gap-1.5 flex-1 min-w-0 touch-target active:scale-95 transition-transform"
                aria-label="Drucken"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center active:bg-gray-100 transition-colors">
                  <Printer className="w-6 h-6 text-gray-700" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-gray-700">Drucken</span>
              </button>

              {/* Botón Teilen */}
              <button
                onClick={handleShare}
                className="flex flex-col items-center justify-center gap-1.5 flex-1 min-w-0 touch-target active:scale-95 transition-transform"
                aria-label="Teilen"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center active:bg-gray-100 transition-colors">
                  <Share2 className="w-6 h-6 text-gray-700" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-gray-700">Teilen</span>
              </button>

              {/* Botón PDF (destacado) */}
              <button
                onClick={handleDownload}
                className="flex flex-col items-center justify-center gap-1.5 flex-1 min-w-0 touch-target active:scale-95 transition-transform"
                aria-label="PDF herunterladen"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#25D076] flex items-center justify-center active:bg-[#20B865] transition-colors shadow-lg shadow-[#25D076]/25">
                  <Download className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-semibold text-[#25D076]">PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

