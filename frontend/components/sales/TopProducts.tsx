import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Product {
  rank: number;
  emoji: string;
  name: string;
  category: string;
  revenue: number;
  units: number;
}

const products: Product[] = [
  {
    rank: 1,
    emoji: '👟',
    name: 'Zapatillas Air Pro',
    category: 'Calzado',
    revenue: 980,
    units: 7,
  },
  {
    rank: 2,
    emoji: '👔',
    name: 'Camisa slim fit',
    category: 'Ropa',
    revenue: 640,
    units: 12,
  },
  {
    rank: 3,
    emoji: '🧢',
    name: 'Gorra snapback',
    category: 'Accesorios',
    revenue: 420,
    units: 18,
  },
  {
    rank: 4,
    emoji: '👗',
    name: 'Vestido casual',
    category: 'Ropa',
    revenue: 310,
    units: 5,
  },
  {
    rank: 5,
    emoji: '🕶️',
    name: 'Gafas de sol UV',
    category: 'Accesorios',
    revenue: 240,
    units: 8,
  },
];

const maxRevenue = Math.max(...products.map((p) => p.revenue));

const rankColors: Record<number, string> = {
  1: 'text-amber-500',
  2: 'text-slate-400',
  3: 'text-orange-400',
};

export function TopProducts() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Top productos</CardTitle>
          <span className="text-xs text-primary cursor-pointer hover:underline">
            Ver todos →
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.map((product) => {
          const pct = Math.round((product.revenue / maxRevenue) * 100);
          return (
            <div key={product.rank} className="flex items-center gap-3">
              <span
                className={cn(
                  'text-xs font-semibold w-4 text-center shrink-0',
                  rankColors[product.rank] ?? 'text-muted-foreground',
                )}
              >
                {product.rank}
              </span>

              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-base shrink-0">
                {product.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{product.name}</p>
                <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-medium">${product.revenue}</p>
                <p className="text-[11px] text-muted-foreground">
                  {product.units} uds
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
