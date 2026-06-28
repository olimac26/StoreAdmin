'use client';

import { useState, useMemo } from 'react';
import { Product, CartItem, PayMethod } from '@/types/pos';
import { PRODUCTS } from '@/app/mocks/products';

export function usePOS() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [payMethod, setPayMethod] = useState<PayMethod>('efectivo');

  const products = useMemo(() => {
    // Aquí harías fetch a tu API
    return PRODUCTS.filter(
      (p) => activeCategory === 'todos' || p.category === activeCategory,
    ).filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, activeCategory]);

  function addToCart(product: Product) {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function changeQty(id: number, delta: number) {
    setCartItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  function checkout() {
    // Llamada a tu API para registrar la venta
    console.log('Registrando venta:', cartItems, payMethod);
    clearCart();
  }

  const subtotal = cartItems.reduce((a, i) => a + i.price * i.qty, 0);
  const discount = cartItems.length >= 3 ? subtotal * 0.05 : 0;
  const total = subtotal - discount;

  return {
    products,
    cartItems,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    payMethod,
    setPayMethod,
    addToCart,
    changeQty,
    clearCart,
    checkout,
    subtotal,
    discount,
    total,
  };
}
