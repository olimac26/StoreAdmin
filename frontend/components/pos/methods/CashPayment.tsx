'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000];

interface CashPaymentProps {
  total: number;
}

export function CashPayment({ total }: CashPaymentProps) {
  const [received, setReceived] = useState<string>('');

  const receivedNum = parseFloat(received) || 0;
  const change = receivedNum - total;
  const hasInput = receivedNum > 0;

  return (
    <div className="space-y-2">
      {/* Billetes rápidos */}
      <div className="grid grid-cols-4 gap-1">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => setReceived(String(amount))}
            className={cn(
              'py-1.5 rounded border text-[11px] transition-colors',
              received === String(amount)
                ? 'border-primary/40 bg-primary/5 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted',
            )}
          >
            {amount >= 1000 ? `$${amount / 1000}k` : `$${amount}`}
          </button>
        ))}
      </div>

      {/* Input monto */}
      <Input
        type="number"
        placeholder="Monto recibido"
        className="h-8 text-sm"
        value={received}
        onChange={(e) => setReceived(e.target.value)}
        min={0}
        step={1000}
      />

      {/* Cambio */}
      {hasInput && (
        <div
          className={cn(
            'flex justify-between text-sm font-medium rounded-lg px-3 py-2',
            change >= 0
              ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
              : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
          )}
        >
          <span>{change >= 0 ? 'Cambio' : 'Falta'}</span>
          <span>{formatCurrency(Math.abs(change))}</span>
        </div>
      )}
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
