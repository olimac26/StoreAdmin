'use client';

import { Cart } from '@/components/pos/Cart';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { useProducts } from '@/hooks/use-products';

export default function Home() {
  const { products, loading, refetch } = useProducts();

  return (
    <div className="flex h-full bg-background overflow-hidden">
      <ProductGrid products={products} loading={loading} />
      <Cart onSale={refetch} />
    </div>
  );
}
