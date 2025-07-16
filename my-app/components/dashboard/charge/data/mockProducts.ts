

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
}

export interface ProductCategory {
  id: string
  name: string
  icon: string
  count: number
  color?: string
}

// Categorías de productos
export const productCategories: ProductCategory[] = [
  { id: 'all', name: 'Todos los productos', icon: 'Tag', count: 150 },
  { id: 'electronics', name: 'Electrónicos', icon: 'Package', count: 45 },
  { id: 'clothing', name: 'Ropa', icon: 'Tag', count: 32 },
  { id: 'food', name: 'Alimentos', icon: 'ShoppingCart', count: 28 },
  { id: 'beverages', name: 'Bebidas', icon: 'ShoppingCart', count: 18 },
  { id: 'household', name: 'Hogar', icon: 'Users', count: 25 },
  { id: 'promotions', name: 'Promociones', icon: 'Star', count: 12 },
  { id: 'new', name: 'Nuevos', icon: 'Clock', count: 8 },
  { id: 'popular', name: 'Populares', icon: 'Star', count: 35 },
  { id: 'sale', name: 'Ofertas', icon: 'Tag', count: 22 }
]

// Mock de productos realistas para checkout
export const mockProducts: Product[] = [
  // Electrónicos
  {
    id: 'elec-001',
    name: 'iPhone 15 Pro',
    description: 'Smartphone Apple con cámara profesional y chip A17 Pro',
    price: 999.99,
    originalPrice: 1199.99,
    category: 'Electrónicos',
    categoryId: 'electronics',
    image: '/images/products/iphone-15-pro.jpg',
    stock: 15,
    barcode: '1234567890123',
    sku: 'IPH15PRO-256GB',
    tags: ['smartphone', 'apple', '5g', 'camera'],
    isPopular: true,
    isOnSale: true,
    rating: 4.8,
    reviews: 1247,
    weight: 187,
    dimensions: { length: 147.6, width: 71.6, height: 8.3 },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z'
  },
  {
    id: 'elec-002',
    name: 'Samsung Galaxy S24',
    description: 'Android flagship con IA integrada y pantalla AMOLED',
    price: 899.99,
    category: 'Electrónicos',
    categoryId: 'electronics',
    image: '/images/products/samsung-s24.jpg',
    stock: 8,
    barcode: '1234567890124',
    sku: 'SAMS24-128GB',
    tags: ['smartphone', 'samsung', 'android', 'ai'],
    isNew: true,
    rating: 4.6,
    reviews: 892,
    weight: 168,
    dimensions: { length: 147.0, width: 70.6, height: 7.6 },
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T11:20:00Z'
  },
  {
    id: 'elec-003',
    name: 'AirPods Pro 2',
    description: 'Auriculares inalámbricos con cancelación de ruido activa',
    price: 249.99,
    originalPrice: 299.99,
    category: 'Electrónicos',
    categoryId: 'electronics',
    image: '/images/products/airpods-pro.jpg',
    stock: 25,
    barcode: '1234567890125',
    sku: 'AIRPODS-PRO2',
    tags: ['headphones', 'wireless', 'noise-cancelling'],
    isPopular: true,
    isOnSale: true,
    rating: 4.7,
    reviews: 2156,
    weight: 5.3,
    dimensions: { length: 30.9, width: 21.8, height: 24.0 },
    createdAt: '2023-12-20T16:00:00Z',
    updatedAt: '2024-01-15T13:30:00Z'
  },

  // Ropa
  {
    id: 'cloth-001',
    name: 'Nike Air Max 270',
    description: 'Zapatillas deportivas con tecnología Air Max',
    price: 129.99,
    originalPrice: 159.99,
    category: 'Ropa',
    categoryId: 'clothing',
    image: '/images/products/nike-airmax.jpg',
    stock: 42,
    barcode: '1234567890126',
    sku: 'NIKE-AM270-42',
    tags: ['shoes', 'sports', 'nike', 'running'],
    isPopular: true,
    isOnSale: true,
    rating: 4.5,
    reviews: 678,
    weight: 320,
    dimensions: { length: 30, width: 12, height: 8 },
    createdAt: '2023-11-15T12:00:00Z',
    updatedAt: '2024-01-12T10:15:00Z'
  },
  {
    id: 'cloth-002',
    name: 'Levi\'s 501 Original',
    description: 'Jeans clásicos de corte recto',
    price: 89.99,
    category: 'Ropa',
    categoryId: 'clothing',
    image: '/images/products/levis-501.jpg',
    stock: 67,
    barcode: '1234567890127',
    sku: 'LEVIS-501-32',
    tags: ['jeans', 'denim', 'classic', 'casual'],
    rating: 4.3,
    reviews: 445,
    weight: 450,
    dimensions: { length: 32, width: 34, height: 2 },
    createdAt: '2023-10-20T14:30:00Z',
    updatedAt: '2024-01-08T09:45:00Z'
  },

  // Alimentos
  {
    id: 'food-001',
    name: 'Coca-Cola 2L',
    description: 'Refresco de cola en botella de 2 litros',
    price: 2.49,
    category: 'Bebidas',
    categoryId: 'beverages',
    image: '/images/products/coca-cola-2l.jpg',
    stock: 120,
    barcode: '1234567890128',
    sku: 'COCA-COLA-2L',
    tags: ['beverage', 'soda', 'cola', 'refresco'],
    isPopular: true,
    rating: 4.2,
    reviews: 1234,
    weight: 2000,
    dimensions: { length: 12, width: 8, height: 25 },
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-22T16:30:00Z'
  },
  {
    id: 'food-002',
    name: 'Pan Integral',
    description: 'Pan de trigo integral fresco',
    price: 3.99,
    category: 'Alimentos',
    categoryId: 'food',
    image: '/images/products/pan-integral.jpg',
    stock: 35,
    barcode: '1234567890129',
    sku: 'PAN-INTEGRAL-500G',
    tags: ['bread', 'whole-grain', 'fresh', 'healthy'],
    isNew: true,
    rating: 4.4,
    reviews: 89,
    weight: 500,
    dimensions: { length: 20, width: 10, height: 8 },
    createdAt: '2024-01-22T06:00:00Z',
    updatedAt: '2024-01-22T06:00:00Z'
  },
  {
    id: 'food-003',
    name: 'Leche Deslactosada',
    description: 'Leche sin lactosa 1L',
    price: 1.99,
    category: 'Bebidas',
    categoryId: 'beverages',
    image: '/images/products/leche-deslactosada.jpg',
    stock: 78,
    barcode: '1234567890130',
    sku: 'LECHE-DESLACT-1L',
    tags: ['milk', 'lactose-free', 'dairy', 'healthy'],
    rating: 4.1,
    reviews: 156,
    weight: 1000,
    dimensions: { length: 8, width: 8, height: 15 },
    createdAt: '2024-01-20T07:00:00Z',
    updatedAt: '2024-01-22T12:00:00Z'
  },

  // Hogar
  {
    id: 'home-001',
    name: 'Detergente Ariel',
    description: 'Detergente líquido para ropa 2.5L',
    price: 8.99,
    originalPrice: 11.99,
    category: 'Hogar',
    categoryId: 'household',
    image: '/images/products/detergente-ariel.jpg',
    stock: 45,
    barcode: '1234567890131',
    sku: 'DETERG-ARIEL-2.5L',
    tags: ['detergent', 'laundry', 'cleaning'],
    isOnSale: true,
    rating: 4.3,
    reviews: 234,
    weight: 2500,
    dimensions: { length: 15, width: 10, height: 25 },
    createdAt: '2023-12-10T10:00:00Z',
    updatedAt: '2024-01-15T14:20:00Z'
  },
  {
    id: 'home-002',
    name: 'Papel Higiénico Scott',
    description: 'Papel higiénico suave 12 rollos',
    price: 5.99,
    category: 'Hogar',
    categoryId: 'household',
    image: '/images/products/papel-scott.jpg',
    stock: 89,
    barcode: '1234567890132',
    sku: 'PAPEL-SCOTT-12',
    tags: ['toilet-paper', 'bathroom', 'tissue'],
    isPopular: true,
    rating: 4.0,
    reviews: 567,
    weight: 800,
    dimensions: { length: 12, width: 12, height: 20 },
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-01-18T15:45:00Z'
  },

  // Promociones
  {
    id: 'promo-001',
    name: 'Pack Cerveza Corona',
    description: 'Pack de 6 cervezas Corona 330ml',
    price: 12.99,
    originalPrice: 18.99,
    category: 'Bebidas',
    categoryId: 'beverages',
    image: '/images/products/corona-pack.jpg',
    stock: 23,
    barcode: '1234567890133',
    sku: 'CORONA-PACK-6',
    tags: ['beer', 'corona', 'pack', 'alcohol'],
    isOnSale: true,
    rating: 4.6,
    reviews: 89,
    weight: 1980,
    dimensions: { length: 25, width: 15, height: 12 },
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-21T13:00:00Z'
  },
  {
    id: 'promo-002',
    name: 'Chocolate KitKat',
    description: 'Chocolate KitKat 4 dedos',
    price: 1.49,
    originalPrice: 2.49,
    category: 'Alimentos',
    categoryId: 'food',
    image: '/images/products/kitkat.jpg',
    stock: 156,
    barcode: '1234567890134',
    sku: 'KITKAT-4DEDOS',
    tags: ['chocolate', 'candy', 'snack'],
    isOnSale: true,
    rating: 4.7,
    reviews: 892,
    weight: 41.5,
    dimensions: { length: 8, width: 2, height: 1 },
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
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