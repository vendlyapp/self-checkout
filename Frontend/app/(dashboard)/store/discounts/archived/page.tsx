'use client'

import { useState } from 'react'
import HeaderNav from '@/components/navigation/HeaderNav'
import DiscountCodeCard from '@/components/dashboard/discounts/DiscountCodeCard'
import { useResponsive } from '@/hooks'
import { useArchivedDiscountCodes } from '@/hooks/queries/useDiscountCodes'
import { DiscountCode } from '@/components/dashboard/discounts/types'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ArchivedDiscountsPage() {
  const { isDesktop } = useResponsive()
  const router = useRouter()
  const { data: archivedCodes = [], isLoading } = useArchivedDiscountCodes()

  const handleBack = () => {
    router.push('/store/discounts')
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#25D076]"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-auto gpu-accelerated">
      {/* Mobile Layout */}
      {!isDesktop && (
        <div className="flex flex-col h-full">
          <HeaderNav
            title="Archivierte Codes"
            closeDestination="/store/discounts"
          />
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Zurück zu Rabatte & Codes</span>
            </button>

            {/* Archived Codes List */}
            {archivedCodes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Keine archivierten Codes vorhanden
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {archivedCodes.map((code: DiscountCode) => (
                  <DiscountCodeCard
                    key={code.id}
                    code={code}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      {isDesktop && (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Zurück zu Rabatte & Codes</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight transition-interactive">
              Archivierte Codes
            </h1>
            <p className="text-gray-500 mt-2 text-base transition-interactive">
              Verwalten Sie Ihre archivierten Rabattcodes
            </p>
          </div>

          {/* Archived Codes List */}
          {archivedCodes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Keine archivierten Codes vorhanden
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {archivedCodes.map((code: DiscountCode) => (
                <DiscountCodeCard
                  key={code.id}
                  code={code}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

