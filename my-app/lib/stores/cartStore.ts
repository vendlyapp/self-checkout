import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Definir el tipo Product localmente (idéntico al de ProductCard)
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId: string;
  image?: string;
  stock: number;
  barcode?: string;
  sku: string;
  tags: string[];
  isNew?: boolean;
  isPopular?: boolean;
  isOnSale?: boolean;
  rating?: number;
  reviews?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
  unit?: string;
  availableWeights?: string[];
  hasWeight?: boolean;
  discountPercentage?: number;
}

export type CartItem = {
  product: Product
  quantity: number
}

interface CartState {
  cartItems: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      addToCart: (product, quantity = 1) => {
        set(state => {
          const existing = state.cartItems.find(item => item.product.id === product.id)
          if (existing) {
            return {
              cartItems: state.cartItems.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            }
          }
          return { cartItems: [...state.cartItems, { product, quantity }] }
        })
      },
      removeFromCart: (productId) => {
        set(state => ({ cartItems: state.cartItems.filter(item => item.product.id !== productId) }))
      },
      updateQuantity: (productId, quantity) => {
        set(state => ({
          cartItems: state.cartItems
            .map(item =>
              item.product.id === productId
                ? { ...item, quantity }
                : item
            )
            .filter(item => item.quantity > 0)
        }))
      },
      clearCart: () => set({ cartItems: [] })
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cartItems: state.cartItems })
    }
  )
) 