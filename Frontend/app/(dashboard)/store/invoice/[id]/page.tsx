'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { InvoiceService, Invoice } from '@/lib/services/invoiceService';
import InvoiceTemplate from '@/components/invoice/InvoiceTemplate';
import { useResponsive } from '@/hooks';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const invoiceId = params.id as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) {
        setError('Keine Rechnungs-ID angegeben');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Intentar obtener por ID primero
        let result = await InvoiceService.getInvoiceById(invoiceId);
        
        // Si no se encuentra por ID, intentar por número de factura
        if (!result.success && !result.data) {
          result = await InvoiceService.getInvoiceByNumber(invoiceId);
        }

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
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-8 h-8 text-[#25D076] animate-spin" />
        <p className="text-gray-600 font-medium mt-4">Rechnung wird geladen...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="w-full h-full">
        {isMobile && (
          <div className="w-full p-4">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Rechnung nicht gefunden</h2>
                <p className="text-gray-600 mb-6">{error || 'Die angeforderte Rechnung konnte nicht gefunden werden.'}</p>
                <button
                  onClick={() => router.push('/store/invoice')}
                  className="w-full bg-[#25D076] hover:bg-[#25D076]/90 text-white rounded-xl py-3 px-6 font-semibold transition-colors touch-target"
                >
                  Zurück zu Rechnungen
                </button>
              </div>
            </div>
          </div>
        )}
        {!isMobile && (
          <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Rechnung nicht gefunden</h2>
              <p className="text-gray-600 mb-6">{error || 'Die angeforderte Rechnung konnte nicht gefunden werden.'}</p>
              <button
                onClick={() => router.push('/store/invoice')}
                className="bg-[#25D076] hover:bg-[#25D076]/90 text-white rounded-xl py-3 px-6 font-semibold transition-colors"
              >
                Zurück zu Rechnungen
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="invoice-print-container w-full h-full">
      {/* Mobile Layout */}
      {isMobile && (
        <div className="w-full">
          <InvoiceTemplate
            invoice={invoice}
            showActions={false}
            isMobile={true}
          />
        </div>
      )}

      {/* Desktop Layout */}
      {!isMobile && (
        <div className="p-6 max-w-4xl mx-auto">
          <InvoiceTemplate
            invoice={invoice}
            showActions={true}
            isMobile={false}
          />
        </div>
      )}
    </div>
  );
}
