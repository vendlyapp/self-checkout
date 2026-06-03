'use client'

import { useRouter } from 'next/navigation'
import { useResponsive } from '@/hooks'
import { Mail, Phone, MapPin, ShoppingBag, TrendingUp, Calendar, FileText, ChevronRight, Banknote, User } from 'lucide-react'
import { toast } from 'sonner'
import { formatCHF, formatDate } from '@/lib/invoice-utils'
import { formatSwissPriceWithCHF } from '@/lib/utils'
import Link from 'next/link'
import { DashboardLoadingState } from '@/components/ui/DashboardLoadingState'
import { useCustomer } from '@/hooks/queries/useCustomer'
import { useCustomerInvoices } from '@/hooks/queries/useCustomerInvoices'
import { isInitialQueryLoading } from '@/hooks/queries/useStoreQueryScope'
import { useEffect } from 'react'

interface CustomerDetailClientProps {
  customerId: string
}

export default function CustomerDetailClient({ customerId }: CustomerDetailClientProps) {
  const { isMobile } = useResponsive()
  const router = useRouter()

  const {
    data: customer,
    isFetched: customerFetched,
    isFetching: customerFetching,
    error: customerError,
  } = useCustomer(customerId)

  const {
    data: invoices = [],
    isFetched: invoicesFetched,
    isFetching: invoicesFetching,
  } = useCustomerInvoices(customerId)

  useEffect(() => {
    if (customerError) {
      toast.error(
        customerError instanceof Error ? customerError.message : 'Kunde nicht gefunden'
      )
      router.push('/store/customers')
    }
  }, [customerError, router])

  const customerLoading =
    isInitialQueryLoading(customerFetched, customerFetching) && !customer;

  const invoicesSectionLoading = isInitialQueryLoading(invoicesFetched, invoicesFetching);

  const formatInvoiceDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('de-CH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  if (customerLoading) {
    return <DashboardLoadingState mode="page" message="Kundendaten werden geladen..." />
  }

  if (!customer) {
    return null
  }

  return (
    <div className="w-full h-full min-w-0 animate-fade-in">
      {/* Mobile Layout */}
      {isMobile && (
        <div className="w-full min-h-dvh bg-[#F2EDE8] safe-area-bottom">
          <div className="px-4 py-6 pb-32 max-w-full mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {customer.name || 'Unbekannter Kunde'}
              </h1>
              <div className="space-y-3 mb-6">
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-700 block">{customer.address}</span>
                      {(customer.city || customer.postalCode) && (
                        <span className="text-sm text-gray-500">
                          {customer.postalCode} {customer.city}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                    <span className="text-2xl font-bold text-gray-900">{customer.totalOrders}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {customer.totalOrders === 1 ? 'Bestellung' : 'Bestellungen'}
                  </span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-brand-600" />
                    <span className="text-2xl font-bold text-brand-600">
                      {formatCHF(customer.totalSpent)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">Gesamt</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Erste Bestellung</span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(customer.firstPurchaseAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Letzte Bestellung</span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(customer.lastPurchaseAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Rechnungen ({invoicesSectionLoading ? '…' : invoices.length})
              </h2>
              {invoicesSectionLoading ? (
                <DashboardLoadingState mode="section" message="Rechnungen werden geladen..." />
              ) : invoices.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Noch keine Rechnungen</p>
                </div>
              ) : (
                <div className="px-4 pb-24 space-y-3">
                  {invoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/sales/invoices/${invoice.id}`}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 active:shadow-md transition-all p-4 block touch-target"
                    >
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
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span>{formatInvoiceDate(invoice.issuedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Banknote className="w-3 h-3" />
                          <span className="font-semibold text-gray-900">
                            {formatSwissPriceWithCHF(invoice.total)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="w-full min-h-dvh bg-[#F2EDE8] py-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    {customer.name || 'Unbekannter Kunde'}
                  </h1>
                  <div className="space-y-4 mb-6">
                    {customer.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-700">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-700">{customer.phone}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm text-gray-700 block">{customer.address}</span>
                          {(customer.city || customer.postalCode) && (
                            <span className="text-sm text-gray-500">
                              {customer.postalCode} {customer.city}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        <span className="text-2xl font-bold text-gray-900">{customer.totalOrders}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {customer.totalOrders === 1 ? 'Bestellung' : 'Bestellungen'}
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-brand-600" />
                        <span className="text-2xl font-bold text-brand-600">
                          {formatCHF(customer.totalSpent)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">Gesamt</span>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Erste Bestellung</span>
                      <span className="text-gray-900 font-medium">
                        {formatDate(customer.firstPurchaseAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Letzte Bestellung</span>
                      <span className="text-gray-900 font-medium">
                        {formatDate(customer.lastPurchaseAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Rechnungen ({invoicesSectionLoading ? '…' : invoices.length})
                </h2>
                {invoicesSectionLoading ? (
                  <DashboardLoadingState mode="section" message="Rechnungen werden geladen..." />
                ) : invoices.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-base text-gray-500">Noch keine Rechnungen</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <Link
                        key={invoice.id}
                        href={`/sales/invoices/${invoice.id}`}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 block"
                      >
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="w-14 h-14 rounded-xl bg-[#25D076]/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-7 h-7 text-[#25D076]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
                                {invoice.invoiceNumber}
                              </h3>
                              <p className="text-sm text-gray-600 truncate">
                                {invoice.customerName || 'Kein Kundenname'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{formatInvoiceDate(invoice.issuedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Banknote className="w-4 h-4" />
                            <span className="font-semibold text-gray-900">
                              {formatSwissPriceWithCHF(invoice.total)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4" />
                            <span className="truncate">{invoice.customerEmail || '-'}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
