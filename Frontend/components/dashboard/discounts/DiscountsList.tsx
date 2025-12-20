'use client'

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import DiscountStatsCards from './DiscountStatsCards'
import DiscountCodeCard from './DiscountCodeCard'
import { useDiscountCodes, useDiscountCodeStats, useDeleteDiscountCode, useUpdateDiscountCode } from '@/hooks/queries/useDiscountCodes'
import { DiscountCode } from './types'
import DeleteDiscountCodeModal from './DeleteDiscountCodeModal'
import CreateDiscountModal, { DiscountFormData } from './CreateDiscountModal'

export default function DiscountsList() {
  const { data: discountCodes = [], isLoading } = useDiscountCodes()
  const { data: stats } = useDiscountCodeStats()
  const deleteMutation = useDeleteDiscountCode()
  const updateMutation = useUpdateDiscountCode()
  const [deletingCode, setDeletingCode] = useState<DiscountCode | null>(null)
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let container = document.getElementById('global-modals-container')
      if (!container) {
        container = document.createElement('div')
        container.id = 'global-modals-container'
        document.body.appendChild(container)
      }
      setModalContainer(container)
    }
  }, [])

  const handleEdit = (code: DiscountCode) => {
    setEditingCode(code)
    setIsCreateModalOpen(true)
  }

  const handleCloseEditModal = () => {
    if (!updateMutation.isPending) {
      setIsCreateModalOpen(false)
      setEditingCode(null)
    }
  }

  const handleUpdate = (id: string, data: DiscountFormData) => {
    updateMutation.mutate({
      id,
      data: {
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxRedemptions: data.maxRedemptions,
        validFrom: data.validFrom,
        validUntil: data.validUntil || null,
      }
    }, {
      onSuccess: () => {
        setIsCreateModalOpen(false)
        setEditingCode(null)
      }
    })
  }

  const handleCreate = (data: DiscountFormData) => {
    // This will be handled by the parent component
    console.log('Create from list:', data)
  }

  const handleDelete = (code: DiscountCode) => {
    setDeletingCode(code)
  }

  const handleConfirmDelete = () => {
    if (deletingCode) {
      deleteMutation.mutate(deletingCode.id)
      setDeletingCode(null)
    }
  }

  const handleCancelDelete = () => {
    setDeletingCode(null)
  }

  const displayStats = useMemo(() => {
    if (stats) {
      return stats
    }
    // Fallback si no hay stats
    const total = discountCodes.length
    const active = discountCodes.filter((code) => code.status === 'active').length
    const inactive = discountCodes.filter((code) => code.status === 'inactive').length
    return { total, active, inactive }
  }, [stats, discountCodes])

  // Filtrar códigos según el filtro activo
  const filteredCodes = useMemo(() => {
    if (activeFilter === 'all') {
      return discountCodes
    }
    return discountCodes.filter((code) => code.status === activeFilter)
  }, [discountCodes, activeFilter])

  const handleFilterChange = (filter: 'all' | 'active' | 'inactive') => {
    setActiveFilter(filter)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#25D076]"></div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards - Ahora son filtros */}
        <DiscountStatsCards 
          stats={displayStats} 
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />

        {/* Codes List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeFilter === 'all' && `Alle Codes (${filteredCodes.length})`}
              {activeFilter === 'active' && `Aktive Codes (${filteredCodes.length})`}
              {activeFilter === 'inactive' && `Inaktive Codes (${filteredCodes.length})`}
            </h2>
            <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Archiv
            </button>
          </div>

          {filteredCodes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {discountCodes.length === 0 
                  ? 'No hay códigos de descuento creados aún'
                  : activeFilter === 'active'
                  ? 'No hay códigos activos'
                  : activeFilter === 'inactive'
                  ? 'No hay códigos inactivos'
                  : 'No hay códigos de descuento'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCodes.map((code) => (
                <DiscountCodeCard
                  key={code.id}
                  code={code}
                  onEdit={() => handleEdit(code)}
                  onDelete={() => handleDelete(code)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {modalContainer && deletingCode && createPortal(
        <DeleteDiscountCodeModal
          code={deletingCode}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={deleteMutation.isPending}
        />,
        modalContainer
      )}

      {/* Edit/Create Modal */}
      {modalContainer && isCreateModalOpen && createPortal(
        <CreateDiscountModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseEditModal}
          onCreate={handleCreate}
          editingCode={editingCode}
          onUpdate={handleUpdate}
        />,
        modalContainer
      )}
    </>
  )
}

