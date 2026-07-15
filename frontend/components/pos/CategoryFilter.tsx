import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  active: string;
  onChange: (cat: string) => void;
  categories: string[];
}

export function CategoryFilter({
  active,
  onChange,
  categories,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 px-4 py-2.5 border-b overflow-x-auto scrollbar-none">
      {categories.map((cat, i) => (
        <button
          key={i}
          onClick={() => onChange(cat)}
          className={cn(
            'shrink-0 px-3 py-1 rounded-full border text-xs transition-colors',
            active === cat
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
