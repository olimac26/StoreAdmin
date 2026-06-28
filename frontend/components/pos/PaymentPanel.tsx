'use client';

import { Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CashPayment } from './methods/CashPayment';
import { QRPayment } from './methods/QRPayment';
import { CreditPayment } from './methods/CreditPayment';
import { PayMethod } from '@/types/pos';

const METHODS: { id: PayMethod; label: string; icon: string }[] = [
  { id: 'efectivo', label: 'Efectivo', icon: '💵' },
  { id: 'transferencia', label: 'QR / Transfer', icon: '📲' },
  { id: 'credito', label: 'Crédito', icon: '🧾' },
];

interface PaymentPanelProps {
  payMethod: PayMethod;
  onPayMethod: (m: PayMethod) => void;
  total: number;
  disabled: boolean;
  onCheckout: () => void;
}

export function PaymentPanel({
  payMethod,
  onPayMethod,
  total,
  disabled,
  onCheckout,
}: PaymentPanelProps) {
  return (
    <div className="space-y-2.5">
      {/* Selector de método */}
      <div className="grid grid-cols-3 gap-1.5">
        {METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => onPayMethod(m.id)}
            className={cn(
              'flex flex-col items-center gap-1 py-2 rounded-lg border text-xs transition-colors',
              payMethod === m.id
                ? 'border-primary/40 bg-primary/5 text-primary'
                : 'border-border text-muted-foreground hover:bg-muted',
            )}
          >
            <span className="text-base">{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Panel específico del método */}
      {!disabled && (
        <div>
          {payMethod === 'efectivo' && <CashPayment total={total} />}
          {payMethod === 'transferencia' && <QRPayment total={total} />}
          {payMethod === 'credito' && <CreditPayment />}
        </div>
      )}

      {/* Botón cobrar */}
      <Button className="w-full" disabled={disabled} onClick={onCheckout}>
        {disabled ? (
          <>
            <Lock className="w-3.5 h-3.5 mr-1.5" /> Cobrar
          </>
        ) : (
          <>
            <Check className="w-3.5 h-3.5 mr-1.5" /> Cobrar{' '}
            {formatCurrency(total)}
          </>
        )}
      </Button>
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
