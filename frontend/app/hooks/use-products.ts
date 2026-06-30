'use client';

import { useState } from 'react';
import { Product } from '@/types/pos';

const INITIAL: Product[] = [
  {
    id: 1,
    name: 'Zapatillas Air Pro',
    sku: 'SKU-001',
    barcode: '7891234000001',
    category: 'Calzado',
    price: 145000,
    cost: 80000,
    stock: 3,
    minStock: 15,
  },
  // ... resto de productos
];

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(INITIAL);

  function create(data: Omit<Product, 'id'>) {
    setProducts((prev) => [{ ...data, id: Date.now() }, ...prev]);
  }

  function update(id: number, data: Partial<Product>) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p)),
    );
  }

  function remove(id: number) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return { products, create, update, remove };
}
