'use client';

import { usePathname } from 'next/navigation';
import { useInvoice } from '@/hooks/queries/useInvoice';
import { Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { lightFeedback } from '@/lib/utils/safeFeedback';
import { getDefaultStoreName } from '@/lib/config/brand';
import { devError } from '@/lib/utils/logger';
import { InvoiceService } from '@/lib/services/invoiceService';

export default function InvoiceActionsFooter() {
  const pathname = usePathname();

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
    lightFeedback(e.currentTarget);

    if (!invoice?.id) {
      toast.error('Rechnung nicht gefunden');
      return;
    }

    try {
      const filename = invoice.invoiceNumber
        ? `Rechnung-${invoice.invoiceNumber}`
        : `Rechnung-${invoice.id.slice(0, 8)}`;
      await InvoiceService.downloadPDF(invoice.id, filename);
    } catch (error) {
      devError('Error downloading PDF:', error);
      toast.error('Fehler beim Herunterladen der Rechnung');
    }
  };

  // Solo mostrar si estamos en una ruta de detalle de factura y tenemos la factura
  if (!invoiceId || !invoice || loading) {
    return null;
  }

  return (
    <nav
      className="nav-container safe-area-bottom"
      style={{ zIndex: 9999 }}
      aria-label="Rechnungsaktionen"
    >
      <div className="flex items-center justify-around h-full px-4 max-w-[430px] mx-auto pb-[env(safe-area-inset-bottom)]">
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
          <div className="w-12 h-12 rounded-2xl bg-[#25D076] flex items-center justify-center active:bg-[#20B865] transition-colors shadow-sm">
            <Download className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xs font-semibold text-[#25D076]">PDF</span>
        </button>
      </div>
    </nav>
  );
}
