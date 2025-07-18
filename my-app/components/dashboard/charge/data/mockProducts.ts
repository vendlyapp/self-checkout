

// Tipos para productos de checkout
export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  categoryId: string
  image: string
  stock: number
  barcode?: string
  sku: string
  tags: string[]
  isNew?: boolean
  isPopular?: boolean
  isOnSale?: boolean
  rating?: number
  reviews?: number
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  createdAt: string
  updatedAt: string
  hasWeight?: boolean
  discountPercentage?: number
}

export interface ProductCategory {
  id: string
  name: string
  icon: string
  count: number
  color?: string
}

// Categorías de productos para verduras
export const productCategories: ProductCategory[] = [
  { id: 'all', name: 'Todas las verduras', icon: 'Tag', count: 25 },
  { id: 'leafy-greens', name: 'Verduras de hoja', icon: 'Leaf', count: 8 },
  { id: 'root-vegetables', name: 'Verduras de raíz', icon: 'Carrot', count: 6 },
  { id: 'nightshades', name: 'Solanáceas', icon: 'Circle', count: 5 },
  { id: 'cruciferous', name: 'Crucíferas', icon: 'Flower', count: 4 },
  { id: 'legumes', name: 'Legumbres', icon: 'CircleDot', count: 2 },
  { id: 'promotions', name: 'Promociones', icon: 'Star', count: 3 },
  { id: 'new', name: 'Nuevas', icon: 'Clock', count: 2 },
  { id: 'popular', name: 'Populares', icon: 'Star', count: 8 },
  { id: 'sale', name: 'Ofertas', icon: 'Tag', count: 3 }
]

// Mock de verduras para tienda
export const mockProducts: Product[] = [
  // Verduras de hoja
  {
    id: 'leaf-001',
    name: 'Lechuga Romana',
    description: 'Lechuga romana fresca y crujiente',
    price: 2.99,
    originalPrice: 3.49,
    category: 'Verduras de hoja',
    categoryId: 'leafy-greens',
    image: 'Package',
    stock: 45,
    barcode: '1234567890123',
    sku: 'LECHUGA-ROMANA-1KG',
    tags: ['lechuga', 'hoja', 'fresca', 'saludable'],
    isPopular: true,
    isOnSale: true,
    rating: 4.5,
    reviews: 234,
    weight: 1000,
    dimensions: { length: 25, width: 15, height: 8 },
    createdAt: '2024-01-22T06:00:00Z',
    updatedAt: '2024-01-22T06:00:00Z',
    hasWeight: true,
    discountPercentage: 14
  },
  {
    id: 'leaf-002',
    name: 'Espinaca Fresca',
    description: 'Espinaca orgánica recién cosechada',
    price: 3.49,
    category: 'Verduras de hoja',
    categoryId: 'leafy-greens',
    image: 'Package',
    stock: 32,
    barcode: '1234567890124',
    sku: 'ESPINACA-FRESCA-500G',
    tags: ['espinaca', 'hoja', 'orgánica', 'vitaminas'],
    isNew: true,
    rating: 4.7,
    reviews: 156,
    weight: 500,
    dimensions: { length: 20, width: 15, height: 5 },
    createdAt: '2024-01-22T07:00:00Z',
    updatedAt: '2024-01-22T07:00:00Z',
    hasWeight: true
  },
  {
    id: 'leaf-003',
    name: 'Acelga',
    description: 'Acelga verde con tallos blancos',
    price: 2.79,
    category: 'Verduras de hoja',
    categoryId: 'leafy-greens',
    image: 'Package',
    stock: 28,
    barcode: '1234567890125',
    sku: 'ACELGA-FRESCA-1KG',
    tags: ['acelga', 'hoja', 'verde', 'nutritiva'],
    rating: 4.3,
    reviews: 89,
    weight: 1000,
    dimensions: { length: 30, width: 20, height: 10 },
    createdAt: '2024-01-22T08:00:00Z',
    updatedAt: '2024-01-22T08:00:00Z',
    hasWeight: false
  },
  {
    id: 'leaf-004',
    name: 'Rúcula',
    description: 'Rúcula fresca con sabor picante',
    price: 4.99,
    originalPrice: 5.99,
    category: 'Verduras de hoja',
    categoryId: 'leafy-greens',
    image: 'Package',
    stock: 18,
    barcode: '1234567890126',
    sku: 'RUCULA-FRESCA-200G',
    tags: ['rúcula', 'hoja', 'picante', 'ensalada'],
    isPopular: true,
    isOnSale: true,
    rating: 4.6,
    reviews: 123,
    weight: 200,
    dimensions: { length: 15, width: 12, height: 3 },
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z',
    hasWeight: true,
    discountPercentage: 17
  },

  // Verduras de raíz
  {
    id: 'root-001',
    name: 'Zanahoria',
    description: 'Zanahorias naranjas dulces y crujientes',
    price: 1.99,
    originalPrice: 2.49,
    category: 'Verduras de raíz',
    categoryId: 'root-vegetables',
    image: 'Package',
    stock: 67,
    barcode: '1234567890127',
    sku: 'ZANAHORIA-1KG',
    tags: ['zanahoria', 'raíz', 'naranja', 'vitamina-a'],
    isPopular: true,
    isOnSale: true,
    rating: 4.8,
    reviews: 445,
    weight: 1000,
    dimensions: { length: 20, width: 15, height: 10 },
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z',
    hasWeight: true,
    discountPercentage: 20
  },
  {
    id: 'root-002',
    name: 'Remolacha',
    description: 'Remolacha roja orgánica',
    price: 3.29,
    category: 'Verduras de raíz',
    categoryId: 'root-vegetables',
    image: 'Package',
    stock: 25,
    barcode: '1234567890128',
    sku: 'REMOLACHA-500G',
    tags: ['remolacha', 'raíz', 'roja', 'orgánica'],
    rating: 4.4,
    reviews: 78,
    weight: 500,
    dimensions: { length: 12, width: 10, height: 8 },
    createdAt: '2024-01-22T11:00:00Z',
    updatedAt: '2024-01-22T11:00:00Z',
    hasWeight: false
  },
  {
    id: 'root-003',
    name: 'Nabo',
    description: 'Nabos blancos frescos',
    price: 2.49,
    originalPrice: 2.99,
    category: 'Verduras de raíz',
    categoryId: 'root-vegetables',
    image: 'Package',
    stock: 34,
    barcode: '1234567890129',
    sku: 'NABO-FRESCO-1KG',
    tags: ['nabo', 'raíz', 'blanco', 'fresco'],
    isOnSale: true,
    rating: 4.2,
    reviews: 56,
    weight: 1000,
    dimensions: { length: 15, width: 12, height: 10 },
    createdAt: '2024-01-22T12:00:00Z',
    updatedAt: '2024-01-22T12:00:00Z',
    hasWeight: true,
    discountPercentage: 17
  },

  // Solanáceas
  {
    id: 'night-001',
    name: 'Tomate Cherry',
    description: 'Tomates cherry dulces y jugosos',
    price: 4.99,
    originalPrice: 5.99,
    category: 'Solanáceas',
    categoryId: 'nightshades',
    image: 'Package',
    stock: 38,
    barcode: '1234567890130',
    sku: 'TOMATE-CHERRY-500G',
    tags: ['tomate', 'cherry', 'dulce', 'jugoso'],
    isPopular: true,
    isOnSale: true,
    rating: 4.7,
    reviews: 234,
    weight: 500,
    dimensions: { length: 18, width: 15, height: 8 },
    createdAt: '2024-01-22T13:00:00Z',
    updatedAt: '2024-01-22T13:00:00Z',
    hasWeight: true,
    discountPercentage: 17
  },
  {
    id: 'night-002',
    name: 'Pimiento Rojo',
    description: 'Pimientos rojos dulces',
    price: 3.79,
    category: 'Solanáceas',
    categoryId: 'nightshades',
    image: 'Package',
    stock: 42,
    barcode: '1234567890131',
    sku: 'PIMIENTO-ROJO-1KG',
    tags: ['pimiento', 'rojo', 'dulce', 'vitamina-c'],
    rating: 4.5,
    reviews: 167,
    weight: 1000,
    dimensions: { length: 20, width: 18, height: 12 },
    createdAt: '2024-01-22T14:00:00Z',
    updatedAt: '2024-01-22T14:00:00Z',
    hasWeight: false
  },
  {
    id: 'night-003',
    name: 'Berenjena',
    description: 'Berenjenas moradas frescas',
    price: 2.99,
    originalPrice: 3.49,
    category: 'Solanáceas',
    categoryId: 'nightshades',
    image: 'Package',
    stock: 29,
    barcode: '1234567890132',
    sku: 'BERENJENA-1KG',
    tags: ['berenjena', 'morada', 'fresca', 'versátil'],
    isOnSale: true,
    rating: 4.3,
    reviews: 98,
    weight: 1000,
    dimensions: { length: 25, width: 8, height: 8 },
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
    hasWeight: true,
    discountPercentage: 14
  },

  // Crucíferas
  {
    id: 'cruc-001',
    name: 'Brócoli',
    description: 'Brócoli verde orgánico',
    price: 4.49,
    category: 'Crucíferas',
    categoryId: 'cruciferous',
    image: 'Package',
    stock: 31,
    barcode: '1234567890133',
    sku: 'BROCOLI-1KG',
    tags: ['brócoli', 'verde', 'orgánico', 'nutritivo'],
    isPopular: true,
    rating: 4.6,
    reviews: 189,
    weight: 1000,
    dimensions: { length: 20, width: 15, height: 12 },
    createdAt: '2024-01-22T16:00:00Z',
    updatedAt: '2024-01-22T16:00:00Z',
    hasWeight: true
  },
  {
    id: 'cruc-002',
    name: 'Coliflor',
    description: 'Coliflor blanca fresca',
    price: 3.99,
    originalPrice: 4.99,
    category: 'Crucíferas',
    categoryId: 'cruciferous',
    image: 'Package',
    stock: 26,
    barcode: '1234567890134',
    sku: 'COLIFLOR-1KG',
    tags: ['coliflor', 'blanca', 'fresca', 'versátil'],
    isOnSale: true,
    rating: 4.4,
    reviews: 134,
    weight: 1000,
    dimensions: { length: 22, width: 18, height: 10 },
    createdAt: '2024-01-22T17:00:00Z',
    updatedAt: '2024-01-22T17:00:00Z',
    hasWeight: false,
    discountPercentage: 20
  },
  {
    id: 'cruc-003',
    name: 'Repollo',
    description: 'Repollo verde crujiente',
    price: 2.79,
    category: 'Crucíferas',
    categoryId: 'cruciferous',
    image: 'Package',
    stock: 38,
    barcode: '1234567890135',
    sku: 'REPOLLO-1KG',
    tags: ['repollo', 'verde', 'crujiente', 'económico'],
    rating: 4.2,
    reviews: 89,
    weight: 1000,
    dimensions: { length: 25, width: 20, height: 15 },
    createdAt: '2024-01-22T18:00:00Z',
    updatedAt: '2024-01-22T18:00:00Z',
    hasWeight: true
  },

  // Legumbres
  {
    id: 'legume-001',
    name: 'Ejotes Verdes',
    description: 'Ejotes verdes tiernos',
    price: 3.29,
    category: 'Legumbres',
    categoryId: 'legumes',
    image: 'Package',
    stock: 24,
    barcode: '1234567890136',
    sku: 'EJOTES-500G',
    tags: ['ejotes', 'verdes', 'tiernos', 'frescos'],
    isNew: true,
    rating: 4.5,
    reviews: 67,
    weight: 500,
    dimensions: { length: 15, width: 12, height: 5 },
    createdAt: '2024-01-22T19:00:00Z',
    updatedAt: '2024-01-22T19:00:00Z',
    hasWeight: false
  },
  {
    id: 'legume-002',
    name: 'Chícharos',
    description: 'Chícharos dulces en vaina',
    price: 2.99,
    originalPrice: 3.49,
    category: 'Legumbres',
    categoryId: 'legumes',
    image: 'Package',
    stock: 19,
    barcode: '1234567890137',
    sku: 'CHICHAROS-500G',
    tags: ['chícharos', 'dulces', 'vaina', 'frescos'],
    isOnSale: true,
    rating: 4.3,
    reviews: 45,
    weight: 500,
    dimensions: { length: 12, width: 10, height: 4 },
    createdAt: '2024-01-22T20:00:00Z',
    updatedAt: '2024-01-22T20:00:00Z',
    hasWeight: true,
    discountPercentage: 14
  },

  // Promociones
  {
    id: 'promo-001',
    name: 'Pack Ensalada Mixta',
    description: 'Pack con lechuga, tomate y zanahoria',
    price: 6.99,
    originalPrice: 8.99,
    category: 'Promociones',
    categoryId: 'promotions',
    image: 'Package',
    stock: 15,
    barcode: '1234567890138',
    sku: 'PACK-ENSALADA-MIXTA',
    tags: ['pack', 'ensalada', 'mixta', 'promoción'],
    isOnSale: true,
    rating: 4.6,
    reviews: 78,
    weight: 1500,
    dimensions: { length: 30, width: 20, height: 10 },
    createdAt: '2024-01-22T21:00:00Z',
    updatedAt: '2024-01-22T21:00:00Z',
    hasWeight: false,
    discountPercentage: 22
  },
  {
    id: 'promo-002',
    name: 'Pack Verduras de Raíz',
    description: 'Pack con zanahoria, remolacha y nabo',
    price: 5.99,
    originalPrice: 7.49,
    category: 'Promociones',
    categoryId: 'promotions',
    image: 'Package',
    stock: 12,
    barcode: '1234567890139',
    sku: 'PACK-VERDURAS-RAIZ',
    tags: ['pack', 'verduras', 'raíz', 'promoción'],
    isOnSale: true,
    rating: 4.4,
    reviews: 56,
    weight: 2000,
    dimensions: { length: 25, width: 20, height: 15 },
    createdAt: '2024-01-22T22:00:00Z',
    updatedAt: '2024-01-22T22:00:00Z',
    hasWeight: false,
    discountPercentage: 20
  },
  {
    id: 'promo-003',
    name: 'Pack Verduras Verdes',
    description: 'Pack con espinaca, acelga y rúcula',
    price: 8.99,
    originalPrice: 11.99,
    category: 'Promociones',
    categoryId: 'promotions',
    image: 'Package',
    stock: 8,
    barcode: '1234567890140',
    sku: 'PACK-VERDURAS-VERDES',
    tags: ['pack', 'verduras', 'verdes', 'promoción'],
    isOnSale: true,
    rating: 4.7,
    reviews: 34,
    weight: 1200,
    dimensions: { length: 28, width: 22, height: 8 },
    createdAt: '2024-01-22T23:00:00Z',
    updatedAt: '2024-01-22T23:00:00Z',
    hasWeight: false,
    discountPercentage: 25
  }
]

// Funciones helper para filtrar productos
export const filterProductsByCategory = (products: Product[], categoryId: string): Product[] => {
  if (categoryId === 'all') return products
  return products.filter(product => product.categoryId === categoryId)
}

export const filterProductsBySearch = (products: Product[], searchTerm: string): Product[] => {
  const term = searchTerm.toLowerCase()
  return products.filter(product => 
    product.name.toLowerCase().includes(term) ||
    product.description.toLowerCase().includes(term) ||
    product.sku.toLowerCase().includes(term) ||
    product.tags.some(tag => tag.toLowerCase().includes(term))
  )
}

export const filterProductsByTags = (products: Product[], tags: string[]): Product[] => {
  if (tags.length === 0) return products
  return products.filter(product => 
    tags.some(tag => {
      switch (tag) {
        case 'new':
          return product.isNew
        case 'popular':
          return product.isPopular
        case 'sale':
          return product.isOnSale
        case 'promotions':
          return product.isOnSale || product.originalPrice
        default:
          return product.tags.includes(tag)
      }
    })
  )
}

export const sortProducts = (products: Product[], sortBy: 'name' | 'price' | 'rating' | 'newest' = 'name'): Product[] => {
  return [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'name':
      default:
        return a.name.localeCompare(b.name)
    }
  })
}

// Simulación de API
export const fetchProducts = async (filters?: {
  categoryId?: string
  searchTerm?: string
  tags?: string[]
  sortBy?: 'name' | 'price' | 'rating' | 'newest'
}): Promise<Product[]> => {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 300))
  
  let filteredProducts = [...mockProducts]
  
  if (filters?.categoryId) {
    filteredProducts = filterProductsByCategory(filteredProducts, filters.categoryId)
  }
  
  if (filters?.searchTerm) {
    filteredProducts = filterProductsBySearch(filteredProducts, filters.searchTerm)
  }
  
  if (filters?.tags) {
    filteredProducts = filterProductsByTags(filteredProducts, filters.tags)
  }
  
  if (filters?.sortBy) {
    filteredProducts = sortProducts(filteredProducts, filters.sortBy)
  }
  
  return filteredProducts
}

export const fetchProductById = async (id: string): Promise<Product | null> => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return mockProducts.find(product => product.id === id) || null
}

export const fetchCategories = async (): Promise<ProductCategory[]> => {
  await new Promise(resolve => setTimeout(resolve, 100))
  return productCategories
}

// Actualizar contadores de categorías basado en productos reales
export const updateCategoryCounts = (): ProductCategory[] => {
  return productCategories.map(category => {
    if (category.id === 'all') {
      return { ...category, count: mockProducts.length }
    }
    const count = mockProducts.filter(product => product.categoryId === category.id).length
    return { ...category, count }
  })
} 