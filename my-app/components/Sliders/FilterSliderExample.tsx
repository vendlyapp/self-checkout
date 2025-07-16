'use client'

import { useState } from 'react'
import { FilterSlider, FilterOption } from './SliderFIlter'
import { Tag, Star, Heart, ShoppingCart, Users } from 'lucide-react'

const sampleFilters: FilterOption[] = [
  { id: 'all', label: 'Todos', icon: <Tag className="h-3 w-3" />, count: 150 },
  { id: 'featured', label: 'Destacados', icon: <Star className="h-3 w-3" />, count: 25 },
  { id: 'favorites', label: 'Favoritos', icon: <Heart className="h-3 w-3" />, count: 12 },
  { id: 'cart', label: 'En carrito', icon: <ShoppingCart className="h-3 w-3" />, count: 8 },
  { id: 'popular', label: 'Populares', icon: <Users className="h-3 w-3" />, count: 45 },
  { id: 'new', label: 'Nuevos', icon: <Tag className="h-3 w-3" />, count: 18 },
  { id: 'sale', label: 'Ofertas', icon: <Tag className="h-3 w-3" />, count: 32 },
  { id: 'trending', label: 'Tendencia', icon: <Star className="h-3 w-3" />, count: 28 },
  { id: 'recommended', label: 'Recomendados', icon: <Heart className="h-3 w-3" />, count: 15 },
  { id: 'recent', label: 'Recientes', icon: <Tag className="h-3 w-3" />, count: 22 }
]

export default function FilterSliderExample() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters)
    console.log('Filtros seleccionados:', filters)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Ejemplo de FilterSlider</h2>
        <p className="text-muted-foreground mb-6">
          Componente de filtros con scroll horizontal y selección múltiple
        </p>
      </div>

      {/* Ejemplo básico */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Filtros con selección múltiple</h3>
        <FilterSlider
          filters={sampleFilters}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          showCount={true}
          multiSelect={true}
        />
        <div className="text-sm text-muted-foreground">
          Filtros seleccionados: {selectedFilters.length > 0 ? selectedFilters.join(', ') : 'Ninguno'}
        </div>
      </div>

      {/* Ejemplo con selección única */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Filtros con selección única</h3>
        <FilterSlider
          filters={sampleFilters.slice(0, 6)}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          showCount={false}
          multiSelect={false}
        />
      </div>

      {/* Ejemplo sin contadores */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Filtros sin contadores</h3>
        <FilterSlider
          filters={sampleFilters.slice(0, 8).map(filter => ({ ...filter, count: undefined }))}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          showCount={false}
          multiSelect={true}
        />
      </div>
    </div>
  )
} 