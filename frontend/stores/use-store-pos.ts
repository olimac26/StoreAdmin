'use client';

import { create } from 'zustand';
import { CartItem } from '@/types/pos';
import { Product } from '@/types/product';

interface POSState {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  changeQty: (id: number, delta: number) => void;
  clearCart: () => void;
}

export const usePOSStore = create<POSState>((set) => ({
  cartItems: [],

  addToCart: (product) => {
    set((state) => {
      const existing = state.cartItems.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return state;
        return {
          cartItems: state.cartItems.map((item) =>
            item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
          ),
        };
      }
      return { cartItems: [...state.cartItems, { ...product, qty: 1 }] };
    });
  },

  changeQty: (id, delta) => {
    set((state) => ({
      cartItems: state.cartItems
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.qty + delta;
            if (delta > 0 && nextQty > item.stock) return item;
            return { ...item, qty: nextQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0),
    }));
  },

  clearCart: () => set({ cartItems: [] }),
}));
