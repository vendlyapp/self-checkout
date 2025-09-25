import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/components/dashboard/products_list/data/mockProducts";

export type CartItem = {
  product: Product;
  quantity: number;
};

interface CartState {
  cartItems: CartItem[];
  promoCode: string;
  promoApplied: boolean;
  discountAmount: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => void;
  removePromoCode: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotalWithVAT: (vatRate?: number) => number;
  getTotalWithDiscount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      promoCode: "",
      promoApplied: false,
      discountAmount: 0,

      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existing = state.cartItems.find(
            (item) => item.product.id === product.id
          );
          if (existing) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.product.id === product.id ? { ...item, quantity } : item
              ),
            };
          }
          return { cartItems: [...state.cartItems, { product, quantity }] };
        });
      },
      removeFromCart: (productId) => {
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => item.product.id !== productId
          ),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          cartItems: state.cartItems
            .map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            )
            .filter((item) => item.quantity > 0),
        }));
      },
      clearCart: () =>
        set({
          cartItems: [],
          promoCode: "",
          promoApplied: false,
          discountAmount: 0,
        }),

      applyPromoCode: (code) => {
        const state = get();
        const subtotal = state.getSubtotal();

        if (code.trim().toUpperCase() === "CHECK01") {
          const discount = +(subtotal * 0.1).toFixed(2);
          set({
            promoCode: code,
            promoApplied: true,
            discountAmount: discount,
          });
        }
      },

      removePromoCode: () => {
        set({
          promoCode: "",
          promoApplied: false,
          discountAmount: 0,
        });
      },

      getTotalItems: () => {
        const state = get();
        return state.cartItems.reduce((sum, item) => sum + item.quantity, 0);
      },
      getSubtotal: () => {
        const state = get();
        return state.cartItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },
      getTotalWithVAT: (vatRate = 0.077) => {
        const state = get();
        const subtotal = state.getSubtotal();
        return subtotal * (1 + vatRate);
      },

      getTotalWithDiscount: () => {
        const state = get();
        const subtotal = state.getSubtotal();
        return +(subtotal - state.discountAmount).toFixed(2);
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        cartItems: state.cartItems,
        promoCode: state.promoCode,
        promoApplied: state.promoApplied,
        discountAmount: state.discountAmount,
      }),
    }
  )
);
