'use client';

import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 px-4 py-2.5 border-b overflow-x-auto scrollbar-none">
      <button
        onClick={() => onSelectCategory(null)}
        className={cn(
          'shrink-0 px-3 py-1 rounded-full border text-xs transition-colors',
          selectedCategory === null
            ? 'bg-primary/10 text-primary border-primary font-medium'
            : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted',
        )}
      >
        Todos
      </button>

      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() =>
            onSelectCategory(selectedCategory === cat ? null : cat)
          }
          className={cn(
            'shrink-0 px-3 py-1 rounded-full border text-xs transition-colors',
            selectedCategory === cat
              ? 'bg-primary/10 text-primary border-primary font-medium'
              : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted',
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
