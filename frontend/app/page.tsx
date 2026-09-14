'use client';

import { useEffect } from 'react';
import { Cart } from '@/components/pos/Cart';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { usePOSStore } from '@/stores/use-store-pos';

export default function Home() {
  const { products, loading: productsLoading } = useProducts();
  const { loading: categoriesLoading } = useCategories();

  const setProducts = usePOSStore((s) => s.setProducts);
  const setLoading = usePOSStore((s) => s.setLoading);

  useEffect(() => {
    if (products) {
      setProducts(products);
    }
  }, [products, setProducts]);

  useEffect(() => {
    setLoading(productsLoading || categoriesLoading);
  }, [productsLoading, categoriesLoading, setLoading]);

  return (
    <div className="flex h-full bg-background overflow-hidden">
      <ProductGrid />
      <Cart />
    </div>
  );
}
