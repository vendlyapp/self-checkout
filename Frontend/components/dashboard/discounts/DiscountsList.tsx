'use client'

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import DiscountStatsCards from './DiscountStatsCards'
import DiscountCodeCard from './DiscountCodeCard'
import { useDiscountCodes, useDiscountCodeStats, useArchiveDiscountCode, useUpdateDiscountCode, useArchivedDiscountCodes } from '@/hooks/queries/useDiscountCodes'
import { DiscountCode } from './types'
import DeleteDiscountCodeModal from './DeleteDiscountCodeModal'
import CreateDiscountModal, { DiscountFormData } from './CreateDiscountModal'

export default function DiscountsList() {
  const { data: discountCodes = [], isLoading } = useDiscountCodes()
  const { data: archivedCodes = [], isLoading: isLoadingArchived } = useArchivedDiscountCodes()
  const { data: stats } = useDiscountCodeStats()
  const archiveMutation = useArchiveDiscountCode()
  const updateMutation = useUpdateDiscountCode()
  const [archivingCode, setArchivingCode] = useState<DiscountCode | null>(null)
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all')
  const [previousFilter, setPreviousFilter] = useState<'all' | 'active' | 'inactive'>('all')

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

  const handleArchive = (code: DiscountCode) => {
    setArchivingCode(code)
  }

  const handleConfirmArchive = () => {
    if (archivingCode) {
      archiveMutation.mutate(archivingCode.id)
      setArchivingCode(null)
    }
  }

  const handleCancelArchive = () => {
    setArchivingCode(null)
  }


  const displayStats = useMemo(() => {
    if (stats) {
      return {
        total: stats.total,
        active: stats.active,
        inactive: stats.inactive,
        archived: stats.archived || 0
      }
    }
    // Fallback si no hay stats (excluyendo archivados)
    const nonArchivedCodes = discountCodes.filter((code) => code.status !== 'archived' && !code.archived)
    const total = nonArchivedCodes.length
    const active = nonArchivedCodes.filter((code) => code.status === 'active').length
    const inactive = nonArchivedCodes.filter((code) => code.status === 'inactive').length
    return { total, active, inactive, archived: 0 }
  }, [stats, discountCodes])

  // Filtrar códigos según el filtro activo
  const filteredCodes = useMemo(() => {
    if (activeFilter === 'archived') {
      return archivedCodes
    }
    
    // Para otros filtros, excluir archivados
    const nonArchivedCodes = discountCodes.filter((code) => code.status !== 'archived' && !code.archived)
    
    if (activeFilter === 'all') {
      return nonArchivedCodes
    }
    return nonArchivedCodes.filter((code) => code.status === activeFilter)
  }, [discountCodes, archivedCodes, activeFilter])

  const handleFilterChange = (filter: 'all' | 'active' | 'inactive' | 'archived') => {
    setActiveFilter(filter)
  }

  if (isLoading || isLoadingArchived) {
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
          activeFilter={activeFilter === 'archived' ? 'all' : activeFilter}
          onFilterChange={(filter) => {
            setActiveFilter(filter)
          }}
        />

        {/* Codes List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeFilter === 'all' && `Alle Codes (${filteredCodes.length})`}
              {activeFilter === 'active' && `Aktive Codes (${filteredCodes.length})`}
              {activeFilter === 'inactive' && `Inaktive Codes (${filteredCodes.length})`}
              {activeFilter === 'archived' && `Archivierte Codes (${filteredCodes.length})`}
            </h2>
            <button
              onClick={() => {
                if (activeFilter === 'archived') {
                  setActiveFilter(previousFilter)
                } else {
                  setPreviousFilter(activeFilter)
                  setActiveFilter('archived')
                }
              }}
              className={`text-sm font-medium transition-colors ${
                activeFilter === 'archived'
                  ? 'text-orange-600 hover:text-orange-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Archiv
            </button>
          </div>

          {filteredCodes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {activeFilter === 'archived'
                  ? 'Keine archivierten Codes vorhanden'
                  : discountCodes.length === 0 
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
                  onDelete={() => handleArchive(code)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Archive Confirmation Modal */}
      {modalContainer && archivingCode && createPortal(
        <DeleteDiscountCodeModal
          code={archivingCode}
          onConfirm={handleConfirmArchive}
          onCancel={handleCancelArchive}
          isDeleting={archiveMutation.isPending}
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


