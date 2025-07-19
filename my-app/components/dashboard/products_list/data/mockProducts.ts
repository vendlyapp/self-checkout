// Tipos para productos de la lista de productos
export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  categoryId: string
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

// Categorías de productos para la lista
export const productCategories: ProductCategory[] = [
  { id: 'all', name: 'Alle', icon: 'ShoppingCart', count: 122 },
  { id: 'fruits', name: 'Früchte', icon: 'Apple', count: 2 },
  { id: 'vegetables', name: 'Gemüse', icon: 'Carrot', count: 0 }
]

// Mock de productos para la lista
export const mockProducts: Product[] = [
  {
    id: 'prod-011',
    name: 'Eier Freiland 6er Pack',
    description: 'Frische Freilandeier aus biologischer Haltung',
    price: 5.90,
    category: 'Alle',
    categoryId: 'all',
    stock: 45,
    barcode: '1234567890123',
    sku: 'EIER-FREILAND-6ER',
    tags: ['eier', 'freiland', 'bio', 'frisch'],
    isPopular: true,
    rating: 4.5,
    reviews: 234,
    weight: 360,
    dimensions: { length: 15, width: 12, height: 8 },
    createdAt: '2024-01-22T06:00:00Z',
    updatedAt: '2024-01-22T06:00:00Z',
    hasWeight: false
  },
  {
    id: 'prod-009',
    name: 'Saison Kürbis 6er Pack',
    description: 'Frische Saisonkürbisse aus regionalem Anbau',
    price: 3.20,
    originalPrice: 3.76,
    category: 'Gemüse',
    categoryId: 'vegetables',
    stock: 28,
    barcode: '1234567890124',
    sku: 'KUERBIS-SAISON-6ER',
    tags: ['kürbis', 'saison', 'regional', 'frisch'],
    isOnSale: true,
    rating: 4.3,
    reviews: 156,
    weight: 1200,
    dimensions: { length: 20, width: 18, height: 15 },
    createdAt: '2024-01-22T07:00:00Z',
    updatedAt: '2024-01-22T07:00:00Z',
    hasWeight: true,
    discountPercentage: 15
  },
  {
    id: 'prod-030',
    name: 'Äpfel Gala',
    description: 'Süße Gala Äpfel aus dem Alpenraum',
    price: 4.50,
    category: 'Früchte',
    categoryId: 'fruits',
    stock: 67,
    barcode: '1234567890125',
    sku: 'AEPFEL-GALA-1KG',
    tags: ['äpfel', 'gala', 'süß', 'regional'],
    rating: 4.7,
    reviews: 189,
    weight: 1000,
    dimensions: { length: 18, width: 15, height: 12 },
    createdAt: '2024-01-22T08:00:00Z',
    updatedAt: '2024-01-22T08:00:00Z',
    hasWeight: true
  },
  {
    id: 'prod-000',
    name: 'Bananen Bio',
    description: 'Bio Bananen aus fairem Handel',
    price: 3.80,
    category: 'Früchte',
    categoryId: 'fruits',
    stock: 89,
    barcode: '1234567890126',
    sku: 'BANANEN-BIO-1KG',
    tags: ['bananen', 'bio', 'fair trade', 'tropisch'],
    isPopular: true,
    rating: 4.6,
    reviews: 312,
    weight: 1000,
    dimensions: { length: 22, width: 12, height: 8 },
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z',
    hasWeight: true
  },{
    id: 'prod-001',
    name: 'Bananen Bio',
    description: 'Bio Bananen aus fairem Handel',
    price: 3.80,
    category: 'Früchte',
    categoryId: 'fruits',
    stock: 89,
    barcode: '1234567890126',
    sku: 'BANANEN-BIO-1KG',
    tags: ['bananen', 'bio', 'fair trade', 'tropisch'],
    isPopular: true,
    rating: 4.6,
    reviews: 312,
    weight: 1000,
    dimensions: { length: 22, width: 12, height: 8 },
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z',
    hasWeight: true
  },{
    id: 'prod-002',
    name: 'Bananen Bio',
    description: 'Bio Bananen aus fairem Handel',
    price: 3.80,
    category: 'Früchte',
    categoryId: 'fruits',
    stock: 89,
    barcode: '1234567890126',
    sku: 'BANANEN-BIO-1KG',
    tags: ['bananen', 'bio', 'fair trade', 'tropisch'],
    isPopular: true,
    rating: 4.6,
    reviews: 312,
    weight: 1000,
    dimensions: { length: 22, width: 12, height: 8 },
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z',
    hasWeight: true
  },{
    id: 'prod-003',
    name: 'Bananen Bio',
    description: 'Bio Bananen aus fairem Handel',
    price: 3.80,
    category: 'Früchte',
    categoryId: 'fruits',
    stock: 89,
    barcode: '1234567890126',
    sku: 'BANANEN-BIO-1KG',
    tags: ['bananen', 'bio', 'fair trade', 'tropisch'],
    isPopular: true,
    rating: 4.6,
    reviews: 312,
    weight: 1000,
    dimensions: { length: 22, width: 12, height: 8 },
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z',
    hasWeight: true
  },{
    id: 'prod-004',
    name: 'Bananen Bio',
    description: 'Bio Bananen aus fairem Handel',
    price: 3.80,
    category: 'Früchte',
    categoryId: 'fruits',
    stock: 89,
    barcode: '1234567890126',
    sku: 'BANANEN-BIO-1KG',
    tags: ['bananen', 'bio', 'fair trade', 'tropisch'],
    isPopular: true,
    rating: 4.6,
    reviews: 312,
    weight: 1000,
    dimensions: { length: 22, width: 12, height: 8 },
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z',
    hasWeight: true
  },{
    id: 'prod-005',
    name: 'Bananen Bio',
    description: 'Bio Bananen aus fairem Handel',
    price: 3.80,
    category: 'Früchte',
    categoryId: 'fruits',
    stock: 89,
    barcode: '1234567890126',
    sku: 'BANANEN-BIO-1KG',
    tags: ['bananen', 'bio', 'fair trade', 'tropisch'],
    isPopular: true,
    rating: 4.6,
    reviews: 312,
    weight: 1000,
    dimensions: { length: 22, width: 12, height: 8 },
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z',
    hasWeight: true
  },{
    id: 'prod-006',
    name: 'Bananen Bio',
    description: 'Bio Bananen aus fairem Handel',
    price: 3.80,
    category: 'Früchte',
    categoryId: 'fruits',
    stock: 89,
    barcode: '1234567890126',
    sku: 'BANANEN-BIO-1KG',
    tags: ['bananen', 'bio', 'fair trade', 'tropisch'],
    isPopular: true,
    rating: 4.6,
    reviews: 312,
    weight: 1000,
    dimensions: { length: 22, width: 12, height: 8 },
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z',
    hasWeight: true
  },
  {
    id: 'prod-007',
    name: 'Tomaten Cherry',
    description: 'Süße Cherry Tomaten aus dem Gewächshaus',
    price: 4.20,
    originalPrice: 4.80,
    category: 'Gemüse',
    categoryId: 'vegetables',
    stock: 34,
    barcode: '1234567890127',
    sku: 'TOMATEN-CHERRY-500G',
    tags: ['tomaten', 'cherry', 'süß', 'frisch'],
    isOnSale: true,
    rating: 4.4,
    reviews: 98,
    weight: 500,
    dimensions: { length: 16, width: 14, height: 6 },
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z',
    hasWeight: true,
    discountPercentage: 12
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