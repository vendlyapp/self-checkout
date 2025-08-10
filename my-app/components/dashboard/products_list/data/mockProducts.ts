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
  image?: string // Nuevo campo para imagen
  // Nuevos campos para promociones y descuentos
  currency?: string
  initialStock?: number
  images?: string[]
  promotionTitle?: string
  promotionType?: 'percentage' | 'amount' | 'flash' | 'bogo' | 'bundle'
  promotionStartAt?: string
  promotionEndAt?: string
  promotionBadge?: string
  promotionActionLabel?: string
  promotionPriority?: number
}

export interface ProductCategory {
  id: string
  name: string
  icon: string
  count: number
  color?: string
}

// Categorías de productos para la panadería
export const productCategories: ProductCategory[] = [
  { id: 'all', name: 'Alle', icon: 'ShoppingCart', count: 20 },
  { id: 'bread', name: 'Brot', icon: 'Bread', count: 8 },
  { id: 'pastries', name: 'Gebäck', icon: 'Croissant', count: 6 },
  { id: 'cakes', name: 'Kuchen', icon: 'Cake', count: 4 },
  { id: 'sandwiches', name: 'Sandwiches', icon: 'Sandwich', count: 2 }
]

// Mock de productos para la panadería
export const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Bauernbrot',
    description: 'Traditionelles Bauernbrot aus Sauerteig, knusprig und aromatisch',
    price: 3.50,
    originalPrice: 3.90,
    category: 'Brot',
    categoryId: 'bread',
    stock: 25,
    initialStock: 60,
    barcode: '1234567890001',
    sku: 'BAUERNBROT-500G',
    tags: ['brot', 'sauerteig', 'traditionell', 'knusprig'],
    isPopular: true,
    isOnSale: true,
    discountPercentage: 10,
    rating: 4.8,
    reviews: 156,
    weight: 500,
    dimensions: { length: 25, width: 12, height: 8 },
    createdAt: '2024-01-22T06:00:00Z',
    updatedAt: '2024-01-22T06:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
    promotionTitle: 'Aktion',
    promotionType: 'percentage',
    promotionStartAt: '2024-01-22T05:00:00Z',
    promotionEndAt: '2024-01-22T12:00:00Z',
    promotionBadge: '-10%',
    promotionActionLabel: 'Jetzt hinzufügen',
    promotionPriority: 10,
  },
  {
    id: 'prod-002',
    name: 'Croissant Classic',
    description: 'Butteriges Croissant nach französischer Art, luftig und zart',
    price: 2.20,
    originalPrice: 2.60,
    category: 'Gebäck',
    categoryId: 'pastries',
    stock: 40,
    initialStock: 80,
    barcode: '1234567890002',
    sku: 'CROISSANT-CLASSIC',
    tags: ['croissant', 'butter', 'französisch', 'luftig'],
    isPopular: true,
    isOnSale: true,
    discountPercentage: 15,
    rating: 4.9,
    reviews: 234,
    weight: 60,
    dimensions: { length: 15, width: 8, height: 4 },
    createdAt: '2024-01-22T07:00:00Z',
    updatedAt: '2024-01-22T07:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
    promotionTitle: 'Tagesaktion',
    promotionType: 'flash',
    promotionStartAt: '2024-01-22T07:00:00Z',
    promotionEndAt: '2024-01-22T13:00:00Z',
    promotionBadge: 'FLASH',
    promotionActionLabel: 'Jetzt hinzufügen',
    promotionPriority: 9,
  },
  {
    id: 'prod-003',
    name: 'Schwarzwälder Kirschtorte',
    description: 'Klassische Schwarzwälder Kirschtorte mit Kirschen und Sahne',
    price: 24.00,
    originalPrice: 28.00,
    category: 'Kuchen',
    categoryId: 'cakes',
    stock: 8,
    initialStock: 15,
    barcode: '1234567890003',
    sku: 'SCHWARZWAELDER-KIRSCH',
    tags: ['kuchen', 'kirschen', 'sahne', 'schokolade'],
    isPopular: true,
    isOnSale: true,
    discountPercentage: 14,
    rating: 4.7,
    reviews: 89,
    weight: 1200,
    dimensions: { length: 26, width: 26, height: 8 },
    createdAt: '2024-01-22T08:00:00Z',
    updatedAt: '2024-01-22T08:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
    promotionTitle: 'Weekend Deal',
    promotionType: 'amount',
    promotionStartAt: '2024-01-22T08:00:00Z',
    promotionEndAt: '2024-01-24T20:00:00Z',
    promotionBadge: 'SPAR',
    promotionActionLabel: 'Jetzt hinzufügen',
    promotionPriority: 8,
  },
  {
    id: 'prod-004',
    name: 'Vollkornbrot',
    description: 'Gesundes Vollkornbrot mit vielen Körnern und Nüssen',
    price: 4.20,
    category: 'Brot',
    categoryId: 'bread',
    stock: 20,
    initialStock: 40,
    barcode: '1234567890004',
    sku: 'VOLLKORNBROT-600G',
    tags: ['brot', 'vollkorn', 'gesund', 'körner'],
    rating: 4.6,
    reviews: 123,
    weight: 600,
    dimensions: { length: 22, width: 12, height: 8 },
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
  },
  {
    id: 'prod-005',
    name: 'Apfelstrudel',
    description: 'Wiener Apfelstrudel mit frischen Äpfeln und Zimt',
    price: 4.30,
    originalPrice: 4.80,
    category: 'Gebäck',
    categoryId: 'pastries',
    stock: 15,
    initialStock: 30,
    barcode: '1234567890005',
    sku: 'APFELSTRUDEL-200G',
    tags: ['strudel', 'äpfel', 'zimt', 'österreichisch'],
    rating: 4.5,
    reviews: 78,
    weight: 200,
    dimensions: { length: 20, width: 8, height: 6 },
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
    isOnSale: true,
    discountPercentage: 10,
    promotionTitle: 'Aktion',
    promotionType: 'percentage',
    promotionStartAt: '2024-01-22T09:00:00Z',
    promotionEndAt: '2024-01-22T23:00:00Z',
    promotionBadge: '-10%',
    promotionActionLabel: 'Jetzt hinzufügen',
    promotionPriority: 7,
  },
  {
    id: 'prod-006',
    name: 'Brezel Salz',
    description: 'Bayerische Brezel mit grobem Salz, knusprig und weich',
    price: 1.80,
    category: 'Gebäck',
    categoryId: 'pastries',
    stock: 50,
    initialStock: 90,
    barcode: '1234567890006',
    sku: 'BREZEL-SALZ',
    tags: ['brezel', 'salz', 'bayerisch', 'knusprig'],
    isPopular: true,
    rating: 4.4,
    reviews: 201,
    weight: 120,
    dimensions: { length: 18, width: 12, height: 3 },
    createdAt: '2024-01-22T11:00:00Z',
    updatedAt: '2024-01-22T11:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
  },
  {
    id: 'prod-007',
    name: 'Sauerteigbrot',
    description: 'Rustikales Sauerteigbrot mit langer Teigführung',
    price: 3.60,
    originalPrice: 3.80,
    category: 'Brot',
    categoryId: 'bread',
    stock: 18,
    initialStock: 36,
    barcode: '1234567890007',
    sku: 'SAUERTEIGBROT-550G',
    tags: ['brot', 'sauerteig', 'rustikal', 'traditionell'],
    rating: 4.7,
    reviews: 95,
    weight: 550,
    dimensions: { length: 24, width: 14, height: 8 },
    createdAt: '2024-01-22T12:00:00Z',
    updatedAt: '2024-01-22T12:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
    isOnSale: true,
    discountPercentage: 5,
    promotionTitle: 'Empfehlung',
    promotionType: 'percentage',
    promotionStartAt: '2024-01-22T12:00:00Z',
    promotionEndAt: '2024-01-25T12:00:00Z',
    promotionBadge: '-5%',
    promotionActionLabel: 'Jetzt hinzufügen',
    promotionPriority: 6,
  },
  {
    id: 'prod-008',
    name: 'Schokobrötchen',
    description: 'Süße Schokobrötchen mit Schokoladenstückchen',
    price: 1.50,
    category: 'Gebäck',
    categoryId: 'pastries',
    stock: 35,
    initialStock: 70,
    barcode: '1234567890008',
    sku: 'SCHOKOBROETCHEN',
    tags: ['brötchen', 'schokolade', 'süß', 'schokoladenstückchen'],
    rating: 4.3,
    reviews: 67,
    weight: 80,
    dimensions: { length: 12, width: 8, height: 4 },
    createdAt: '2024-01-22T13:00:00Z',
    updatedAt: '2024-01-22T13:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
  },
  {
    id: 'prod-009',
    name: 'Käsekuchen',
    description: 'Cremiger Käsekuchen mit Vanille und Zitronenaroma',
    price: 19.80,
    originalPrice: 22.00,
    category: 'Kuchen',
    categoryId: 'cakes',
    stock: 6,
    initialStock: 10,
    barcode: '1234567890009',
    sku: 'KAESEKUCHEN-26CM',
    tags: ['kuchen', 'käse', 'cremig', 'vanille'],
    rating: 4.6,
    reviews: 112,
    weight: 1000,
    dimensions: { length: 26, width: 26, height: 6 },
    createdAt: '2024-01-22T14:00:00Z',
    updatedAt: '2024-01-22T14:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
    isOnSale: true,
    discountPercentage: 10,
    promotionTitle: 'Aktion',
    promotionType: 'percentage',
    promotionStartAt: '2024-01-22T14:00:00Z',
    promotionEndAt: '2024-01-24T14:00:00Z',
    promotionBadge: '-10%',
    promotionActionLabel: 'Jetzt hinzufügen',
    promotionPriority: 9,
  },
  {
    id: 'prod-010',
    name: 'Roggenbrot',
    description: 'Dunkles Roggenbrot mit kräftigem Geschmack',
    price: 3.20,
    category: 'Brot',
    categoryId: 'bread',
    stock: 22,
    initialStock: 44,
    barcode: '1234567890010',
    sku: 'ROGGENBROT-500G',
    tags: ['brot', 'roggen', 'dunkel', 'kräftig'],
    rating: 4.5,
    reviews: 88,
    weight: 500,
    dimensions: { length: 20, width: 12, height: 8 },
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
  },
  {
    id: 'prod-011',
    name: 'Pain au Chocolat',
    description: 'Französisches Pain au Chocolat mit dunkler Schokolade',
    price: 2.20,
    originalPrice: 2.50,
    category: 'Gebäck',
    categoryId: 'pastries',
    stock: 30,
    initialStock: 70,
    barcode: '1234567890011',
    sku: 'PAIN-AU-CHOCOLAT',
    tags: ['pain au chocolat', 'schokolade', 'französisch', 'butter'],
    rating: 4.8,
    reviews: 145,
    weight: 70,
    dimensions: { length: 14, width: 8, height: 4 },
    createdAt: '2024-01-22T16:00:00Z',
    updatedAt: '2024-01-22T16:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
    isOnSale: true,
    discountPercentage: 12,
    promotionTitle: 'Tagesaktion',
    promotionType: 'percentage',
    promotionStartAt: '2024-01-22T12:00:00Z',
    promotionEndAt: '2024-01-22T18:00:00Z',
    promotionBadge: '-12%',
    promotionActionLabel: 'Jetzt hinzufügen',
    promotionPriority: 8,
  },
  {
    id: 'prod-012',
    name: 'Dinkelbrot',
    description: 'Gesundes Dinkelbrot mit mildem, nussigem Geschmack',
    price: 3.90,
    category: 'Brot',
    categoryId: 'bread',
    stock: 16,
    initialStock: 32,
    barcode: '1234567890012',
    sku: 'DINKELBROT-550G',
    tags: ['brot', 'dinkel', 'gesund', 'nussig'],
    rating: 4.4,
    reviews: 73,
    weight: 550,
    dimensions: { length: 22, width: 12, height: 8 },
    createdAt: '2024-01-22T17:00:00Z',
    updatedAt: '2024-01-22T17:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
  },
  {
    id: 'prod-013',
    name: 'Schinken-Käse Croissant',
    description: 'Herzhaftes Croissant gefüllt mit Schinken und Käse',
    price: 3.20,
    category: 'Gebäck',
    categoryId: 'pastries',
    stock: 25,
    initialStock: 50,
    barcode: '1234567890013',
    sku: 'SCHINKEN-KAESE-CROISSANT',
    tags: ['croissant', 'schinken', 'käse', 'herzhaft'],
    rating: 4.6,
    reviews: 92,
    weight: 85,
    dimensions: { length: 16, width: 9, height: 4 },
    createdAt: '2024-01-22T18:00:00Z',
    updatedAt: '2024-01-22T18:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
  },
  {
    id: 'prod-014',
    name: 'Sachertorte',
    description: 'Wiener Sachertorte mit Marillenmarmelade und Schokoladenglasur',
    price: 32.00,
    originalPrice: 35.00,
    category: 'Kuchen',
    categoryId: 'cakes',
    stock: 4,
    initialStock: 8,
    barcode: '1234567890014',
    sku: 'SACHERTORTE-24CM',
    tags: ['kuchen', 'sachertorte', 'schokolade', 'marillen'],
    rating: 4.9,
    reviews: 67,
    weight: 1100,
    dimensions: { length: 24, width: 24, height: 8 },
    createdAt: '2024-01-22T19:00:00Z',
    updatedAt: '2024-01-22T19:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
    isOnSale: true,
    discountPercentage: 8,
    promotionTitle: 'Aktion',
    promotionType: 'percentage',
    promotionStartAt: '2024-01-22T19:00:00Z',
    promotionEndAt: '2024-01-24T19:00:00Z',
    promotionBadge: '-8%',
    promotionActionLabel: 'Jetzt hinzufügen',
    promotionPriority: 9,
  },
  {
    id: 'prod-015',
    name: 'Ciabatta',
    description: 'Italienisches Ciabatta mit knuspriger Kruste und weichem Inneren',
    price: 2.80,
    category: 'Brot',
    categoryId: 'bread',
    stock: 28,
    initialStock: 56,
    barcode: '1234567890015',
    sku: 'CIABATTA-300G',
    tags: ['brot', 'ciabatta', 'italienisch', 'knusprig'],
    rating: 4.5,
    reviews: 104,
    weight: 300,
    dimensions: { length: 20, width: 10, height: 6 },
    createdAt: '2024-01-22T20:00:00Z',
    updatedAt: '2024-01-22T20:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
  },
  {
    id: 'prod-016',
    name: 'Schinken-Käse Sandwich',
    description: 'Frisches Sandwich mit Schinken, Käse, Salat und Tomaten',
    price: 4.50,
    category: 'Sandwiches',
    categoryId: 'sandwiches',
    stock: 20,
    initialStock: 40,
    barcode: '1234567890016',
    sku: 'SCHINKEN-KAESE-SANDWICH',
    tags: ['sandwich', 'schinken', 'käse', 'salat'],
    rating: 4.3,
    reviews: 56,
    weight: 200,
    dimensions: { length: 18, width: 12, height: 5 },
    createdAt: '2024-01-22T21:00:00Z',
    updatedAt: '2024-01-22T21:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
  },
  {
    id: 'prod-017',
    name: 'Baguette',
    description: 'Französisches Baguette mit knuspriger Kruste',
    price: 2.40,
    category: 'Brot',
    categoryId: 'bread',
    stock: 32,
    initialStock: 64,
    barcode: '1234567890017',
    sku: 'BAGUETTE-250G',
    tags: ['brot', 'baguette', 'französisch', 'knusprig'],
    rating: 4.4,
    reviews: 89,
    weight: 250,
    dimensions: { length: 30, width: 6, height: 4 },
    createdAt: '2024-01-22T22:00:00Z',
    updatedAt: '2024-01-22T22:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
  },
  {
    id: 'prod-018',
    name: 'Apfelkuchen',
    description: 'Hausgemachter Apfelkuchen mit Zimt und Streuseln',
    price: 18.00,
    originalPrice: 20.00,
    category: 'Kuchen',
    categoryId: 'cakes',
    stock: 7,
    initialStock: 14,
    barcode: '1234567890018',
    sku: 'APFELKUCHEN-24CM',
    tags: ['kuchen', 'äpfel', 'zimt', 'streusel'],
    rating: 4.7,
    reviews: 78,
    weight: 900,
    dimensions: { length: 24, width: 24, height: 6 },
    createdAt: '2024-01-22T23:00:00Z',
    updatedAt: '2024-01-22T23:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
    isOnSale: true,
    discountPercentage: 10,
    promotionTitle: 'Tagesaktion',
    promotionType: 'percentage',
    promotionStartAt: '2024-01-22T23:00:00Z',
    promotionEndAt: '2024-01-23T00:00:00Z',
    promotionBadge: '-10%',
    promotionActionLabel: 'Jetzt hinzufügen',
    promotionPriority: 7,
  },
  {
    id: 'prod-019',
    name: 'Mohnbrötchen',
    description: 'Süße Mohnbrötchen mit Mohnfüllung und Zuckerglasur',
    price: 1.80,
    category: 'Gebäck',
    categoryId: 'pastries',
    stock: 25,
    initialStock: 50,
    barcode: '1234567890019',
    sku: 'MOHNBRÖTCHEN',
    tags: ['brötchen', 'mohn', 'süß', 'zuckerglasur'],
    rating: 4.2,
    reviews: 45,
    weight: 90,
    dimensions: { length: 12, width: 8, height: 4 },
    createdAt: '2024-01-23T00:00:00Z',
    updatedAt: '2024-01-23T00:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
  },
  {
    id: 'prod-020',
    name: 'Vegetarisches Sandwich',
    description: 'Frisches vegetarisches Sandwich mit Avocado, Salat und Tomaten',
    price: 4.20,
    category: 'Sandwiches',
    categoryId: 'sandwiches',
    stock: 18,
    initialStock: 36,
    barcode: '1234567890020',
    sku: 'VEGETARISCHES-SANDWICH',
    tags: ['sandwich', 'vegetarisch', 'avocado', 'salat'],
    rating: 4.4,
    reviews: 62,
    weight: 180,
    dimensions: { length: 18, width: 12, height: 5 },
    createdAt: '2024-01-23T01:00:00Z',
    updatedAt: '2024-01-23T01:00:00Z',
    hasWeight: true,
    currency: 'CHF',
    image: '/logo.svg',
    images: ['/logo.svg'],
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

// Filtrar productos con promociones activas
export const getPromotionalProducts = (): Product[] => {
  return mockProducts.filter(product => 
    product.promotionTitle || 
    product.promotionType || 
    product.promotionBadge || 
    product.promotionActionLabel ||
    product.isOnSale ||
    product.discountPercentage ||
    (product.originalPrice && product.originalPrice > product.price)
  )
}

// Filtrar productos con promociones por tipo específico
export const getPromotionalProductsByType = (type: 'percentage' | 'amount' | 'flash' | 'bogo' | 'bundle'): Product[] => {
  return mockProducts.filter(product => product.promotionType === type)
}

// Obtener productos con descuentos por porcentaje
export const getProductsWithPercentageDiscount = (): Product[] => {
  return mockProducts.filter(product => 
    product.discountPercentage && product.discountPercentage > 0
  )
} 