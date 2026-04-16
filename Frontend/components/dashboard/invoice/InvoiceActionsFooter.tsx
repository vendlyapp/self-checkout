'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useInvoice } from '@/hooks/queries/useInvoice';
import { Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { lightFeedback } from '@/lib/utils/safeFeedback';
import { getDefaultStoreName } from '@/lib/config/brand';
import { devError } from '@/lib/utils/logger';
import { InvoiceService } from '@/lib/services/invoiceService';
import { Loader } from '@/components/ui/Loader';

export default function InvoiceActionsFooter() {
  const pathname = usePathname();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Extraer invoiceId del pathname (soporta ambas rutas: /store/invoice/abc123 o /sales/invoices/abc123)
  const invoiceId = pathname?.match(/\/store\/invoice\/([^\/]+)/)?.[1] || 
                    pathname?.match(/\/sales\/invoices\/([^\/]+)/)?.[1];

  // Usar React Query hook para obtener invoice con cache (evita múltiples peticiones)
  const { data: invoice, isLoading: loading } = useInvoice(invoiceId);

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    lightFeedback(e.currentTarget);
    
    if (!invoice) {
      toast.error('Rechnung nicht gefunden');
      return;
    }

    // Generar o usar el shareToken
    const shareToken = invoice.shareToken;
    
    // Si no tiene shareToken, generarlo en el backend
    if (!shareToken) {
      try {
        toast.loading('Link wird generiert...', { id: 'share-link' });
        // Aquí podrías llamar a un endpoint para generar el token si no existe
        // Por ahora, asumimos que todas las facturas tienen shareToken
        toast.error('Diese Rechnung kann nicht geteilt werden', { id: 'share-link' });
        return;
      } catch (err) {
        toast.error('Fehler beim Generieren des Links', { id: 'share-link' });
        return;
      }
    }

    // Construir el link público
    const publicUrl = `${window.location.origin}/invoice/public/${shareToken}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Rechnung ${invoice.invoiceNumber}`,
          text: `Rechnung ${invoice.invoiceNumber} von ${invoice.storeName || getDefaultStoreName()}`,
          url: publicUrl,
        });
        toast.success('Rechnung geteilt', { id: 'share-link' });
      } catch (error) {
        // Usuario canceló - no hacer nada
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(publicUrl);
        toast.success('Link zur Rechnung wurde in die Zwischenablage kopiert', { id: 'share-link' });
      } catch (err) {
        toast.error('Fehler beim Kopieren', { id: 'share-link' });
      }
    }
  };

  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDownloadingPdf) return;
    lightFeedback(e.currentTarget);

    if (!invoice?.id) {
      toast.error('Rechnung nicht gefunden');
      return;
    }

    try {
      setIsDownloadingPdf(true);
      const filename = invoice.invoiceNumber
        ? `Rechnung-${invoice.invoiceNumber}`
        : `Rechnung-${invoice.id.slice(0, 8)}`;
      await InvoiceService.downloadPDF(invoice.id, filename);
    } catch (error) {
      devError('Error downloading PDF:', error);
      toast.error('Fehler beim Herunterladen der Rechnung');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Solo mostrar si estamos en una ruta de detalle de factura y tenemos la factura
  if (!invoiceId || !invoice || loading) {
    return null;
  }

  return (
    <>
      {isDownloadingPdf && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[100000] flex items-center justify-center p-6">
          <div className="w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 flex flex-col items-center text-center">
            <Loader size="lg" />
            <p className="mt-4 text-base font-semibold text-gray-900">PDF wird vorbereitet...</p>
            <p className="mt-1 text-sm text-gray-500">Bitte einen Moment Geduld</p>
          </div>
        </div>
      )}

      <nav
        className="nav-container safe-area-bottom"
        style={{ zIndex: 9999 }}
        aria-label="Rechnungsaktionen"
      >
        <div className="flex items-center gap-3 h-full px-4 max-w-[430px] mx-auto pt-3 pb-[env(safe-area-inset-bottom)]">
        {/* Botón Teilen */}
        <button
          onClick={handleShare}
          disabled={isDownloadingPdf}
          className="flex items-center justify-center gap-2 flex-1 min-w-0 h-11 px-3 rounded-xl bg-gray-50 border border-gray-200 touch-target active:scale-95 active:bg-gray-100 transition-all disabled:opacity-60"
          aria-label="Teilen"
        >
          <Share2 className="w-4.5 h-4.5 text-gray-700" strokeWidth={2} />
          <span className="text-[12px] leading-none font-semibold text-gray-700 whitespace-nowrap">Teilen</span>
        </button>

        {/* Botón PDF (destacado) */}
        <button
          onClick={handleDownload}
          disabled={isDownloadingPdf}
          className="flex items-center justify-center gap-2 flex-1 min-w-0 h-11 px-3 rounded-xl bg-[#25D076] touch-target active:scale-95 active:bg-[#20B865] transition-all shadow-sm disabled:opacity-60"
          aria-label="PDF herunterladen"
        >
          <Download className="w-4.5 h-4.5 text-white" strokeWidth={2.3} />
          <span className="text-[12px] leading-none font-semibold text-white whitespace-nowrap">PDF herunterladen</span>
        </button>
        </div>
      </nav>
    </>
  );
}
