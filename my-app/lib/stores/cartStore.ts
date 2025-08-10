import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/components/dashboard/products_list/data/mockProducts'

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
  getTotalItems: () => number
  getSubtotal: () => number
  getTotalWithVAT: (vatRate?: number) => number
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
                  ? { ...item, quantity }
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
      clearCart: () => set({ cartItems: [] }),
      getTotalItems: () => {
        const state = get()
        return state.cartItems.reduce((sum, item) => sum + item.quantity, 0)
      },
      getSubtotal: () => {
        const state = get()
        return state.cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      },
      getTotalWithVAT: (vatRate = 0.077) => {
        const state = get()
        const subtotal = state.getSubtotal()
        return subtotal * (1 + vatRate)
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ cartItems: state.cartItems })
    }
  )
) 