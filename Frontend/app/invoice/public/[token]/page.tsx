'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { InvoiceService, Invoice } from '@/lib/services/invoiceService';
import InvoiceTemplate from '@/components/invoice/InvoiceTemplate';
import { Loader2, AlertCircle, Download, Printer, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
      toast.loading('PDF wird erstellt...', { id: 'pdf-download' });
      
      // Encontrar el elemento de la factura
      const invoiceElement = document.getElementById('invoice-content');
      if (!invoiceElement) {
        toast.error('Rechnung nicht gefunden', { id: 'pdf-download' });
        return;
      }
      
      // Ocultar elementos que no deben aparecer en el PDF
      const footer = document.querySelector('[class*="invoice-actions-footer"]');
      
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
      const canvas = await html2canvas(invoiceElement, {
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
      const availableHeight = pdfHeight - (margin * 2);
      
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

