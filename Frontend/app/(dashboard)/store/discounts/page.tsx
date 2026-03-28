'use client'

import { useState } from 'react'
import DiscountsList from '@/components/dashboard/discounts/DiscountsList'
import CreateDiscountModal, { DiscountFormData } from '@/components/dashboard/discounts/CreateDiscountModal'
import { useResponsive } from '@/hooks'
import { Plus } from 'lucide-react'
import { useCreateDiscountCode } from '@/hooks/queries/useDiscountCodes'

export default function DiscountsPage() {
  const { isMobile } = useResponsive()
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

  const createButton = (
    <button
      onClick={handleCreateDiscount}
      className="w-full bg-primary text-primary-foreground rounded-xl py-4 px-6 font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 transition-ios active:scale-[0.98]"
      aria-label="Neuen Rabattcode erstellen"
    >
      <Plus className="w-5 h-5" />
      <span>Neuen Rabattcode erstellen</span>
    </button>
  )

  const createButtonDesktop = (
    <button
      onClick={handleCreateDiscount}
      className="w-full max-w-md bg-primary text-primary-foreground rounded-xl py-3 md:py-3 lg:py-4 px-5 md:px-6 font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 transition-ios active:scale-[0.98] text-sm md:text-sm lg:text-base"
      aria-label="Neuen Rabattcode erstellen"
    >
      <Plus className="w-5 h-5" />
      <span>Neuen Rabattcode erstellen</span>
    </button>
  )

  return (
    <div className="w-full min-w-0 flex flex-col h-full min-h-0 min-w-0">
      {isMobile && (
        <div className="flex-1 min-h-0 min-w-0 flex flex-col">
          <DiscountsList
            stickyPrefix={createButton}
            scrollAreaClassName="safe-area-bottom pb-28"
          />
        </div>
      )}

      {!isMobile && (
        <div className="flex-1 min-h-0 min-w-0 flex flex-col max-w-6xl mx-auto w-full px-4 md:px-6 lg:p-8">
          <DiscountsList
            stickyPrefix={
              <>
                <div className="min-w-0 mb-2">
                  <h1 className="text-xl md:text-xl lg:text-2xl font-bold text-foreground tracking-tight">
                    Rabatte & Codes
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm md:text-sm lg:text-base">
                    Verwalten Sie Ihre Rabattcodes und Angebote
                  </p>
                </div>
                {createButtonDesktop}
              </>
            }
          />
        </div>
      )}

      <CreateDiscountModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreate={handleCreate}
      />
    </div>
  )
}

