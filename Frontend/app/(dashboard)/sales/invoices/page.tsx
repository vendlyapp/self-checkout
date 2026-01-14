'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Invoice } from '@/lib/services/invoiceService';
import { useResponsive } from '@/hooks';
import { useInvoices } from '@/hooks/queries/useInvoices';
import HeaderNav from '@/components/navigation/HeaderNav';
import { FileText, Search, Calendar, DollarSign, User, ChevronRight, ShoppingCart, ExternalLink } from 'lucide-react';
import { formatSwissPriceWithCHF } from '@/lib/utils';
import Link from 'next/link';
import { Loader } from '@/components/ui/Loader';

export default function SalesInvoicesPage() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  
  // Usar React Query hook para obtener invoices con cache
  const { data: invoices = [], isLoading, isFetching, error: queryError } = useInvoices({
    limit: 100,
    offset: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar facturas por búsqueda usando useMemo para optimizar rendimiento
  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;
    
    const query = searchQuery.toLowerCase();
    return invoices.filter((invoice) => {
      return (
        invoice.invoiceNumber?.toLowerCase().includes(query) ||
        invoice.customerName?.toLowerCase().includes(query) ||
        invoice.customerEmail?.toLowerCase().includes(query) ||
        invoice.orderId?.toLowerCase().includes(query)
      );
    });
  }, [invoices, searchQuery]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Determinar estados de carga y error
  const loading = isLoading || isFetching;
  const error = queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null;

  if (loading && invoices.length === 0) {
    return (
      <div className="w-full h-full overflow-auto gpu-accelerated">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Loader size="lg" />
          <p className="text-gray-600 font-medium mt-4">Rechnungen werden geladen...</p>
        </div>
      </div>
    );
  }

  if (error && invoices.length === 0) {
    return (
      <div className="w-full h-full overflow-auto gpu-accelerated">
        {isMobile && (
          <div className="flex flex-col h-full">
            <HeaderNav title="Belege" closeDestination="/sales" />
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Fehler</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => router.push('/sales')}
                  className="w-full bg-[#25D076] hover:bg-[#25D076]/90 text-white rounded-xl py-3 px-6 font-semibold transition-colors touch-target"
                >
                  Zurück
                </button>
              </div>
            </div>
          </div>
        )}
        {!isMobile && (
          <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Fehler</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => router.push('/sales')}
                className="bg-[#25D076] hover:bg-[#25D076]/90 text-white rounded-xl py-3 px-6 font-semibold transition-colors"
              >
                Zurück
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto gpu-accelerated">
      {/* Mobile Layout */}
      {isMobile && (
        <div className="flex flex-col h-full">
          <HeaderNav title="Belege" closeDestination="/sales" />
          
          <div className="flex-1 overflow-y-auto">
            {/* Search Bar */}
            <div className="p-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-[#25D076] bg-white text-base"
                />
              </div>
              
              {/* Count */}
              <p className="text-sm text-gray-600 mt-3 px-1">
                {filteredInvoices.length} {filteredInvoices.length === 1 ? 'Beleg' : 'Belege'}
                {searchQuery && ` gefunden`}
              </p>
            </div>

            {/* Invoices List */}
            {filteredInvoices.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'Keine Belege gefunden' : 'Keine Belege vorhanden'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {searchQuery
                      ? 'Versuchen Sie es mit einer anderen Suche'
                      : 'Es wurden noch keine Belege für dieses Geschäft erstellt'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="px-4 pb-24 space-y-3">
                {filteredInvoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/sales/invoices/${invoice.id}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 active:shadow-md transition-all p-4 block touch-target"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-[#25D076]/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-[#25D076]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-gray-900 truncate mb-1">
                            {invoice.invoiceNumber}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {invoice.customerName || 'Kein Kundenname'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-600 truncate">
                          {formatDate(invoice.issuedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-bold text-gray-900">
                          {formatSwissPriceWithCHF(invoice.total)}
                        </span>
                      </div>
                      {invoice.customerEmail && (
                        <div className="flex items-center gap-2 col-span-2">
                          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-600 truncate">
                            {invoice.customerEmail}
                          </span>
                        </div>
                      )}
                      <div className="col-span-2 flex items-center justify-end mt-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : invoice.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {invoice.status === 'paid'
                            ? 'Bezahlt'
                            : invoice.status === 'cancelled'
                            ? 'Storniert'
                            : 'Ausgestellt'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      {!isMobile && (
        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Belege</h1>
            <p className="text-gray-600">
              {invoices.length} {invoices.length === 1 ? 'Beleg' : 'Belege'} insgesamt
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nach Rechnungsnummer, Kunde oder E-Mail suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-[#25D076] bg-white"
              />
            </div>
          </div>

          {/* Invoices List */}
          {filteredInvoices.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'Keine Belege gefunden' : 'Keine Belege vorhanden'}
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? 'Versuchen Sie es mit einer anderen Suche'
                  : 'Es wurden noch keine Belege für dieses Geschäft erstellt'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/sales/invoices/${invoice.id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all p-6 block"
                >
                  <div className="flex flex-row items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-[#25D076]/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-[#25D076]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {invoice.invoiceNumber}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {invoice.customerName || 'Kein Kundenname'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 ml-16">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(invoice.issuedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {formatSwissPriceWithCHF(invoice.total)}
                          </span>
                        </div>
                        {invoice.customerEmail && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{invoice.customerEmail}</span>
                          </div>
                        )}
                        {invoice.orderId && (
                          <Link
                            href={`/sales/orders/${invoice.orderId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 text-sm text-[#25D076] hover:text-[#25D076]/80 font-medium"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span>Bestellung</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              invoice.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : invoice.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {invoice.status === 'paid'
                              ? 'Bezahlt'
                              : invoice.status === 'cancelled'
                              ? 'Storniert'
                              : 'Ausgestellt'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

