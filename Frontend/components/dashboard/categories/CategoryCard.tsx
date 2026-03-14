'use client'

import { Eye, EyeOff, Edit, Trash2 } from 'lucide-react'
import { getIcon } from '../products_list/data/iconMap'
import type { Category } from '@/lib/services/categoryService'

interface CategoryCardProps {
  category: Category
  isDefault?: boolean
  onEdit: (category: Category) => void
  onToggleVisibility?: (category: Category) => void
  onDelete?: (category: Category) => void
}

export default function CategoryCard({
  category,
  isDefault = false,
  onEdit,
  onToggleVisibility,
  onDelete,
}: CategoryCardProps) {
  const isActive = category.isActive !== undefined ? category.isActive : (category.count !== undefined && category.count > 0)
  
  // Obtener icono de la categoría (si existe en el tipo Category, sino usar Tag por defecto)
  const iconName = category.icon || 'Tag'
  const categoryIcon = getIcon(iconName)
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(category)
  }

  const handleVisibilityClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggleVisibility) {
      onToggleVisibility(category)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(category)
    }
  }

  return (
    <div 
      className={`rounded-xl p-4 shadow-sm border transition-interactive gpu-accelerated group
                 ${isActive 
                   ? 'bg-white border-gray-100 hover:shadow-lg hover:scale-[1.02] hover:border-brand-200' 
                   : 'bg-gray-50 border-gray-200 opacity-60'
                 }`}
    >
      <div className="flex items-center gap-4">
        {/* Icono de la categoría */}
        <div className={`w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center relative
                        transition-interactive gpu-accelerated
                        ${isActive ? 'group-hover:scale-110 bg-gray-100' : 'bg-gray-200'}`}
             style={isActive && category.color ? { backgroundColor: category.color + '20' } : {}}
        >
          <div className={`flex items-center justify-center transition-interactive [&>svg]:w-8 [&>svg]:h-8
                          ${isActive ? 'text-gray-600' : 'text-gray-400'}`}
               style={isActive && category.color ? { color: category.color } : {}}
          >
            {categoryIcon}
          </div>
        </div>

        {/* Información de la categoría */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-[16px] font-semibold leading-tight truncate
                           ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
              {category.name}
            </h3>
            {isDefault && (
              <span className="flex-shrink-0 text-[11px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium leading-tight">
                Standard
              </span>
            )}
          </div>
          
          <div className={`text-sm ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
            {category.count || 0} {category.count === 1 ? 'Produkt' : 'Produkte'}
          </div>
          {category.createdAt && (
            <div className={`text-xs mt-0.5 ${isActive ? 'text-gray-400' : 'text-gray-400'}`}>
              Erstellt: {new Date(category.createdAt).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Botón de visibilidad */}
          {onToggleVisibility && !isDefault && (
            <button
              onClick={handleVisibilityClick}
              className="p-2 rounded-lg transition-colors
                       hover:bg-gray-100 active:scale-95
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              aria-label={isActive ? 'Kategorie ausblenden' : 'Kategorie einblenden'}
              tabIndex={0}
            >
              {isActive ? (
                <Eye className="w-5 h-5 text-green-600" />
              ) : (
                <EyeOff className="w-5 h-5 text-red-600" />
              )}
            </button>
          )}
          
          {/* Botón de editar: oculto para la categoría default */}
          {!isDefault && (
            <button
              onClick={handleEditClick}
              className="p-2 rounded-lg transition-colors
                       hover:bg-gray-100 active:scale-95
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              aria-label="Kategorie bearbeiten"
              tabIndex={0}
            >
              <Edit className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Botón eliminar: solo visible cuando la categoría está inactiva y no es la default */}
          {!isActive && !isDefault && onDelete && (
            <button
              onClick={handleDeleteClick}
              className="p-2 rounded-lg transition-colors
                       hover:bg-red-50 hover:text-red-600 active:scale-95
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-gray-400"
              aria-label="Kategorie löschen"
              tabIndex={0}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

