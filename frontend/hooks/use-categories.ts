'use client';

import { useState } from 'react';
import { Category } from '@/types/product';

const INITIAL: Category[] = [
  { id: 1, name: 'Calzado', description: 'Zapatos, zapatillas y botas' },
  { id: 2, name: 'Ropa', description: 'Camisas, pantalones y vestidos' },
  { id: 3, name: 'Accesorios', description: 'Gorras, gafas y bolsos' },
  { id: 4, name: 'Tecnología', description: 'Electrónicos y gadgets' },
  { id: 5, name: 'Hogar', description: 'Artículos para el hogar' },
];

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(INITIAL);

  function create(name: string, description?: string) {
    setCategories((prev) => [...prev, { id: Date.now(), name, description }]);
  }

  function update(id: number, name: string, description?: string) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, description } : c)),
    );
  }

  function remove(id: number) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return { categories, create, update, remove };
}
