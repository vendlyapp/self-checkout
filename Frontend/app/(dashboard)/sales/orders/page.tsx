'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResponsive } from '@/hooks';
import { useOrders } from '@/hooks/queries/useOrders';
import {
  ShoppingCart,
  Calendar,
  User,
  ChevronRight,
  FileText,
  XCircle,
  Filter,
  CheckCircle,
  Clock,
  Trash2,
} from 'lucide-react';
import { formatSwissPriceWithCHF } from '@/lib/utils';
import Link from 'next/link';
import { Loader } from '@/components/ui/Loader';
import { useCancelOrder } from '@/hooks/mutations/useOrderMutations';
import CancelOrderModal from '@/components/orders/CancelOrderModal';
import { OrdersProvider, useOrdersContext } from '@/components/dashboard/orders/OrdersContext';

function SalesOrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile } = useResponsive();
  const cancelOrder = useCancelOrder();

  const statusFilter = searchParams?.get('status') as
    | 'pending'
    | 'processing'
    | 'completed'
    | 'cancelled'
    | undefined;

  const { data: orders = [], isLoading, isFetching, error: queryError } = useOrders({
    limit: 100,
    offset: 0,
    status: statusFilter,
  });

  const { searchQuery } = useOrdersContext();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<{ id: string; orderNumber: string } | null>(null);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

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

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Abgeschlossen',
          color: 'bg-green-100 text-green-700',
          iconColor: 'text-green-600',
          bgColor: 'bg-[#D3F6E4]',
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case 'pending':
        return {
          label: 'Ausstehend',
          color: 'bg-yellow-100 text-yellow-700',
          iconColor: 'text-yellow-600',
          bgColor: 'bg-[#FEF3C7]',
          icon: <Clock className="w-4 h-4" />,
        };
      case 'processing':
        return {
          label: 'In Bearbeitung',
          color: 'bg-blue-100 text-blue-700',
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          icon: <Clock className="w-4 h-4" />,
        };
      case 'cancelled':
        return {
          label: 'Storniert',
          color: 'bg-red-100 text-red-700',
          iconColor: 'text-red-600',
          bgColor: 'bg-[#FEE2E2]',
          icon: <XCircle className="w-4 h-4" />,
        };
      default:
        return {
          label: 'Abgeschlossen',
          color: 'bg-gray-100 text-gray-700',
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: <FileText className="w-4 h-4" />,
        };
    }
  };

  const handleCancelOrder = (orderId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOrderToCancel({ id: orderId, orderNumber: orderId.slice(-8).toUpperCase() });
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel || isConfirmingCancel) return;
    setIsConfirmingCancel(true);
    try {
      await cancelOrder.mutateAsync(orderToCancel.id);
      setCancelModalOpen(false);
      setOrderToCancel(null);
    } catch {
      // Error handled in hook; modal stays open for retry
    } finally {
      setIsConfirmingCancel(false);
    }
  };

  const handleCloseCancelModal = () => {
    if (!cancelOrder.isPending && !isConfirmingCancel) {
      setCancelModalOpen(false);
      setOrderToCancel(null);
    }
  };

  const loading = isLoading || isFetching;
  const error = queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null;

  if (loading && orders.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader size="lg" />
          <p className="text-muted-foreground font-medium">Bestellungen werden geladen...</p>
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

  const emptyLabel =
    statusFilter === 'cancelled'
      ? 'Noch keine stornierten Bestellungen'
      : statusFilter === 'completed'
      ? 'Noch keine abgeschlossenen Bestellungen'
      : 'Noch keine Bestellungen';

  /* ── Status filter buttons ───────────────────────────────────────── */
  const StatusFilters = () => (
    <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
      <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden />
      {[
        { label: 'Alle', href: '/sales/orders', active: !statusFilter },
        {
          label: 'Abgeschlossen',
          href: '/sales/orders?status=completed',
          active: statusFilter === 'completed',
          activeClass: 'bg-emerald-600 text-white shadow-sm',
        },
        {
          label: 'Storniert',
          href: '/sales/orders?status=cancelled',
          active: statusFilter === 'cancelled',
          activeClass: 'bg-red-600 text-white shadow-sm',
        },
      ].map(({ label, href, active, activeClass }) => (
        <button
          key={label}
          onClick={() => router.push(href)}
          className={`px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-xl text-xs lg:text-sm font-medium transition-ios ${
            active
              ? (activeClass ?? 'bg-primary text-primary-foreground shadow-sm')
              : 'bg-card text-muted-foreground hover:bg-muted border border-border'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  /* ── Mobile ─────────────────────────────────────────────────────── */
  if (isMobile) {
    return (
      <>
        <CancelOrderModal
          isOpen={cancelModalOpen}
          orderNumber={orderToCancel?.orderNumber}
          onClose={handleCloseCancelModal}
          onConfirm={handleConfirmCancel}
          isLoading={cancelOrder.isPending}
        />
        <div className="w-full h-full overflow-auto gpu-accelerated">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pt-[175px]">
              {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" aria-hidden />
                  <p className="text-gray-600 text-center text-lg font-medium">{emptyLabel}</p>
                </div>
              ) : (
                <div className="px-2 pb-24 space-y-3">
                  {filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] touch-target overflow-hidden"
                      >
                        <Link href={`/sales/orders/${order.id}`} className="block p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className={`w-12 h-12 ${statusConfig.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <div className={statusConfig.iconColor}>{statusConfig.icon}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-gray-500 font-mono font-semibold">
                                  #{order.id.slice(-8).toUpperCase()}
                                </span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                                  {statusConfig.label}
                                </span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden />
                                  <span className="truncate">{formatDate(order.createdAt)}</span>
                                </div>
                                {order.userName && (
                                  <div className="flex items-center gap-2 text-sm text-gray-700">
                                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden />
                                    <span className="truncate font-medium">{order.userName}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <p className={`font-bold text-lg ${statusConfig.iconColor}`}>
                                {formatSwissPriceWithCHF(order.total)}
                              </p>
                              <ChevronRight className="w-5 h-5 text-gray-400" aria-hidden />
                            </div>
                          </div>
                        </Link>
                        {order.status !== 'cancelled' && (
                          <div className="px-4 pb-3 border-t border-gray-100 pt-2">
                            <button
                              type="button"
                              onClick={(e) => handleCancelOrder(order.id, e)}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors touch-target active:scale-95"
                            >
                              <Trash2 className="w-4 h-4" />
                              Stornieren
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── Tablet + Desktop ───────────────────────────────────────────── */
  /*
   * Column visibility strategy (sidebar takes ~256px):
   *   md (768px) → ~472px available → show: Order+sub-info, Amount+sub-status, Actions
   *   lg (1024px) → ~728px available → show all columns
   */
  return (
    <>
      <CancelOrderModal
        isOpen={cancelModalOpen}
        orderNumber={orderToCancel?.orderNumber}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        isLoading={cancelOrder.isPending}
      />
      <div className="w-full h-full overflow-auto gpu-accelerated">
        <div className="px-4 pt-6 pb-8 lg:px-8 lg:pt-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">
                Bestellungen verwalten
              </h1>
              <p className="text-xs lg:text-sm text-muted-foreground mt-0.5">
                Alle Bestellungen anzeigen, Details einsehen und bei Bedarf stornieren
              </p>
            </div>
            <StatusFilters />
          </div>

          {/* Empty state */}
          {filteredOrders.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-10 text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" aria-hidden />
              <p className="text-muted-foreground text-sm font-medium">{emptyLabel}</p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <table className="w-full" role="grid" aria-label="Bestellungen">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    {/* Always visible */}
                    <th scope="col" className="px-3 lg:px-5 py-3 text-left text-[10px] lg:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Bestellung
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
                  {filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => router.push(`/sales/orders/${order.id}`)}
                      >
                        {/* Order ID — tablet: date + customer as sub-text */}
                        <td className="px-3 lg:px-5 py-3 lg:py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${statusConfig.bgColor}`}>
                              <span className={statusConfig.iconColor}>{statusConfig.icon}</span>
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-mono text-foreground whitespace-nowrap">
                                {order.id.slice(-8).toUpperCase()}
                              </span>
                              {/* Sub-info on tablet only */}
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

                        {/* Amount — tablet: customer + status badge as sub-text */}
                        <td className="px-3 lg:px-5 py-3 lg:py-4">
                          <span className="text-xs lg:text-sm font-semibold text-foreground whitespace-nowrap">
                            {formatSwissPriceWithCHF(order.total)}
                          </span>
                          {/* Sub-info on tablet only */}
                          <div className="lg:hidden mt-0.5 space-y-0.5">
                            <div className="text-[11px] text-muted-foreground truncate max-w-[110px]">
                              {order.userName || 'Gast'}
                            </div>
                            <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                        </td>

                        {/* Status — desktop only */}
                        <td className="hidden lg:table-cell px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-3 lg:px-5 py-3 lg:py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 lg:gap-2">
                            <Link
                              href={`/sales/orders/${order.id}`}
                              className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 transition-ios"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Details Bestellung ${order.id.slice(-8).toUpperCase()}`}
                            >
                              <span className="hidden lg:inline text-sm font-medium">Details</span>
                              <ChevronRight className="w-4 h-4" aria-hidden />
                            </Link>
                            {order.status !== 'cancelled' && (
                              <button
                                type="button"
                                onClick={(e) => handleCancelOrder(order.id, e)}
                                className="flex items-center justify-center gap-1 p-1.5 lg:px-2.5 lg:py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-ios"
                                aria-label={`Bestellung ${order.id.slice(-8).toUpperCase()} stornieren`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline text-sm font-medium">Stornieren</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function SalesOrdersPage() {
  return (
    <OrdersProvider>
      <SalesOrdersPageContent />
    </OrdersProvider>
  );
}
