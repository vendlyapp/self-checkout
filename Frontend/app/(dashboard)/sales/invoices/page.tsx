'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsive } from '@/hooks';
import { useInvoices } from '@/hooks/queries/useInvoices';
import {
  FileText,
  Search,
  Calendar,
  Banknote,
  User,
  ChevronRight,
  ShoppingCart,
  ExternalLink,
} from 'lucide-react';
import { formatSwissPriceWithCHF } from '@/lib/utils';
import Link from 'next/link';
import { DashboardLoadingState } from '@/components/ui/DashboardLoadingState';

export default function SalesInvoicesPage() {
  const router = useRouter();
  const { isMobile } = useResponsive();

  const { data: invoices = [], isLoading, isFetching, error: queryError } = useInvoices({
    limit: 100,
    offset: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;
    const q = searchQuery.toLowerCase();
    return invoices.filter(
      (invoice) =>
        invoice.invoiceNumber?.toLowerCase().includes(q) ||
        invoice.customerName?.toLowerCase().includes(q) ||
        invoice.customerEmail?.toLowerCase().includes(q) ||
        invoice.orderId?.toLowerCase().includes(q)
    );
  }, [invoices, searchQuery]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('de-CH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'paid':
        return { label: 'Bezahlt', color: 'bg-green-100 text-green-700' };
      case 'cancelled':
        return { label: 'Storniert', color: 'bg-red-100 text-red-700' };
      default:
        return { label: 'Ausgestellt', color: 'bg-blue-100 text-blue-700' };
    }
  };

  const loading = isLoading || isFetching;
  const error = queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null;

  if (loading && invoices.length === 0) {
    return <DashboardLoadingState mode="page" message="Rechnungen werden geladen..." />;
  }

  if (error && invoices.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl border border-border p-8 w-full max-w-md text-center shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-2">Fehler</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push('/sales')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-2.5 px-6 font-semibold transition-ios"
          >
            Zurück
          </button>
        </div>
      </div>
    );
  }

  /* ── Mobile ─────────────────────────────────────────────────────── */
  if (isMobile) {
    return (
      <div className="w-full h-full overflow-auto min-w-0">
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden />
            <input
              type="search"
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-base"
              aria-label="Belege durchsuchen"
            />
          </div>
          <p className="text-sm text-gray-600 mt-3 px-1">
            {filteredInvoices.length} {filteredInvoices.length === 1 ? 'Beleg' : 'Belege'}
            {searchQuery && ' gefunden'}
          </p>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'Keine Belege gefunden' : 'Keine Belege vorhanden'}
            </h3>
            <p className="text-gray-600 text-sm">
              {searchQuery
                ? 'Versuchen Sie es mit anderer Suche'
                : 'Es wurden noch keine Belege für dieses Geschäft erstellt.'}
            </p>
          </div>
        ) : (
          <div className="px-4 pb-24 space-y-3">
            {filteredInvoices.map((invoice) => {
              const statusConfig = getStatusConfig(invoice.status);
              return (
                <Link
                  key={invoice.id}
                  href={`/sales/invoices/${invoice.id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 active:shadow-md transition-all p-4 block touch-target"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary" aria-hidden />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 truncate mb-1">
                          {invoice.invoiceNumber}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {invoice.customerName || 'Kein Name'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden />
                      <span className="text-xs text-gray-600 truncate">{formatDate(invoice.issuedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden />
                      <span className="text-sm font-bold text-gray-900">
                        {formatSwissPriceWithCHF(invoice.total)}
                      </span>
                    </div>
                    {invoice.customerEmail && (
                      <div className="flex items-center gap-2 col-span-2">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden />
                        <span className="text-xs text-gray-600 truncate">{invoice.customerEmail}</span>
                      </div>
                    )}
                    <div className="col-span-2 flex items-center justify-end mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ── Tablet + Desktop ───────────────────────────────────────────── */
  return (
    <div className="w-full h-full overflow-auto min-w-0">
      <div className="px-5 pt-8 pb-10 lg:px-8 lg:pt-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Belege</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredInvoices.length} {filteredInvoices.length === 1 ? 'Beleg' : 'Belege'}
              {searchQuery ? ' gefunden' : ' insgesamt'}
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
            <input
              type="search"
              placeholder="Nach Belegnummer, Kunde oder E-Mail suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-ios"
              aria-label="Belege durchsuchen"
            />
          </div>
        </div>

        {/* Empty state */}
        {filteredInvoices.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <FileText className="w-14 h-14 text-muted-foreground/40 mx-auto mb-4" aria-hidden />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {searchQuery ? 'Keine Belege gefunden' : 'Keine Belege vorhanden'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery
                ? 'Versuchen Sie es mit anderer Suche'
                : 'Es wurden noch keine Belege für dieses Geschäft erstellt.'}
            </p>
          </div>
        ) : (
          /* Table — overflow-x-auto handles narrow containers gracefully */
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]" role="grid" aria-label="Liste der Belege">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Belegnummer
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Datum
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Kunde
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Betrag
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <span className="sr-only">Aktionen</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInvoices.map((invoice) => {
                    const statusConfig = getStatusConfig(invoice.status);
                    return (
                      <tr
                        key={invoice.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => router.push(`/sales/invoices/${invoice.id}`)}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-primary" aria-hidden />
                            </div>
                            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                              {invoice.invoiceNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(invoice.issuedAt)}
                        </td>
                        <td className="px-5 py-4 max-w-[200px]">
                          <div className="text-sm text-foreground truncate">
                            {invoice.customerName || 'Kein Name'}
                          </div>
                          {invoice.customerEmail && (
                            <div className="text-xs text-muted-foreground truncate">{invoice.customerEmail}</div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                            {formatSwissPriceWithCHF(invoice.total)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {invoice.orderId && (
                              <Link
                                href={`/sales/orders/${invoice.orderId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-muted-foreground hover:text-foreground text-sm inline-flex items-center gap-1 transition-ios whitespace-nowrap"
                                aria-label="Zugehörige Bestellung anzeigen"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" aria-hidden />
                                <ExternalLink className="w-3 h-3" aria-hidden />
                              </Link>
                            )}
                            <Link
                              href={`/sales/invoices/${invoice.id}`}
                              className="text-primary hover:text-primary/80 font-medium text-sm inline-flex items-center gap-1 transition-ios whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Details für Beleg ${invoice.invoiceNumber}`}
                            >
                              Details
                              <ChevronRight className="w-4 h-4" aria-hidden />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
