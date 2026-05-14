'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'

export interface FilterOption {
  id: string
  label: string
  icon?: React.ReactNode
  count?: number
}

interface CategoryChipsProps {
  filters: FilterOption[]
  selectedFilters: string[]
  onFilterChange: (filters: string[]) => void
  showCount?: boolean
}

export function CategoryChips({ filters, selectedFilters, onFilterChange, showCount = true }: CategoryChipsProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleClick = (filterId: string) => {
    if (filterId === 'all') {
      onFilterChange(['all'])
      return
    }
    const isSelected = selectedFilters.includes(filterId)
    if (isSelected) {
      const next = selectedFilters.filter(id => id !== filterId)
      onFilterChange(next.length === 0 ? ['all'] : next)
    } else {
      onFilterChange([...selectedFilters.filter(id => id !== 'all'), filterId])
    }
  }

  return (
    <div ref={ref} className="border-b border-white/60 bg-background-cream">
      <div className="-mx-0 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 pb-0.5">
          {filters.map((filter) => {
            const active = selectedFilters.includes(filter.id)
            return (
              <button
                key={filter.id}
                onClick={() => handleClick(filter.id)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all active:scale-95',
                  active
                    ? 'border-transparent bg-warm-800 text-white shadow-soft'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                )}
              >
                {filter.icon && <span className="flex-shrink-0 [&>svg]:h-4 [&>svg]:w-4">{filter.icon}</span>}
                <span>{filter.label}</span>
                {showCount && filter.count !== undefined && (
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                    active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  )}>
                    {filter.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
