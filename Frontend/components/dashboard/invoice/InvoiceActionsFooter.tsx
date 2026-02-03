'use client';

import { usePathname } from 'next/navigation';
import { useInvoice } from '@/hooks/queries/useInvoice';
import { Download, Share2, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { lightFeedback } from '@/lib/utils/safeFeedback';

export default function InvoiceActionsFooter() {
  const pathname = usePathname();

  // Extraer invoiceId del pathname (soporta ambas rutas: /store/invoice/abc123 o /sales/invoices/abc123)
  const invoiceId = pathname?.match(/\/store\/invoice\/([^\/]+)/)?.[1] || 
                    pathname?.match(/\/sales\/invoices\/([^\/]+)/)?.[1];

  // Usar React Query hook para obtener invoice con cache (evita múltiples peticiones)
  const { data: invoice, isLoading: loading } = useInvoice(invoiceId);

  const handlePrint = (e: React.MouseEvent<HTMLButtonElement>) => {
    lightFeedback(e.currentTarget);
    
    // Ocultar elementos que no deben imprimirse
    const footer = document.querySelector('[class*="InvoiceActionsFooter"]');
    const headerNav = document.querySelector('[class*="HeaderNav"]');
    const responsiveHeader = document.querySelector('[class*="ResponsiveHeader"]');
    const sidebar = document.querySelector('[class*="Sidebar"]');
    
    if (footer) (footer as HTMLElement).style.display = 'none';
    if (headerNav) (headerNav as HTMLElement).style.display = 'none';
    if (responsiveHeader) (responsiveHeader as HTMLElement).style.display = 'none';
    if (sidebar) (sidebar as HTMLElement).style.display = 'none';
    
    // Esperar un momento para que los cambios se apliquen
    setTimeout(() => {
      window.print();
      
      // Restaurar elementos después de imprimir
      setTimeout(() => {
        if (footer) (footer as HTMLElement).style.display = '';
        if (headerNav) (headerNav as HTMLElement).style.display = '';
        if (responsiveHeader) (responsiveHeader as HTMLElement).style.display = '';
        if (sidebar) (sidebar as HTMLElement).style.display = '';
      }, 500);
    }, 100);
  };

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
          text: `Rechnung ${invoice.invoiceNumber} von ${invoice.storeName || 'Vendly'}`,
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
    
    try {
      // Ocultar elementos que no deben aparecer al imprimir
      const footer = document.querySelector('[class*="InvoiceActionsFooter"]');
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

  // Solo mostrar si estamos en una ruta de detalle de factura y tenemos la factura
  if (!invoiceId || !invoice || loading) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] safe-area-bottom">
      {/* Contenedor con bordes redondeados superiores y sombra elegante */}
      <div className="rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.12)] bg-white overflow-hidden">
        <div className="bg-white rounded-t-3xl border-t border-[#E5E6F8]" style={{ borderTopWidth: '0.5px' }}>
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
              <div className="w-12 h-12 rounded-2xl bg-[#25D076] flex items-center justify-center active:bg-[#20B865] transition-colors shadow-sm">
                <Download className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-semibold text-[#25D076]">PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
