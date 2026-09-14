import { cn } from '@/lib/utils';
import { usePOSStore } from '@/stores/use-store-pos';
import { useMemo } from 'react';

export function CategoryFilter({}) {
  const activeCategory = usePOSStore((s) => s.activeCategory);
  const setActiveCategory = usePOSStore((s) => s.setActiveCategory);
  const products = usePOSStore((s) => s.products);

  const categories = useMemo(() => {
    return [
      ...new Set(products.map((p) => p.category).filter(Boolean)),
    ] as string[];
  }, [products]);

  return (
    <div className="flex gap-2 px-4 py-2.5 border-b overflow-x-auto scrollbar-none">
      {categories.map((cat, i) => (
        <button
          key={i}
          onClick={() => setActiveCategory(cat)}
          className={cn(
            'shrink-0 px-3 py-1 rounded-full border text-xs transition-colors',
            activeCategory === cat
              ? 'bg-accent/10 text-accent border-accent'
              : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted',
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
