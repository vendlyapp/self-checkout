'use client'

import { useState } from 'react'
import HeaderNav from '@/components/navigation/HeaderNav'
import DiscountsList from '@/components/dashboard/discounts/DiscountsList'
import CreateDiscountModal, { DiscountFormData } from '@/components/dashboard/discounts/CreateDiscountModal'
import { useResponsive } from '@/hooks'
import { Plus } from 'lucide-react'
import { useCreateDiscountCode } from '@/hooks/queries/useDiscountCodes'

export default function DiscountsPage() {
  const { isDesktop } = useResponsive()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const createMutation = useCreateDiscountCode()

  const handleCreateDiscount = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    if (!createMutation.isPending) {
      setIsModalOpen(false)
    }
  }

  const handleCreate = (data: DiscountFormData) => {
    createMutation.mutate({
      code: data.code,
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxRedemptions: data.maxRedemptions,
      validFrom: data.validFrom,
      validUntil: data.validUntil || null,
      isActive: true,
    }, {
      onSuccess: () => {
        setIsModalOpen(false)
      }
    })
  }

  return (
    <div className="w-full h-full overflow-auto gpu-accelerated">
      {/* Mobile Layout */}
      {!isDesktop && (
        <div className="flex flex-col h-full">
          <HeaderNav
            title="Rabatte & Codes"
            closeDestination="/store"
          />
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Create Button */}
            <button
              onClick={handleCreateDiscount}
              className="w-full bg-[#25D076] text-white rounded-xl py-4 px-6 font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-[#20B866] transition-colors active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>Neuen Rabattcode erstellen</span>
            </button>

            {/* Discounts List */}
            <DiscountsList />
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      {isDesktop && (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight transition-interactive">
              Rabatte & Codes
            </h1>
            <p className="text-gray-500 mt-2 text-base transition-interactive">
              Verwalten Sie Ihre Rabattcodes und Angebote
            </p>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateDiscount}
            className="w-full max-w-md bg-[#25D076] text-white rounded-xl py-4 px-6 font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-[#20B866] transition-colors active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Neuen Rabattcode erstellen</span>
          </button>

          {/* Discounts List */}
          <DiscountsList />
        </div>
      )}

      {/* Create Discount Modal */}
      <CreateDiscountModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreate={handleCreate}
      />
    </div>
  )
}

