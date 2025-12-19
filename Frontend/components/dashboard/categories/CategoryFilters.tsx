'use client'

import { useState } from 'react'
import { FilterSlider, FilterOption } from '@/components/Sliders/SliderFIlter'

export type CategoryFilterStatus = 'all' | 'active' | 'inactive'

interface CategoryFiltersProps {
  categories: Array<{ id: string; name: string; count?: number; isActive?: boolean }>
  selectedStatus: CategoryFilterStatus
  onStatusChange: (status: CategoryFilterStatus) => void
}

export default function CategoryFilters({
  categories,
  selectedStatus,
  onStatusChange
}: CategoryFiltersProps) {
  // Calcular conteos usando isActive si existe, sino usar count como fallback
  const totalCount = categories.length
  const activeCount = categories.filter(c => 
    c.isActive !== undefined ? c.isActive : (c.count || 0) > 0
  ).length
  const inactiveCount = categories.filter(c => 
    c.isActive !== undefined ? !c.isActive : (c.count || 0) === 0
  ).length

  const filterOptions: FilterOption[] = [
    {
      id: 'all',
      label: 'Alle',
      count: totalCount
    },
    {
      id: 'active',
      label: 'Aktiv',
      count: activeCount
    },
    {
      id: 'inactive',
      label: 'Inaktiv',
      count: inactiveCount
    }
  ]

  const handleFilterChange = (filters: string[]) => {
    const newStatus = (filters[0] || 'all') as CategoryFilterStatus
    onStatusChange(newStatus)
  }

  return (
    <div className="fixed top-[135px] left-0 right-0 bg-background-cream border-b border-gray-100 z-40 
                    animate-slide-down gpu-accelerated"
         style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
      <FilterSlider
        filters={filterOptions}
        selectedFilters={selectedStatus === 'all' ? [] : [selectedStatus]}
        onFilterChange={handleFilterChange}
        showCount={true}
        multiSelect={false}
      />
    </div>
  )
}

