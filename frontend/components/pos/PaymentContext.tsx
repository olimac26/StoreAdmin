'use client';

import { createContext, useContext } from 'react';

interface PaymentContextValue {
  clientId: number | null;
  customerError: string;
  onClientChange: (clientId: number | null) => void;
  onCustomerNameChange: (name: string) => void;
}

export const PaymentContext = createContext<PaymentContextValue | null>(null);

export function usePaymentContext() {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePaymentContext must be used inside PaymentPanel');
  }
  return context;
}
