'use client';

import { useState } from 'react';
import { Search, Barcode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CategoryFilter } from './CategoryFilter';
import { ProductCard } from './ProductCard';
import { usePOSStore } from '@/stores/use-store-pos';
import { useDebounce } from '@/hooks/use-debounce';
import { Product } from '@/types/product';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  const addToCart = usePOSStore((s) => s.addToCart);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase());

    const matchesCategory = selectedCategory
      ? p.category === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden border-r">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-card">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar producto..."
            className="pl-8 h-8 bg-background text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <Barcode className="w-3.5 h-3.5" />
          Escanear
        </Button>
      </div>

      <CategoryFilter
        categories={
          [
            ...new Set(
              products.map((product) => product.category).filter(Boolean),
            ),
          ] as string[]
        }
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-3 content-start">
        {loading ? (
          <div className="col-span-4 flex items-center justify-center py-16 text-sm text-muted-foreground">
            Cargando productos...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-4 flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <Search className="w-8 h-8" />
            <span className="text-sm">Sin resultados</span>
          </div>
        ) : (
          filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={addToCart} />
          ))
        )}
      </div>
    </div>
  );
}
