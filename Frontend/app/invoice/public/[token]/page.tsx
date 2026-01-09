'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { InvoiceService, Invoice } from '@/lib/services/invoiceService';
import InvoiceTemplate from '@/components/invoice/InvoiceTemplate';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PublicInvoicePage() {
  const params = useParams();
  const token = params.token as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background-cream flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#25D076] animate-spin" />
        <p className="text-gray-600 font-medium mt-4">Rechnung wird geladen...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background-cream flex flex-col items-center justify-center p-4">
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
    <div className="min-h-screen bg-background-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <InvoiceTemplate
          invoice={invoice}
          showActions={false}
          isMobile={false}
        />
      </div>
    </div>
  );
}

