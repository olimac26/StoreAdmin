// components/pos/ProductGrid.tsx
'use client';

import { Search, Barcode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CategoryFilter } from './CategoryFilter';
import { ProductCard } from './ProductCard';
import { Product } from '@/types/pos';

interface ProductGridProps {
  products: Product[];
  onAdd: (product: Product) => void;
  searchQuery: string;
  onSearch: (q: string) => void;
  activeCategory: string;
  onCategory: (cat: string) => void;
}

export function ProductGrid({
  products,
  onAdd,
  searchQuery,
  onSearch,
  activeCategory,
  onCategory,
}: ProductGridProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden border-r">
      {/* Topbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-card">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar producto o SKU..."
            className="pl-8 h-8 bg-background text-sm"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <Barcode className="w-3.5 h-3.5" />
          Escanear
        </Button>
      </div>

      {/* Categorías */}
      <CategoryFilter active={activeCategory} onChange={onCategory} />

      {/* Grilla */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-3 content-start">
        {products.length === 0 ? (
          <div className="col-span-4 flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <Search className="w-8 h-8" />
            <span className="text-sm">Sin resultados</span>
          </div>
        ) : (
          products.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} />
          ))
        )}
      </div>
    </div>
  );
}
