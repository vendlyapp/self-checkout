import { Package, Tag, ShoppingCart, Users, Clock, Star, Heart, Leaf, Carrot, Circle, Flower, CircleDot, Apple } from 'lucide-react'

export const iconMap: Record<string, React.ReactNode> = {
  'Tag': <Tag className="h-4 w-4" />,
  'Package': <Package className="h-4 w-4" />,
  'ShoppingCart': <ShoppingCart className="h-4 w-4" />,
  'Users': <Users className="h-4 w-4" />,
  'Clock': <Clock className="h-4 w-4" />,
  'Star': <Star className="h-4 w-4" />,
  'Heart': <Heart className="h-4 w-4" />,
  'Leaf': <Leaf className="h-4 w-4" />,
  'Carrot': <Carrot className="h-4 w-4" />,
  'Circle': <Circle className="h-4 w-4" />,
  'Flower': <Flower className="h-4 w-4" />,
  'CircleDot': <CircleDot className="h-4 w-4" />,
  'Apple': <Apple className="h-4 w-4" />
}

export const getIcon = (iconName: string): React.ReactNode => {
  return iconMap[iconName] || <Package className="h-4 w-4" />
}
