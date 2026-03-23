'use client';

import { useParams, useRouter } from 'next/navigation';
import { useResponsive } from '@/hooks';
import { useOrder } from '@/hooks/queries/useOrder';
import { useInvoicesByOrderId } from '@/hooks/queries/useInvoicesByOrderId';
import { AlertCircle, ShoppingCart, FileText, Calendar, User, Package, XCircle, ExternalLink, CheckCircle, Clock, Trash2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '@/components/ui/Loader';
import { formatSwissPriceWithCHF } from '@/lib/utils';
import { getAvailablePaymentMethod } from '@/lib/constants/paymentMethods';
import Link from 'next/link';
import { useCancelOrder, useConfirmQRPayment } from '@/hooks/mutations/useOrderMutations';
import { useEffect, useState } from 'react';
import CancelOrderModal from '@/components/orders/CancelOrderModal';

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const orderId = params.id as string;
  const cancelOrder = useCancelOrder();
  const confirmQrPayment = useConfirmQRPayment();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  
  // Usar React Query hooks para obtener orden e invoices con cache
  const { data: order, isLoading: orderLoading, error: orderError, isFetching: orderFetching } = useOrder(orderId);
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoicesByOrderId(orderId);

  // Mostrar toast de error si hay error
  useEffect(() => {
    if (orderError) {
      const errorMessage = orderError instanceof Error ? orderError.message : 'Bestellung nicht gefunden';
      toast.error(errorMessage);
    }
  }, [orderError]);

  const loading = orderLoading || orderFetching;
  const error = orderError instanceof Error ? orderError.message : orderError ? String(orderError) : null;

  /** Muestra el método de pago con formato correcto (ej. qr-rechnung → QR-Rechnung) */
  const formatPaymentMethodDisplay = (code: string | undefined | null) => {
    if (code == null || typeof code !== 'string') return '—';
    const known = getAvailablePaymentMethod(code);
    if (known?.displayName) return known.displayName;
    return code
      .split('-')
      .map((part) =>
        part.length <= 3 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      )
      .join('-');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-CH', {
        year: 'numeric',
        month: 'long',
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
          icon: <CheckCircle className="w-5 h-5" />
        };
      case 'pending':
        return { 
          label: 'Ausstehend', 
          color: 'bg-yellow-100 text-yellow-700', 
          iconColor: 'text-yellow-600',
          bgColor: 'bg-[#FEF3C7]',
          icon: <Clock className="w-5 h-5" />
        };
      case 'processing':
        return { 
          label: 'In Bearbeitung', 
          color: 'bg-blue-100 text-blue-700', 
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          icon: <Clock className="w-5 h-5" />
        };
      case 'cancelled':
        return { 
          label: 'Storniert', 
          color: 'bg-red-100 text-red-700', 
          iconColor: 'text-red-600',
          bgColor: 'bg-[#FEE2E2]',
          icon: <XCircle className="w-5 h-5" />
        };
      default:
        return { 
          label: 'Abgeschlossen', 
          color: 'bg-gray-100 text-gray-700', 
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: <FileText className="w-5 h-5" />
        };
    }
  };

  const handleOpenCancelModal = () => {
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    if (!cancelOrder.isPending) {
      setIsCancelModalOpen(false);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      await cancelOrder.mutateAsync(orderId);
      setIsCancelModalOpen(false);
      router.push('/sales/orders');
    } catch {
      // Error ya se maneja en el hook
      // El modal se mantiene abierto si hay error para que el usuario pueda intentar de nuevo
    }
  };

  const handleConfirmPayment = async () => {
    try {
      await confirmQrPayment.mutateAsync(orderId);
    } catch {
      // Toast en el hook
    }
  };

  if (loading && !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader size="lg" />
        <p className="text-gray-600 font-medium mt-4">Bestellung wird geladen...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="w-full h-full">
        {isMobile && (
          <div className="w-full p-4">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Bestellung nicht gefunden</h2>
                <p className="text-gray-600 mb-6">{error || 'Die angeforderte Bestellung konnte nicht gefunden werden.'}</p>
                <button
                  onClick={() => router.push('/sales/orders')}
                  className="w-full bg-[#25D076] hover:bg-[#25D076]/90 text-white rounded-xl py-3 px-6 font-semibold transition-colors touch-target"
                >
                  Zurück zu Bestellungen
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bestellung nicht gefunden</h2>
              <p className="text-gray-600 mb-6">{error || 'Die angeforderte Bestellung konnte nicht gefunden werden.'}</p>
              <button
                onClick={() => router.push('/sales/orders')}
                className="bg-[#25D076] hover:bg-[#25D076]/90 text-white rounded-xl py-3 px-6 font-semibold transition-colors"
              >
                Zurück zu Bestellungen
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!order) return null;

  const orderShortId =
    order.id != null && String(order.id).length > 0
      ? String(order.id).slice(-8).toUpperCase()
      : '—';

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="w-full h-full overflow-auto gpu-accelerated">
      {isMobile && (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto pb-24">
            <div className="px-4 pt-4 space-y-4">
              {/* Header Card con Estado */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header con icono de estado */}
                <div className={`${statusConfig.bgColor} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <div className={statusConfig.iconColor}>
                          {statusConfig.icon}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Bestellnummer</div>
                        <div className="text-base font-bold text-gray-900 font-mono">
                          #{orderShortId}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.color} bg-white`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Información principal */}
                <div className="p-4 space-y-4">
                  {/* Monto destacado */}
                  <div className="text-center py-3 border-b border-gray-100">
                    <div className="text-xs text-gray-600 mb-1">Gesamtbetrag</div>
                    <div className={`text-3xl font-bold ${statusConfig.iconColor}`}>
                      {formatSwissPriceWithCHF(order.total)}
                    </div>
                  </div>

                  {/* Información de la orden */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-600 mb-0.5">Datum & Uhrzeit</div>
                        <div className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</div>
                      </div>
                    </div>

                    {order.userName && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-600 mb-0.5">Kunde</div>
                          <div className="text-sm font-medium text-gray-900">{order.userName}</div>
                          {order.userEmail && (
                            <div className="text-xs text-gray-500 mt-0.5">{order.userEmail}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {order.paymentMethod && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-600 mb-0.5">Zahlungsmethode</div>
                          <div className="text-sm font-medium text-gray-900">{formatPaymentMethodDisplay(order.paymentMethod)}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {order.status === 'pending' && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 space-y-3">
                      <p className="text-xs text-amber-900/90 leading-relaxed">
                        Wenn die Zahlung auf Ihrem Konto eingegangen ist, bestätigen Sie sie hier. Die Bestellung wird als abgeschlossen markiert.
                      </p>
                      <button
                        type="button"
                        onClick={handleConfirmPayment}
                        disabled={confirmQrPayment.isPending}
                        className="w-full flex items-center justify-center gap-2 bg-[#25D076] hover:bg-[#20B865] disabled:opacity-60 text-white rounded-xl py-3 px-4 font-semibold transition-colors touch-target active:scale-[0.98] shadow-sm"
                      >
                        {confirmQrPayment.isPending ? (
                          <Loader size="sm" color="white" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                        <span>{confirmQrPayment.isPending ? 'Wird bestätigt…' : 'Zahlung bestätigen'}</span>
                      </button>
                    </div>
                  )}

                  {/* Botón de cancelar */}
                  {order.status !== 'cancelled' && (
                    <button
                      onClick={handleOpenCancelModal}
                      className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl py-3 px-4 font-semibold transition-colors touch-target active:scale-95 border border-red-200"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Bestellung stornieren</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-gray-600" />
                      Produkte ({order.items.length})
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {order.items.map((item, index) => (
                      <div 
                        key={item.id || index} 
                        className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 mb-1">
                            {item.productName || 'Produkt'}
                          </div>
                          {item.productSku && (
                            <div className="text-xs text-gray-500 mb-2">{item.productSku}</div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">{item.quantity}</span>
                            <span>×</span>
                            <span>{formatSwissPriceWithCHF(item.price)}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold text-gray-900">
                            {formatSwissPriceWithCHF(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Total */}
                    <div className="pt-3 mt-3 border-t-2 border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-gray-900">Gesamtbetrag</span>
                        <span className={`text-2xl font-bold ${statusConfig.iconColor}`}>
                          {formatSwissPriceWithCHF(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Invoices */}
              {invoicesLoading ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-center py-8">
                    <Loader size="md" />
                  </div>
                </div>
              ) : invoices.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      Rechnungen ({invoices.length})
                    </h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {invoices.map((invoice) => (
                      <Link
                        key={invoice.id}
                        href={`/sales/invoices/${invoice.id}`}
                        className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all touch-target active:scale-[0.98] border border-gray-100 hover:border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-1">{invoice.invoiceNumber}</div>
                            <div className="text-xs text-gray-500">
                              {formatDate(invoice.issuedAt)}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-base font-bold text-gray-900">
                              {formatSwissPriceWithCHF(invoice.total)}
                            </span>
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                              <ExternalLink className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Keine Rechnung für diese Bestellung</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="p-4 max-w-5xl mx-auto min-w-0 lg:p-6">
          {/* Header mejorado - compacto en tablet */}
          <div className="mb-4 lg:mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6 overflow-hidden">
              <div className="flex items-center justify-between gap-3 min-w-0">
                <div className="flex items-center gap-3 lg:gap-4 min-w-0 flex-1">
                  <div className={`w-12 h-12 lg:w-16 lg:h-16 flex-shrink-0 ${statusConfig.bgColor} rounded-xl flex items-center justify-center`}>
                    <div className={`${statusConfig.iconColor} [&>svg]:w-4 [&>svg]:h-4 lg:[&>svg]:w-5 lg:[&>svg]:h-5`}>
                      {statusConfig.icon}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-0.5 lg:mb-1 truncate">Bestellung</h1>
                    <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                      <span className="text-xs lg:text-sm font-mono text-gray-600 truncate">
                        #{orderShortId}
                      </span>
                      <span className="text-gray-400 flex-shrink-0">•</span>
                      <span className="text-xs lg:text-sm text-gray-600 truncate">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0 flex-wrap justify-end">
                  <span className={`px-2.5 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-semibold whitespace-nowrap ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                  {order.status === 'pending' && (
                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      disabled={confirmQrPayment.isPending}
                      className="flex items-center gap-1.5 lg:gap-2 bg-[#25D076] hover:bg-[#20B865] disabled:opacity-60 text-white rounded-xl py-2 px-3 lg:py-2.5 lg:px-4 font-semibold transition-colors text-xs lg:text-sm shadow-sm"
                    >
                      {confirmQrPayment.isPending ? (
                        <Loader size="sm" color="white" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
                      )}
                      <span>Zahlung bestätigen</span>
                    </button>
                  )}
                  {order.status !== 'cancelled' && (
                    <button
                      onClick={handleOpenCancelModal}
                      className="flex items-center gap-1.5 lg:gap-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl py-2 px-3 lg:py-2.5 lg:px-4 font-semibold transition-colors border border-red-200 text-xs lg:text-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Stornieren</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Monto destacado */}
              <div className="mt-4 pt-4 lg:mt-6 lg:pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-xs lg:text-sm text-gray-600 mb-1 lg:mb-2">Gesamtbetrag</div>
                  <div className={`text-2xl lg:text-4xl font-bold ${statusConfig.iconColor}`}>
                    {formatSwissPriceWithCHF(order.total)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6 min-w-0">
            {/* Order Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6 overflow-hidden min-w-0">
              <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 flex-shrink-0" />
                <span className="truncate">Bestellinformationen</span>
              </h2>
              <div className="space-y-3 lg:space-y-4">
                {order.userName && (
                  <div className="flex items-start gap-2 lg:gap-3 p-2.5 lg:p-3 bg-gray-50 rounded-xl min-w-0">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-600 mb-0.5">Kunde</div>
                      <div className="text-xs lg:text-sm font-semibold text-gray-900 truncate">{order.userName}</div>
                      {order.userEmail && (
                        <div className="text-xs text-gray-500 mt-0.5 truncate">{order.userEmail}</div>
                      )}
                    </div>
                  </div>
                )}
                {order.paymentMethod && (
                  <div className="flex items-start gap-2 lg:gap-3 p-2.5 lg:p-3 bg-gray-50 rounded-xl min-w-0">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-600 mb-0.5">Zahlungsmethode</div>
                      <div className="text-xs lg:text-sm font-semibold text-gray-900 truncate">{formatPaymentMethodDisplay(order.paymentMethod)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6 overflow-hidden min-w-0">
              <h2 className="text-base lg:text-lg font-bold text-gray-900 mb-3 lg:mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 flex-shrink-0" />
                <span className="truncate">Rechnungen ({invoices.length})</span>
              </h2>
              {invoicesLoading ? (
                <div className="flex items-center justify-center py-6 lg:py-8">
                  <Loader size="md" />
                </div>
              ) : invoices.length > 0 ? (
                <div className="space-y-1.5 lg:space-y-2">
                  {invoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/sales/invoices/${invoice.id}`}
                      className="block p-3 lg:p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-100 hover:border-gray-200 hover:shadow-sm min-w-0"
                    >
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 mb-0.5 lg:mb-1 text-sm lg:text-base truncate">{invoice.invoiceNumber}</div>
                          <div className="text-xs lg:text-sm text-gray-500 truncate">
                            {formatDate(invoice.issuedAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                          <span className="text-base lg:text-lg font-bold text-gray-900 whitespace-nowrap">
                            {formatSwissPriceWithCHF(invoice.total)}
                          </span>
                          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                            <ExternalLink className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 lg:py-8">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
                    <FileText className="w-6 h-6 lg:w-8 lg:h-8 text-gray-300" />
                  </div>
                  <p className="text-xs lg:text-sm text-gray-600 font-medium">Keine Rechnung für diese Bestellung</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-w-0">
              <div className="bg-gray-50 px-4 py-3 lg:px-6 lg:py-4 border-b border-gray-200">
                <h2 className="text-base lg:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 flex-shrink-0" />
                  <span className="truncate">Produkte ({order.items.length})</span>
                </h2>
              </div>
              <div className="p-4 lg:p-6">
                <div className="space-y-2 lg:space-y-3">
                  {order.items.map((item, index) => (
                    <div 
                      key={item.id || index} 
                      className="flex items-start justify-between gap-2 lg:gap-4 p-3 lg:p-4 bg-gray-50 rounded-xl border border-gray-100 min-w-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 mb-0.5 lg:mb-1 text-sm lg:text-base truncate">
                          {item.productName || 'Produkt'}
                        </div>
                        {item.productSku && (
                          <div className="text-xs text-gray-500 mb-1 lg:mb-2 truncate">{item.productSku}</div>
                        )}
                        <div className="flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm text-gray-600 flex-wrap">
                          <span className="font-medium">{item.quantity}</span>
                          <span>×</span>
                          <span>{formatSwissPriceWithCHF(item.price)}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-base lg:text-xl font-bold text-gray-900 whitespace-nowrap">
                          {formatSwissPriceWithCHF(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Total */}
                <div className="mt-4 pt-4 lg:mt-6 lg:pt-6 border-t-2 border-gray-200">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-sm lg:text-lg font-semibold text-gray-900">Gesamtbetrag</span>
                    <span className={`text-xl lg:text-3xl font-bold whitespace-nowrap ${statusConfig.iconColor}`}>
                      {formatSwissPriceWithCHF(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        orderNumber={order?.id != null && String(order.id).length > 0 ? String(order.id).slice(-8).toUpperCase() : undefined}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        isLoading={cancelOrder.isPending}
      />
    </div>
  );
}

