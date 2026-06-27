// components/pos/methods/CreditPayment.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';

export function CreditPayment() {
  const [name, setName] = useState('');

  return (
    <div className="space-y-1.5">
      <Input
        placeholder="Nombre del cliente"
        className="h-8 text-sm"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p className="text-[11px] text-muted-foreground px-0.5">
        Se registrará en la cuenta del cliente.
      </p>
    </div>
  );
}
