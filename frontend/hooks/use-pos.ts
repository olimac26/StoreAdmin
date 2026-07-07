'use client';

import { useState, useMemo } from 'react';
import { CartItem, PayMethod } from '@/types/pos';
import { Product } from '@/types/product';
import { useProducts } from './use-products';
import { useCategories } from './use-categories';
import { useSales } from './use-sales';

function normalizeCustomerName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function usePOS() {
  const { products, loading: productsLoading } = useProducts();
  const { loading: categoriesLoading } = useCategories();
  const { createSale } = useSales();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [payMethod, setPayMethod] = useState<PayMethod>('efectivo');
  const [customerName, setCustomerName] = useState('');
  const [customerError, setCustomerError] = useState('');

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
        .map((i) => {
          if (i.id === id) {
            const nextQty = i.qty + delta;
            if (delta > 0 && nextQty > i.stock) return i;
            return { ...i, qty: nextQty };
          }
          return i;
        })
        .filter((i) => i.qty > 0),
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  function handleCustomerNameChange(value: string) {
    setCustomerName(value);
    if (customerError && value.trim()) {
      setCustomerError('');
    }
  }

  function handlePayMethodChange(value: PayMethod) {
    setPayMethod(value);
    if (value !== 'credito') {
      setCustomerError('');
    }
  }

  async function checkout() {
    if (cartItems.length === 0) return;

    const normalizedCustomer = normalizeCustomerName(customerName);

    if (payMethod === 'credito' && normalizedCustomer.trim() === '') {
      setCustomerError(
        'El nombre del cliente es obligatorio para ventas a crédito.',
      );
      return;
    }

    setCustomerError('');

    const payload = {
      customer:
        payMethod === 'credito' ? normalizedCustomer : 'Cliente general',
      paymentMethod: payMethod,
      notes: 'Venta registrada desde POS',
      items: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.qty,
        price: item.price,
      })),
    };

    await createSale(payload);
    clearCart();
    setCustomerName('');
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
    setPayMethod: handlePayMethodChange,
    customerName,
    setCustomerName: handleCustomerNameChange,
    addToCart,
    changeQty,
    clearCart,
    checkout,
    subtotal,
    total,
    customerError,
    loading: productsLoading || categoriesLoading,
  };
}
