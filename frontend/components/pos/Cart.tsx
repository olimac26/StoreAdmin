'use client';

import { ShoppingCart } from 'lucide-react';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { PaymentPanel } from './PaymentPanel';
import { usePOSStore } from '@/stores/use-store-pos';
import { useSales } from '@/hooks/use-sales';

export function Cart() {
  const { createSale } = useSales();

  const items = usePOSStore((s) => s.cartItems);
  const changeQty = usePOSStore((s) => s.changeQty);
  const clearCart = usePOSStore((s) => s.clearCart);
  const checkout = usePOSStore((s) => s.checkout);

  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const total = subtotal;

  return (
    <div className="w-100 shrink-0 flex flex-col bg-card border-l">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="text-sm font-medium flex items-center gap-1.5">
          <ShoppingCart className="w-4 h-4" />
          Orden actual
          {items.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({items.reduce((a, i) => a + i.qty, 0)})
            </span>
          )}
        </span>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ShoppingCart className="w-8 h-8" />
            <span className="text-sm">Agrega productos</span>
          </div>
        ) : (
          <div className="divide-y">
            {items.map((item) => (
              <CartItem key={item.id} item={item} onChangeQty={changeQty} />
            ))}
          </div>
        )}
      </div>

      <div className="border-t px-4 pt-3 pb-4 space-y-3">
        <CartSummary subtotal={subtotal} total={total} />
        <PaymentPanel
          total={total}
          disabled={items.length === 0}
          onCheckout={() => checkout(createSale)}
        />
      </div>
    </div>
  );
}
