import { cn } from '@/lib/utils';
import { Product } from '@/types/pos';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <button
      onClick={() => !outOfStock && onAdd(product)}
      disabled={outOfStock}
      className={cn(
        'flex flex-col gap-1.5 p-3 rounded-xl border bg-card text-left transition-all',
        'hover:border-primary/40 active:scale-95',
        outOfStock && 'opacity-40 cursor-not-allowed',
      )}
    >
      <p className="text-xs font-medium leading-snug line-clamp-2">
        {product.name}
      </p>
      <p className="text-sm font-semibold text-primary">
        {formatCurrency(product.price)}
      </p>
      <p
        className={cn(
          'text-[11px]',
          outOfStock && 'text-destructive',
          lowStock && 'text-amber-500',
          !outOfStock && !lowStock && 'text-muted-foreground',
        )}
      >
        {outOfStock ? 'Agotado' : `Stock: ${product.stock}`}
      </p>
    </button>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);
}
