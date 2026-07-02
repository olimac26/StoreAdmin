'use client';

import { useState, useMemo } from 'react';
import { CartItem, PayMethod } from '@/types/pos';
import { Product } from '@/types/product';
import { useProducts } from './use-products';
import { useCategories } from './use-categories';

export function usePOS() {
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [payMethod, setPayMethod] = useState<PayMethod>('efectivo');

  // Map backend category names to product category field
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (activeCategory === 'todos') return true;
        return p.category === activeCategory;
      })
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, searchQuery, activeCategory]);

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
    console.log('Registrando venta:', cartItems, payMethod);
    clearCart();
  }

  const subtotal = cartItems.reduce((a, i) => a + i.price * i.qty, 0);
  const total = subtotal;

  // Get unique categories from products
  const uniqueCategories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
    return cats as string[];
  }, [products]);

  return {
    products: filteredProducts,
    categories: uniqueCategories,
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
    total,
    loading: productsLoading || categoriesLoading,
  };
}
