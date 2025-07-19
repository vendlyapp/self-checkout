import { ShoppingCart, Apple, Carrot, Package, Tag, Star, Clock } from 'lucide-react'

export const iconMap: Record<string, React.ReactNode> = {
  'ShoppingCart': <ShoppingCart className="h-4 w-4" />,
  'Apple': <Apple className="h-4 w-4" />,
  'Carrot': <Carrot className="h-4 w-4" />,
  'Package': <Package className="h-4 w-4" />,
  'Tag': <Tag className="h-4 w-4" />,
  'Star': <Star className="h-4 w-4" />,
  'Clock': <Clock className="h-4 w-4" />
}

export const getIcon = (iconName: string): React.ReactNode => {
  return iconMap[iconName] || <Package className="h-4 w-4" />
} 