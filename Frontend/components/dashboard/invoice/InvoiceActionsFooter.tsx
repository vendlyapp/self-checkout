'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { InvoiceService, Invoice } from '@/lib/services/invoiceService';
import { Download, Share2, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { lightFeedback } from '@/lib/utils/safeFeedback';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function InvoiceActionsFooter() {
  const pathname = usePathname();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);

  // Extraer invoiceId del pathname (ej: /store/invoice/abc123 -> abc123)
  const invoiceId = pathname?.match(/\/store\/invoice\/([^\/]+)/)?.[1];

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) {
        setInvoice(null);
        return;
      }

      try {
        setLoading(true);
        // Intentar obtener por ID primero
        let result = await InvoiceService.getInvoiceById(invoiceId);
        
        // Si no se encuentra por ID, intentar por número de factura
        if (!result.success && !result.data) {
          result = await InvoiceService.getInvoiceByNumber(invoiceId);
        }

        if (result.success && result.data) {
          setInvoice(result.data);
        } else {
          setInvoice(null);
        }
      } catch (err) {
        console.error('Error loading invoice for actions:', err);
        setInvoice(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handlePrint = (e: React.MouseEvent<HTMLButtonElement>) => {
    lightFeedback(e.currentTarget);
    // Ocultar el footer de acciones antes de imprimir
    const footer = document.querySelector('[class*="InvoiceActionsFooter"]');
    if (footer) {
      (footer as HTMLElement).style.display = 'none';
    }
    
    // Imprimir
    window.print();
    
    // Restaurar el footer después de un breve delay
    setTimeout(() => {
      if (footer) {
        (footer as HTMLElement).style.display = '';
      }
    }, 1000);
  };

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    lightFeedback(e.currentTarget);
    
    if (!invoice) {
      toast.error('Rechnung nicht gefunden');
      return;
    }

    // Generar o usar el shareToken
    let shareToken = invoice.shareToken;
    
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
      let existingStyle = document.getElementById(styleId);
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
        #invoice-content .bg-green-100 {
          background-color: rgb(220, 252, 231) !important;
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
        #invoice-content .text-green-600 {
          color: rgb(22, 163, 74) !important;
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
        #invoice-content .border-green-200 {
          border-color: rgb(187, 247, 208) !important;
        }
        #invoice-content .border-red-200 {
          border-color: rgb(254, 202, 202) !important;
        }
        #invoice-content .border-blue-200 {
          border-color: rgb(191, 219, 254) !important;
        }
      `;
      document.head.appendChild(colorFixStyle);
      
      // Esperar un momento para que los estilos se apliquen
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Capturar el contenido como imagen con configuración que evita errores de color
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: invoiceElement.scrollWidth,
        windowHeight: invoiceElement.scrollHeight,
        ignoreElements: (element) => {
          // Ignorar elementos que causan problemas
          return element.classList?.contains('no-print') || 
                 element.classList?.contains('fixed') ||
                 element.tagName === 'BUTTON';
        },
        onclone: (clonedDoc, element) => {
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
            .bg-green-100 {
              background-color: rgb(220, 252, 231) !important;
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
            .text-green-600 {
              color: rgb(22, 163, 74) !important;
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
            .border-green-200 {
              border-color: rgb(187, 247, 208) !important;
            }
            .border-red-200 {
              border-color: rgb(254, 202, 202) !important;
            }
            .border-blue-200 {
              border-color: rgb(191, 219, 254) !important;
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
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgScaledWidth = imgWidth * ratio;
      const imgScaledHeight = imgHeight * ratio;
      
      // Calcular centrado
      const xOffset = (pdfWidth - imgScaledWidth) / 2;
      const yOffset = 0;
      
      // Si la imagen es más alta que una página, dividirla en múltiples páginas
      if (imgScaledHeight > pdfHeight) {
        let heightLeft = imgScaledHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', xOffset, position, imgScaledWidth, imgScaledHeight);
        heightLeft -= pdfHeight;
        
        while (heightLeft > 0) {
          position = heightLeft - imgScaledHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', xOffset, position, imgScaledWidth, imgScaledHeight);
          heightLeft -= pdfHeight;
        }
      } else {
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgScaledWidth, imgScaledHeight);
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
