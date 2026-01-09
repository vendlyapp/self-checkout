'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { InvoiceService, Invoice } from '@/lib/services/invoiceService';
import { Download, Share2, Printer } from 'lucide-react';
import { toast } from 'sonner';

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

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share && invoice) {
      try {
        await navigator.share({
          title: `Rechnung ${invoice.invoiceNumber}`,
          text: `Rechnung ${invoice.invoiceNumber} von ${invoice.storeName || 'Vendly'}`,
          url: window.location.href,
        });
        toast.success('Rechnung geteilt');
      } catch (error) {
        // Usuario canceló
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link zur Rechnung wurde in die Zwischenablage kopiert');
      } catch (err) {
        toast.error('Fehler beim Kopieren');
      }
    }
  };

  const handleDownload = async () => {
    toast.info('PDF-Download wird in Kürze verfügbar sein');
  };

  // Solo mostrar si estamos en una ruta de detalle de factura y tenemos la factura
  if (!invoiceId || !invoice || loading) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] z-[9999] safe-area-bottom">
      <div className="flex items-center justify-around px-4 py-3 gap-2 max-w-[430px] mx-auto pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={handlePrint}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl active:bg-gray-100 transition-colors touch-target flex-1 min-w-0"
          aria-label="Drucken"
        >
          <Printer className="w-5 h-5 text-gray-700" />
          <span className="text-[11px] font-medium text-gray-700">Drucken</span>
        </button>
        <button
          onClick={handleShare}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl active:bg-gray-100 transition-colors touch-target flex-1 min-w-0"
          aria-label="Teilen"
        >
          <Share2 className="w-5 h-5 text-gray-700" />
          <span className="text-[11px] font-medium text-gray-700">Teilen</span>
        </button>
        <button
          onClick={handleDownload}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 bg-[#25D076] rounded-xl active:bg-[#20B865] transition-colors touch-target flex-1 min-w-0"
          aria-label="PDF herunterladen"
        >
          <Download className="w-5 h-5 text-white" />
          <span className="text-[11px] font-semibold text-white">PDF</span>
        </button>
      </div>
    </div>
  );
}

