import { Package, Tag, ShoppingCart, Users, Clock, Star, Heart, Leaf, Carrot, Circle, Flower, CircleDot } from 'lucide-react'

export const iconMap: Record<string, React.ReactNode> = {
  'Tag': <Tag className="h-3 w-3" />,
  'Package': <Package className="h-3 w-3" />,
  'ShoppingCart': <ShoppingCart className="h-3 w-3" />,
  'Users': <Users className="h-3 w-3" />,
  'Clock': <Clock className="h-3 w-3" />,
  'Star': <Star className="h-3 w-3" />,
  'Heart': <Heart className="h-3 w-3" />,
  'Leaf': <Leaf className="h-3 w-3" />,
  'Carrot': <Carrot className="h-3 w-3" />,
  'Circle': <Circle className="h-3 w-3" />,
  'Flower': <Flower className="h-3 w-3" />,
  'CircleDot': <CircleDot className="h-3 w-3" />
}

export const getIcon = (iconName: string): React.ReactNode => {
  return iconMap[iconName] || <Tag className="h-3 w-3" />
} 