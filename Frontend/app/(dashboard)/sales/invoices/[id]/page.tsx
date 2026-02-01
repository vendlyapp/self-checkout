'use client';

import { useParams, useRouter } from 'next/navigation';
import InvoiceTemplate from '@/components/invoice/InvoiceTemplate';
import { useResponsive } from '@/hooks';
import { useInvoice } from '@/hooks/queries/useInvoice';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '@/components/ui/Loader';
import { useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
      toast.loading('PDF wird erstellt...', { id: 'pdf-download' });
      
      // Encontrar el elemento de la factura
      const invoiceElement = document.getElementById('invoice-content');
      if (!invoiceElement) {
        toast.error('Rechnung nicht gefunden', { id: 'pdf-download' });
        return;
      }
      
      // Ocultar elementos que no deben aparecer en el PDF
      const footer = document.querySelector('[class*="InvoiceActionsFooter"]') || document.querySelector('[class*="invoice-actions-footer"]');
      
      const originalFooterDisplay = footer ? (footer as HTMLElement).style.display : '';
      
      if (footer) (footer as HTMLElement).style.display = 'none';
      
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
      let canvas: HTMLCanvasElement;
      
      try {
        canvas = await html2canvas(invoiceElement, {
          scale: 1.5, // Reducir scale para que la imagen no sea tan grande
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
        onclone: (clonedDoc) => {
          // Agregar estilos que fuerzan RGB para todos los elementos ANTES de que html2canvas procese
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
          clonedDoc.head.insertBefore(style, clonedDoc.head.firstChild);
        },
        });
      } catch (err) {
        // Remover el estilo temporal si hay error
        if (colorFixStyle.parentNode) {
          colorFixStyle.parentNode.removeChild(colorFixStyle);
        }
        throw err;
      }
      
      // Remover el estilo temporal
      if (colorFixStyle.parentNode) {
        colorFixStyle.parentNode.removeChild(colorFixStyle);
      }
      
      // Crear PDF con mejor cálculo de dimensiones
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calcular dimensiones manteniendo la proporción
      // Dejar márgenes de 10mm en cada lado
      const margin = 10;
      const availableWidth = pdfWidth - (margin * 2);
      
      // Calcular ratio para ajustar la imagen al ancho disponible
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = availableWidth / imgWidth;
      const imgScaledWidth = imgWidth * ratio;
      const imgScaledHeight = imgHeight * ratio;
      
      // Centrar horizontalmente
      const xOffset = (pdfWidth - imgScaledWidth) / 2;
      
      // Si la imagen cabe en una página, usar solo una página
      if (imgScaledHeight <= pdfHeight) {
        // Centrar verticalmente si es más pequeña que la página
        const yOffset = imgScaledHeight < pdfHeight ? (pdfHeight - imgScaledHeight) / 2 : 0;
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgScaledWidth, imgScaledHeight);
      } else {
        // Si es más grande, dividir en múltiples páginas
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
      }
      
      pdf.save(`Rechnung-${invoice?.invoiceNumber || 'invoice'}.pdf`);
      
      // Restaurar footer
      if (footer) (footer as HTMLElement).style.display = originalFooterDisplay;
      
      toast.success('PDF wurde heruntergeladen', { id: 'pdf-download' });
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Fehler beim Erstellen des PDFs', { id: 'pdf-download' });
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
