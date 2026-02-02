'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useResponsive } from '@/hooks'
import { useMyStore } from '@/hooks/queries/useMyStore'
import { CustomerService, type Customer } from '@/lib/services/customerService'
import { Users, Search, Mail, Phone, MapPin, ShoppingBag, TrendingUp, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { formatCHF } from '@/lib/invoice-utils'

export default function CustomersPage() {
  const { isMobile } = useResponsive()
  const router = useRouter()
  const { data: store, isLoading: storeLoading } = useMyStore()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])

  useEffect(() => {
    if (store?.id) {
      loadCustomers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.id])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = customers.filter(customer => {
        const query = searchQuery.toLowerCase()
        return (
          customer.name?.toLowerCase().includes(query) ||
          customer.email?.toLowerCase().includes(query) ||
          customer.phone?.toLowerCase().includes(query)
        )
      })
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchQuery, customers])

  const loadCustomers = async () => {
    if (!store?.id) return

    setIsLoading(true)
    try {
      console.log('🔍 Cargando clientes para tienda:', store.id)
      const result = await CustomerService.getCustomersByStore(store.id)
      console.log('📦 Resultado de clientes:', result)
      
      if (result.success && result.data) {
        // El backend retorna { success: true, data: Customer[], count: number }
        // result.data es un array directamente
        const customersList: Customer[] = Array.isArray(result.data) ? result.data : []
        
        console.log('✅ Clientes cargados:', customersList.length, customersList)
        setCustomers(customersList)
        setFilteredCustomers(customersList)
      } else {
        console.error('❌ Error al cargar clientes:', result.error)
        toast.error(result.error || 'Fehler beim Laden der Kunden')
      }
    } catch (error) {
      console.error('❌ Error loading customers:', error)
      toast.error('Fehler beim Laden der Kunden')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomerClick = (customerId: string) => {
    router.push(`/store/customers/${customerId}`)
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

  return (
    <div className="w-full h-full gpu-accelerated animate-fade-in">
      {/* Mobile Layout */}
      {isMobile && (
        <div className="w-full min-h-screen bg-[#F2EDE8] safe-area-bottom">
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

      {/* Desktop Layout */}
      {!isMobile && (
        <div className="w-full min-h-screen bg-[#F2EDE8] py-8">
          <div className="max-w-6xl mx-auto px-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                Kunden
              </h1>
              <p className="text-gray-500 text-base leading-relaxed">
                {customers.length} {customers.length === 1 ? 'Kunde' : 'Kunden'} in Ihrer Liste
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
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
              <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
                <div className="w-24 h-24 rounded-xl bg-brand-100 flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-brand-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {searchQuery ? 'Keine Ergebnisse' : 'Noch keine Kunden'}
                </h2>
                <p className="text-base text-gray-500">
                  {searchQuery
                    ? 'Versuchen Sie es mit einer anderen Suche'
                    : 'Kunden werden automatisch hinzugefügt, wenn sie in Ihrer Tienda kaufen'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleCustomerClick(customer.id)}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
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
