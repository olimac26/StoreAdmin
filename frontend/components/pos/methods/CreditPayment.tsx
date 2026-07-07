'use client';

import { Input } from '@/components/ui/input';

interface CreditPaymentProps {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

export function CreditPayment({ value, onChange, error }: CreditPaymentProps) {
  return (
    <div className="space-y-1.5">
      <Input
        placeholder="Nombre del cliente"
        className="h-8 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
      />
      {error ? (
        <p className="text-[11px] text-destructive px-0.5">{error}</p>
      ) : (
        <p className="text-[11px] text-muted-foreground px-0.5">
          Se registrará en la cuenta del cliente.
        </p>
      )}
    </div>
  );
}
