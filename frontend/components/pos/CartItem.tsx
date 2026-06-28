import { CartItem as CartItemType } from '@/types/pos';

interface CartItemProps {
  item: CartItemType;
  onChangeQty: (id: number, delta: number) => void;
}

export function CartItem({ item, onChangeQty }: CartItemProps) {
  return (
    <div className="flex items-center gap-2 py-2.5">
      <span className="text-lg shrink-0">{item.emoji}</span>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{item.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {formatCurrency(item.price)} c/u
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChangeQty(item.id, -1)}
          className="w-5 h-5 rounded border text-sm flex items-center justify-center
                     hover:bg-muted transition-colors"
        >
          −
        </button>
        <span className="text-xs font-medium w-5 text-center">{item.qty}</span>
        <button
          onClick={() => onChangeQty(item.id, 1)}
          className="w-5 h-5 rounded border text-sm flex items-center justify-center
                     hover:bg-muted transition-colors"
        >
          +
        </button>
      </div>

      <span className="text-xs font-semibold min-w-13 text-right">
        {formatCurrency(item.price * item.qty)}
      </span>
    </div>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);
}
