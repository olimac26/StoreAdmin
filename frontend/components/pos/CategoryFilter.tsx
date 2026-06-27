// components/pos/CategoryFilter.tsx
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'calzado', label: 'Calzado' },
  { id: 'ropa', label: 'Ropa' },
  { id: 'accesorios', label: 'Accesorios' },
  { id: 'tecnologia', label: 'Tecnología' },
  { id: 'hogar', label: 'Hogar' },
];

interface CategoryFilterProps {
  active: string;
  onChange: (cat: string) => void;
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 px-4 py-2.5 border-b overflow-x-auto scrollbar-none">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={cn(
            'shrink-0 px-3 py-1 rounded-full border text-xs transition-colors',
            active === cat.id
              ? 'bg-accent/10 text-accent border-accent'
              : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted',
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
