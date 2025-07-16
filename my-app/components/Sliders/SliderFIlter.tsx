'use client'

import { useRef, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FilterOption {
  id: string
  label: string
  icon?: React.ReactNode
  count?: number
}

interface FilterSliderProps {
  filters: FilterOption[]
  selectedFilters: string[]
  onFilterChange: (filters: string[]) => void
  className?: string
  showCount?: boolean
  multiSelect?: boolean
}

export function FilterSlider({
  filters,
  selectedFilters,
  onFilterChange,
  className,
  showCount = true,
  multiSelect = true
}: FilterSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleFilterClick = useCallback((filterId: string) => {
    if (multiSelect) {
      const isSelected = selectedFilters.includes(filterId)
      if (isSelected) {
        onFilterChange(selectedFilters.filter(id => id !== filterId))
      } else {
        onFilterChange([...selectedFilters, filterId])
      }
    } else {
      onFilterChange(selectedFilters[0] === filterId ? [] : [filterId])
    }
  }, [multiSelect, selectedFilters, onFilterChange])

  const handleFilterKeyDown = useCallback((event: React.KeyboardEvent, filterId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleFilterClick(filterId)
    }
  }, [handleFilterClick])

  const clearAllFilters = useCallback(() => {
    onFilterChange([])
  }, [onFilterChange])

  return (
    <div className={cn("relative", className)}>
      {/* Contenedor de filtros con scroll */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        role="listbox"
        aria-label="Filter options"
      >
        {/* Botón "Limpiar filtros" */}
        {selectedFilters.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-all hover:bg-primary/20 hover:scale-105 active:scale-95"
            aria-label="Clear all filters"
            tabIndex={0}
          >
            <X className="h-3 w-3" />
            Limpiar filtros
          </button>
        )}

        {/* Chips de filtros */}
        {filters.map((filter) => {
          const isSelected = selectedFilters.includes(filter.id)
          return (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter.id)}
              onKeyDown={(e) => handleFilterKeyDown(e, filter.id)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                "hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted hover:bg-muted/80"
              )}
              role="option"
              aria-selected={isSelected}
              tabIndex={0}
            >
              {filter.icon && (
                <span className="flex h-4 w-4 items-center justify-center" aria-hidden="true">
                  {filter.icon}
                </span>
              )}
              <span>{filter.label}</span>
              {showCount && filter.count !== undefined && (
                <span
                  className={cn(
                    "ml-1 text-xs",
                    isSelected ? "opacity-80" : "opacity-60"
                  )}
                  aria-label={`${filter.count} items`}
                >
                  ({filter.count})
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default FilterSlider