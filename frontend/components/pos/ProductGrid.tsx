'use client';

import { Search, Barcode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CategoryFilter } from './CategoryFilter';
import { ProductCard } from './ProductCard';
import { usePOSStore } from '@/stores/use-store-pos';
// import { Product } from '@/types/product';

export function ProductGrid({}) {
  const products = usePOSStore((s) => s.products);
  const searchQuery = usePOSStore((s) => s.searchQuery);
  const setSearchQuery = usePOSStore((s) => s.setSearchQuery);
  const addToCart = usePOSStore((s) => s.addToCart);

  return (
    <div className="flex-1 flex flex-col overflow-hidden border-r">
      {/* Topbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-card">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar producto"
            className="pl-8 h-8 bg-background text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <Barcode className="w-3.5 h-3.5" />
          Escanear
        </Button>
      </div>

      {/* Categorías */}
      <CategoryFilter />

      {/* Grilla */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-3 content-start">
        {products.length === 0 ? (
          <div className="col-span-4 flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <Search className="w-8 h-8" />
            <span className="text-sm">Sin resultados</span>
          </div>
        ) : (
          products.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={addToCart} />
          ))
        )}
      </div>
    </div>
  );
}
