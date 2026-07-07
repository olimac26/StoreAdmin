'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getBalance } from '@/types/client';
import { Client } from '@/types/client';

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);

interface PaymentFormProps {
  client: Client;
  onPayment: (clientId: number, amount: number) => void;
}

export function PaymentForm({ client, onPayment }: PaymentFormProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const balance = getBalance(client);

  function handlePay() {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      setError('Ingresa un monto válido');
      return;
    }
    if (val > balance) {
      setError(`El abono supera el saldo (${formatCurrency(balance)})`);
      return;
    }
    onPayment(client.id, val);
    setAmount('');
    setError('');
  }

  if (balance <= 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-2">
        Este cliente no tiene saldo pendiente.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5 flex-wrap">
        {QUICK_AMOUNTS.filter((a) => a <= balance).map((a) => (
          <button
            key={a}
            onClick={() => {
              setAmount(String(a));
              setError('');
            }}
            className={cn(
              'px-3 py-1 rounded-full border text-xs transition-colors',
              amount === String(a)
                ? 'border-primary/40 bg-primary/5 text-primary font-medium'
                : 'border-border text-muted-foreground hover:bg-muted',
            )}
          >
            {a >= 1000 ? `$${a / 1000}k` : `$${a}`}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Monto del abono"
          className="h-8 text-sm"
          value={amount}
          min={0}
          step={1000}
          onChange={(e) => {
            setAmount(e.target.value);
            setError('');
          }}
        />
        <Button size="sm" className="h-8 shrink-0 gap-1" onClick={handlePay}>
          Abonar
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
