'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useResponsive } from '@/hooks'
import { useMyStore } from '@/hooks/queries/useMyStore'
import { CustomerService, type Customer } from '@/lib/services/customerService'
import { Users, Search, Mail, Phone, MapPin, ShoppingBag, TrendingUp, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { formatCHF } from '@/lib/invoice-utils'
import { Loader } from '@/components/ui/Loader'

export default function CustomersPage() {
  const { isMobile } = useResponsive()
  const router = useRouter()
  const { data: store, isLoading: storeLoading } = useMyStore()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ['customers', store?.id],
    queryFn: async () => {
      const result = await CustomerService.getCustomersByStore(store!.id)
      if (!result.success) throw new Error(result.error || 'Fehler beim Laden der Kunden')
      return Array.isArray(result.data) ? result.data : []
    },
    enabled: !!store?.id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    throwOnError: false,
    meta: {
      onError: () => toast.error('Fehler beim Laden der Kunden'),
    },
  })

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers
    const q = searchQuery.toLowerCase()
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
    )
  }, [searchQuery, customers])

  const handleCustomerClick = (customerId: string) => {
    router.push(`/store/customers/${customerId}`)
  }

  const isLoading = storeLoading || customersLoading

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-dvh bg-[#F2EDE8]">
        <div className="text-center">
          <Loader size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Wird geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-w-0 animate-fade-in">
      {/* Mobile Layout */}
      {isMobile && (
        <div className="w-full min-h-dvh bg-[#F2EDE8] safe-area-bottom">
          <div className="px-4 py-6 pb-32 max-w-full mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">
                Kunden
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                {customers.length} {customers.length === 1 ? 'Kunde' : 'Kunden'} in Ihrer Liste
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Kunden suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Customers List */}
            {filteredCustomers.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
                <div className="w-20 h-20 rounded-xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-brand-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'Keine Ergebnisse' : 'Noch keine Kunden'}
                </h2>
                <p className="text-sm text-gray-500">
                  {searchQuery
                    ? 'Versuchen Sie es mit einer anderen Suche'
                    : 'Kunden werden automatisch hinzugefügt, wenn sie in Ihrer Tienda kaufen'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleCustomerClick(customer.id)}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          {customer.name || 'Unbekannter Kunde'}
                        </h3>
                        <div className="flex flex-col gap-1.5">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          {customer.address && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{customer.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>

                    <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {customer.totalOrders}
                        </span>
                        <span className="text-xs text-gray-500">
                          {customer.totalOrders === 1 ? 'Bestellung' : 'Bestellungen'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-brand-600" />
                        <span className="text-sm font-semibold text-brand-600">
                          {formatCHF(customer.totalSpent)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tablet + Desktop Layout */}
      {!isMobile && (
        <div className="w-full min-h-dvh bg-[#F2EDE8] pt-8 md:pt-10 pb-8 lg:py-10">
          <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-xl md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 tracking-tight mb-1.5 md:mb-2">
                Kunden
              </h1>
              <p className="text-gray-500 text-sm md:text-sm lg:text-base leading-relaxed">
                {customers.length} {customers.length === 1 ? 'Kunde' : 'Kunden'} in Ihrer Liste
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-5 md:mb-6">
              <div className="relative max-w-full md:max-w-xs lg:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Kunden suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Customers Grid */}
            {filteredCustomers.length === 0 ? (
              <div className="bg-white rounded-xl p-8 md:p-10 lg:p-12 shadow-sm border border-gray-200 text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-brand-100 flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <Users className="w-10 h-10 md:w-12 md:h-12 text-brand-600" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">
                  {searchQuery ? 'Keine Ergebnisse' : 'Noch keine Kunden'}
                </h2>
                <p className="text-sm md:text-base text-gray-500">
                  {searchQuery
                    ? 'Versuchen Sie es mit einer anderen Suche'
                    : 'Kunden werden automatisch hinzugefügt, wenn sie in Ihrer Tienda kaufen'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleCustomerClick(customer.id)}
                    className="bg-white rounded-xl p-4 md:p-5 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="mb-3 md:mb-4">
                      <h3 className="text-base md:text-base lg:text-lg font-semibold text-gray-900 mb-1.5 md:mb-2">
                        {customer.name || 'Unbekannter Kunde'}
                      </h3>
                      <div className="space-y-2">
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{customer.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {customer.totalOrders} {customer.totalOrders === 1 ? 'Bestellung' : 'Bestellungen'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-brand-600" />
                        <span className="text-sm font-semibold text-brand-600">
                          {formatCHF(customer.totalSpent)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
