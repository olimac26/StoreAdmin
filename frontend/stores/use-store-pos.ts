'use client';

import { create } from 'zustand';
import { CartItem, PayMethod, CreateSalePayload } from '@/types/pos';
import { Product } from '@/types/product';
import { Sale } from '@/types/sale';

function normalizeCustomerName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

interface POSState {
  products: Product[];
  cartItems: CartItem[];
  searchQuery: string;
  activeCategory: string;
  payMethod: PayMethod;
  customerName: string;
  clientId: number | null;
  customerError: string;
  loading: boolean;

  setLoading: (loading: boolean) => void;
  setProducts: (products: Product[]) => void;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: string) => void;
  setPayMethod: (method: PayMethod) => void;
  setCustomerName: (name: string) => void;
  setClientId: (id: number | null) => void;
  addToCart: (product: Product) => void;
  changeQty: (id: number, delta: number) => void;
  clearCart: () => void;
  checkout: (
    createSale: (payload: CreateSalePayload) => Promise<Sale | null | void>,
  ) => Promise<void>;
}

export const usePOSStore = create<POSState>((set, get) => ({
  products: [],
  cartItems: [],
  searchQuery: '',
  activeCategory: 'todos',
  payMethod: 'efectivo',
  customerName: '',
  clientId: null,
  customerError: '',
  loading: false,

  setLoading: (loading) => set({ loading }),
  setProducts: (products) => set({ products }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setClientId: (clientId) => set({ clientId }),

  setPayMethod: (payMethod) => {
    set({ payMethod });
    if (payMethod !== 'credito') {
      set({ customerError: '' });
    }
  },

  setCustomerName: (customerName) => {
    set({ customerName });
    if (get().customerError && customerName.trim()) {
      set({ customerError: '' });
    }
    if (!customerName.trim()) {
      set({ clientId: null });
    }
  },

  addToCart: (product) => {
    set((state) => {
      const existing = state.cartItems.find((i) => i.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return state;
        return {
          cartItems: state.cartItems.map((i) =>
            i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
          ),
        };
      }
      return { cartItems: [...state.cartItems, { ...product, qty: 1 }] };
    });
  },

  changeQty: (id, delta) => {
    set((state) => ({
      cartItems: state.cartItems
        .map((i) => {
          if (i.id === id) {
            const nextQty = i.qty + delta;
            if (delta > 0 && nextQty > i.stock) return i;
            return { ...i, qty: nextQty };
          }
          return i;
        })
        .filter((i) => i.qty > 0),
    }));
  },

  clearCart: () => set({ cartItems: [] }),

  checkout: async (createSale) => {
    const { cartItems, customerName, payMethod, clientId } = get();
    if (cartItems.length === 0) return;

    const normalizedCustomer = normalizeCustomerName(customerName);

    if (payMethod === 'credito') {
      if (normalizedCustomer.trim() === '' || !clientId) {
        set({
          customerError:
            'Debes buscar y seleccionar un cliente registrado para ventas a crédito.',
        });
        return;
      }
    }

    set({ customerError: '' });

    const payload: CreateSalePayload = {
      customer:
        payMethod === 'credito' ? normalizedCustomer : 'Cliente general',
      paymentMethod: payMethod,
      clientId: payMethod === 'credito' ? clientId : null,
      client_id: payMethod === 'credito' ? clientId : null,
      notes: 'Venta registrada desde POS',
      items: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.qty,
        price: item.price,
      })),
    };

    const sale = await createSale(payload);
    if (!sale) return;

    set((state) => ({
      products: state.products.map((product) => {
        const soldItem = cartItems.find((item) => item.id === product.id);
        return soldItem
          ? { ...product, stock: product.stock - soldItem.qty }
          : product;
      }),
    }));

    get().clearCart();
    set({ customerName: '', clientId: null });
  },
}));
