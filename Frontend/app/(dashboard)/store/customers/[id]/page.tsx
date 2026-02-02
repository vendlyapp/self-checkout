'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useResponsive } from '@/hooks'
import { useMyStore } from '@/hooks/queries/useMyStore'
import { CustomerService, type Customer } from '@/lib/services/customerService'
import { Invoice } from '@/lib/services/invoiceService'
import { Mail, Phone, MapPin, ShoppingBag, TrendingUp, Calendar, FileText, ChevronRight, DollarSign, User } from 'lucide-react'
import { toast } from 'sonner'
import { formatCHF, formatDate } from '@/lib/invoice-utils'
import { formatSwissPriceWithCHF } from '@/lib/utils'
import Link from 'next/link'

export default function CustomerDetailPage() {
  const { isMobile } = useResponsive()
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string
  const { data: store, isLoading: storeLoading } = useMyStore()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (customerId && store?.id) {
      loadCustomerData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, store?.id])

  const loadCustomerData = async () => {
    if (!customerId || !store?.id) return

    setIsLoading(true)
    try {
      // Cargar datos del cliente
      const customerResult = await CustomerService.getCustomerById(customerId)
      if (customerResult.success && customerResult.data) {
        setCustomer(customerResult.data)
      } else {
        toast.error(customerResult.error || 'Kunde nicht gefunden')
        router.push('/store/customers')
        return
      }

      // Cargar facturas del cliente
      const invoicesResult = await CustomerService.getCustomerInvoices(customerId, store.id)
      if (invoicesResult.success && invoicesResult.data) {
        setInvoices(invoicesResult.data)
      } else {
        toast.error(invoicesResult.error || 'Fehler beim Laden der Rechnungen')
      }
    } catch (error) {
      console.error('Error loading customer data:', error)
      toast.error('Fehler beim Laden der Kundendaten')
    } finally {
      setIsLoading(false)
    }
  }

  const formatInvoiceDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  if (storeLoading || isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-screen bg-[#F2EDE8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Wird geladen...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return null
  }

  return (
    <div className="w-full h-full gpu-accelerated animate-fade-in">
      {/* Mobile Layout */}
      {isMobile && (
        <div className="w-full min-h-screen bg-[#F2EDE8] safe-area-bottom">
          <div className="px-4 py-6 pb-32 max-w-full mx-auto">
            {/* Customer Info Card */}
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

              {/* Stats */}
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

              {/* Dates */}
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

            {/* Invoices Section */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Rechnungen ({invoices.length})
              </h2>

              {invoices.length === 0 ? (
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
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-3 h-3" />
                          <span>{formatInvoiceDate(invoice.issuedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="w-3 h-3" />
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

      {/* Desktop Layout */}
      {!isMobile && (
        <div className="w-full min-h-screen bg-[#F2EDE8] py-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Info Sidebar */}
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

                  {/* Stats */}
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

                  {/* Dates */}
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

              {/* Invoices List */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Rechnungen ({invoices.length})
                </h2>

                {invoices.length === 0 ? (
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
                        {/* Header Row */}
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

                        {/* Info Grid */}
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{formatInvoiceDate(invoice.issuedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="w-4 h-4" />
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
