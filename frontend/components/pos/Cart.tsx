'use client';

import { ShoppingCart } from 'lucide-react';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { PaymentPanel } from './PaymentPanel';
import { CartItem as CartItemType, PayMethod } from '@/types/pos';

interface CartProps {
  items: CartItemType[];
  onChangeQty: (id: number, delta: number) => void;
  onClear: () => void;
  onCheckout: () => void;
  payMethod: PayMethod;
  onPayMethod: (m: PayMethod) => void;
  customerName: string;
  onCustomerName: (v: string) => void;
  customerError?: string;
  subtotal: number;
  total: number;
}

export function Cart({
  items,
  onChangeQty,
  onClear,
  onCheckout,
  payMethod,
  onPayMethod,
  customerName,
  onCustomerName,
  customerError,
  subtotal,
  total,
}: CartProps) {
  return (
    <div className="w-100 shrink-0 flex flex-col bg-card border-l">
      {/* Header */}
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
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ShoppingCart className="w-8 h-8" />
            <span className="text-sm">Agrega productos</span>
          </div>
        ) : (
          <div className="divide-y">
            {items.map((item) => (
              <CartItem key={item.id} item={item} onChangeQty={onChangeQty} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t px-4 pt-3 pb-4 space-y-3">
        <CartSummary subtotal={subtotal} total={total} />
        <PaymentPanel
          payMethod={payMethod}
          onPayMethod={onPayMethod}
          customerName={customerName}
          onCustomerName={onCustomerName}
          total={total}
          disabled={items.length === 0}
          onCheckout={onCheckout}
          customerError={customerError}
        />
      </div>
    </div>
  );
}
