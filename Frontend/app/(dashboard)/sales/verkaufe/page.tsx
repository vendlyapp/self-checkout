'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsive } from '@/hooks';
import { useOrders } from '@/hooks/queries/useOrders';
import { ShoppingCart, Search, Calendar, Banknote, User, ChevronRight } from 'lucide-react';
import { formatSwissPriceWithCHF } from '@/lib/utils';
import Link from 'next/link';
import { Loader } from '@/components/ui/Loader';

export default function SalesVerkaufePage() {
  const router = useRouter();
  const { isMobile } = useResponsive();

  const { data: orders = [], isLoading, isFetching, error: queryError } = useOrders({
    limit: 100,
    offset: 0,
    status: 'completed',
  });

  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (order) =>
        order.id?.toLowerCase().includes(q) ||
        order.userName?.toLowerCase().includes(q) ||
        order.userEmail?.toLowerCase().includes(q) ||
        order.paymentMethod?.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('de-CH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const loading = isLoading || isFetching;
  const error = queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null;

  if (loading && orders.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader size="lg" />
          <p className="text-muted-foreground font-medium">Verkäufe werden geladen...</p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
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
      <div className="w-full h-full overflow-auto gpu-accelerated">
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden />
            <input
              type="search"
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-base"
              aria-label="Verkäufe durchsuchen"
            />
          </div>
          <p className="text-sm text-gray-600 mt-3 px-1">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'Verkauf' : 'Verkäufe'}
            {searchQuery && ' gefunden'}
          </p>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" aria-hidden />
            <p className="text-gray-600 text-center text-lg font-medium">
              {searchQuery ? 'Keine Verkäufe gefunden' : 'Noch keine abgeschlossenen Verkäufe'}
            </p>
          </div>
        ) : (
          <div className="px-4 pb-24 space-y-3">
            {filteredOrders.map((order) => (
              <Link
                key={order.id}
                href={`/sales/orders/${order.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 active:shadow-md transition-all p-4 block touch-target"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="w-5 h-5 text-primary flex-shrink-0" aria-hidden />
                      <span className="text-xs text-gray-500 font-mono">
                        {order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        Abgeschlossen
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" aria-hidden />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Banknote className="w-4 h-4 text-gray-400" aria-hidden />
                        <span className="font-semibold text-gray-900">
                          {formatSwissPriceWithCHF(order.total)}
                        </span>
                      </div>
                      {order.userEmail && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4 text-gray-400" aria-hidden />
                          <span className="truncate">{order.userEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Tablet + Desktop ───────────────────────────────────────────── */
  /*
   * Column visibility strategy (sidebar takes ~256px):
   *   md (768px) → ~472px available → show: ID+sub-info, Betrag+sub-status, Arrow
   *   lg (1024px) → ~728px available → show all columns
   */
  return (
    <div className="w-full h-full overflow-auto gpu-accelerated">
      <div className="px-4 pt-6 pb-8 lg:px-8 lg:pt-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">Verkäufe</h1>
            <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
              {filteredOrders.length}{' '}
              {filteredOrders.length === 1 ? 'abgeschlossener Verkauf' : 'abgeschlossene Verkäufe'}
              {searchQuery && ' gefunden'}
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
            <input
              type="search"
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-ios"
              aria-label="Verkäufe durchsuchen"
            />
          </div>
        </div>

        {/* Empty state */}
        {filteredOrders.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-10 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" aria-hidden />
            <p className="text-muted-foreground text-sm font-medium">
              {searchQuery ? 'Keine Verkäufe gefunden' : 'Noch keine abgeschlossenen Verkäufe'}
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <table className="w-full" role="grid" aria-label="Liste der Verkäufe">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  {/* Always visible */}
                  <th scope="col" className="px-3 lg:px-5 py-3 text-left text-[10px] lg:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Verkauf
                  </th>
                  {/* Desktop only */}
                  <th scope="col" className="hidden lg:table-cell px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Datum
                  </th>
                  <th scope="col" className="hidden lg:table-cell px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Kunde
                  </th>
                  {/* Always visible */}
                  <th scope="col" className="px-3 lg:px-5 py-3 text-left text-[10px] lg:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Betrag
                  </th>
                  {/* Desktop only */}
                  <th scope="col" className="hidden lg:table-cell px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  {/* Always visible */}
                  <th scope="col" className="px-3 lg:px-5 py-3 text-right">
                    <span className="sr-only">Aktionen</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => router.push(`/sales/orders/${order.id}`)}
                  >
                    {/* ID — tablet: also shows date + customer as sub-text */}
                    <td className="px-3 lg:px-5 py-3 lg:py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary shrink-0" aria-hidden />
                        <div className="min-w-0">
                          <span className="text-xs font-mono text-foreground whitespace-nowrap">
                            {order.id.slice(-8).toUpperCase()}
                          </span>
                          {/* Sub-info shown only on tablet (hidden on desktop) */}
                          <div className="lg:hidden text-[11px] text-muted-foreground mt-0.5 truncate">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date — desktop only */}
                    <td className="hidden lg:table-cell px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>

                    {/* Customer — desktop only */}
                    <td className="hidden lg:table-cell px-5 py-4 max-w-[180px]">
                      <div className="text-sm text-foreground truncate">{order.userName || 'Gast'}</div>
                      {order.userEmail && (
                        <div className="text-xs text-muted-foreground truncate">{order.userEmail}</div>
                      )}
                    </td>

                    {/* Amount — tablet: also shows customer + status as sub-text */}
                    <td className="px-3 lg:px-5 py-3 lg:py-4">
                      <span className="text-xs lg:text-sm font-semibold text-foreground whitespace-nowrap">
                        {formatSwissPriceWithCHF(order.total)}
                      </span>
                      {/* Sub-info shown only on tablet */}
                      <div className="lg:hidden mt-0.5 space-y-0.5">
                        <div className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                          {order.userName || 'Gast'}
                        </div>
                        <span className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                          Abgeschlossen
                        </span>
                      </div>
                    </td>

                    {/* Status — desktop only */}
                    <td className="hidden lg:table-cell px-5 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 whitespace-nowrap">
                        Abgeschlossen
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-3 lg:px-5 py-3 lg:py-4 text-right">
                      <Link
                        href={`/sales/orders/${order.id}`}
                        className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 transition-ios"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Details für Verkauf ${order.id.slice(-8).toUpperCase()}`}
                      >
                        <span className="hidden lg:inline text-sm font-medium">Details</span>
                        <ChevronRight className="w-4 h-4" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
