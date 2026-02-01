'use client';

import { usePathname } from 'next/navigation';
import { useInvoice } from '@/hooks/queries/useInvoice';
import { Download, Share2, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { lightFeedback } from '@/lib/utils/safeFeedback';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
      toast.loading('PDF wird erstellt...', { id: 'pdf-download' });
      
      // Encontrar el elemento de la factura
      const invoiceElement = document.getElementById('invoice-content');
      if (!invoiceElement) {
        toast.error('Rechnung nicht gefunden', { id: 'pdf-download' });
        return;
      }
      
      // Ocultar elementos que no deben aparecer en el PDF
      const footer = document.querySelector('[class*="InvoiceActionsFooter"]');
      const headerNav = document.querySelector('[class*="HeaderNav"]');
      const responsiveHeader = document.querySelector('[class*="ResponsiveHeader"]');
      
      const originalFooterDisplay = footer ? (footer as HTMLElement).style.display : '';
      const originalHeaderNavDisplay = headerNav ? (headerNav as HTMLElement).style.display : '';
      const originalResponsiveHeaderDisplay = responsiveHeader ? (responsiveHeader as HTMLElement).style.display : '';
      
      if (footer) (footer as HTMLElement).style.display = 'none';
      if (headerNav) (headerNav as HTMLElement).style.display = 'none';
      if (responsiveHeader) (responsiveHeader as HTMLElement).style.display = 'none';
      
      // Esperar un momento para que los cambios se apliquen
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Crear un estilo global que fuerce todos los colores a RGB
      const styleId = 'pdf-color-fix';
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
      
      const colorFixStyle = document.createElement('style');
      colorFixStyle.id = styleId;
      colorFixStyle.textContent = `
        #invoice-content * {
          color: rgb(31, 41, 55) !important;
        }
        #invoice-content .bg-gray-50 {
          background-color: rgb(249, 250, 251) !important;
        }
        #invoice-content .bg-white {
          background-color: rgb(255, 255, 255) !important;
        }
        #invoice-content .bg-gray-100 {
          background-color: rgb(243, 244, 246) !important;
        }
        #invoice-content .bg-green-100,
        #invoice-content .bg-emerald-50,
        #invoice-content .bg-sky-50,
        #invoice-content .bg-amber-50 {
          background-color: rgb(220, 252, 231) !important;
        }
        #invoice-content .bg-\\[\\#25D076\\] {
          background-color: rgb(37, 208, 118) !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        #invoice-content .bg-red-100 {
          background-color: rgb(254, 226, 226) !important;
        }
        #invoice-content .bg-blue-100 {
          background-color: rgb(219, 234, 254) !important;
        }
        #invoice-content .text-gray-900 {
          color: rgb(17, 24, 39) !important;
        }
        #invoice-content .text-gray-700 {
          color: rgb(55, 65, 81) !important;
        }
        #invoice-content .text-gray-600 {
          color: rgb(75, 85, 99) !important;
        }
        #invoice-content .text-green-600,
        #invoice-content .text-\\[\\#25D076\\] {
          color: rgb(37, 208, 118) !important;
        }
        #invoice-content .text-green-700 {
          color: rgb(21, 128, 61) !important;
        }
        #invoice-content .text-red-600 {
          color: rgb(220, 38, 38) !important;
        }
        #invoice-content .text-red-700 {
          color: rgb(185, 28, 28) !important;
        }
        #invoice-content .text-blue-600 {
          color: rgb(37, 99, 235) !important;
        }
        #invoice-content .text-blue-700 {
          color: rgb(29, 78, 216) !important;
        }
        #invoice-content [style*="color"] {
          color: rgb(31, 41, 55) !important;
        }
        #invoice-content .border-gray-200 {
          border-color: rgb(229, 231, 235) !important;
        }
        #invoice-content .border-gray-100 {
          border-color: rgb(243, 244, 246) !important;
        }
        #invoice-content .border-green-200,
        #invoice-content .border-\\[\\#25D076\\] {
          border-color: rgb(37, 208, 118) !important;
        }
        #invoice-content .border-red-200 {
          border-color: rgb(254, 202, 202) !important;
        }
        #invoice-content .border-blue-200 {
          border-color: rgb(191, 219, 254) !important;
        }
        #invoice-content .divide-\\[\\#25D076\\] > * + * {
          border-color: rgb(37, 208, 118) !important;
        }
      `;
      document.head.appendChild(colorFixStyle);
      
      // Esperar un momento para que los estilos se apliquen
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Capturar el contenido como imagen con configuración optimizada
      const canvas = await html2canvas(invoiceElement, {
        scale: 2, // Alta resolución para PDF de calidad
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: invoiceElement.scrollWidth,
        windowHeight: invoiceElement.scrollHeight,
        allowTaint: false,
        ignoreElements: (element) => {
          // Ignorar elementos que no deben aparecer en el PDF
          return element.classList?.contains('print:hidden') ||
                 element.classList?.contains('no-print') || 
                 element.classList?.contains('fixed') ||
                 element.tagName === 'BUTTON' ||
                 element.getAttribute('aria-hidden') === 'true';
        },
        onclone: (clonedDoc) => {
          // Agregar estilos que fuerzan RGB para todos los elementos
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              color: rgb(31, 41, 55) !important;
            }
            .bg-gray-50 {
              background-color: rgb(249, 250, 251) !important;
            }
            .bg-white {
              background-color: rgb(255, 255, 255) !important;
            }
            .bg-gray-100 {
              background-color: rgb(243, 244, 246) !important;
            }
            .bg-green-100,
            .bg-emerald-50,
            .bg-sky-50,
            .bg-amber-50 {
              background-color: rgb(220, 252, 231) !important;
            }
            .bg-\\[\\#25D076\\] {
              background-color: rgb(37, 208, 118) !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .bg-red-100 {
              background-color: rgb(254, 226, 226) !important;
            }
            .bg-blue-100 {
              background-color: rgb(219, 234, 254) !important;
            }
            .text-gray-900 {
              color: rgb(17, 24, 39) !important;
            }
            .text-gray-700 {
              color: rgb(55, 65, 81) !important;
            }
            .text-gray-600 {
              color: rgb(75, 85, 99) !important;
            }
            .text-green-600,
            .text-\\[\\#25D076\\] {
              color: rgb(37, 208, 118) !important;
            }
            .text-green-700 {
              color: rgb(21, 128, 61) !important;
            }
            .text-red-600 {
              color: rgb(220, 38, 38) !important;
            }
            .text-red-700 {
              color: rgb(185, 28, 28) !important;
            }
            .text-blue-600 {
              color: rgb(37, 99, 235) !important;
            }
            .text-blue-700 {
              color: rgb(29, 78, 216) !important;
            }
            [style*="color"] {
              color: rgb(31, 41, 55) !important;
            }
            [style*="background-color"] {
              background-color: rgb(255, 255, 255) !important;
            }
            .border-gray-200 {
              border-color: rgb(229, 231, 235) !important;
            }
            .border-gray-100 {
              border-color: rgb(243, 244, 246) !important;
            }
            .border-green-200,
            .border-\\[\\#25D076\\] {
              border-color: rgb(37, 208, 118) !important;
            }
            .border-red-200 {
              border-color: rgb(254, 202, 202) !important;
            }
            .border-blue-200 {
              border-color: rgb(191, 219, 254) !important;
            }
            .divide-\\[\\#25D076\\] > * + * {
              border-color: rgb(37, 208, 118) !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        },
      });
      
      // Restaurar elementos ocultos
      if (footer) (footer as HTMLElement).style.display = originalFooterDisplay;
      if (headerNav) (headerNav as HTMLElement).style.display = originalHeaderNavDisplay;
      if (responsiveHeader) (responsiveHeader as HTMLElement).style.display = originalResponsiveHeaderDisplay;
      
      // Remover el estilo temporal
      const tempStyle = document.getElementById(styleId);
      if (tempStyle) {
        tempStyle.remove();
      }
      
      // Crear PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Margen de 10mm en cada lado
      const margin = 10;
      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calcular ratio para ajustar la imagen al ancho disponible
      const ratio = availableWidth / imgWidth;
      const imgScaledWidth = imgWidth * ratio;
      const imgScaledHeight = imgHeight * ratio;
      
      // Centrar horizontalmente
      const xOffset = (pdfWidth - imgScaledWidth) / 2;
      
      // Si la imagen cabe en una página, usar solo una página
      if (imgScaledHeight <= pdfHeight) {
        // Centrar verticalmente si es más pequeña que la página
        const yOffset = imgScaledHeight < pdfHeight ? (pdfHeight - imgScaledHeight) / 2 : margin;
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgScaledWidth, imgScaledHeight);
      } else {
        // Si es más grande, dividir en múltiples páginas
        let heightLeft = imgScaledHeight;
        let position = margin;
        
        pdf.addImage(imgData, 'PNG', xOffset, position, imgScaledWidth, imgScaledHeight);
        heightLeft -= (pdfHeight - margin);
        
        while (heightLeft > 0) {
          position = heightLeft - imgScaledHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', xOffset, position, imgScaledWidth, imgScaledHeight);
          heightLeft -= (pdfHeight - margin);
        }
      }
      
      // Descargar el PDF
      if (!invoice) {
        toast.error('Rechnung nicht gefunden', { id: 'pdf-download' });
        return;
      }
      
      const fileName = `Rechnung_${invoice.invoiceNumber || invoice.id}.pdf`;
      pdf.save(fileName);
      
      toast.success('PDF erfolgreich heruntergeladen', { id: 'pdf-download' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Fehler beim Erstellen des PDFs', { id: 'pdf-download' });
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
