'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useSales } from '@/hooks/use-sales';

type SalesContextValue = ReturnType<typeof useSales>;

const SalesContext = createContext<SalesContextValue | null>(null);

export function SalesProvider({ children }: { children: ReactNode }) {
  const sales = useSales();

  return (
    <SalesContext.Provider value={sales}>{children}</SalesContext.Provider>
  );
}

export function useSalesContext() {
  const context = useContext(SalesContext);

  if (!context) {
    throw new Error('useSalesContext must be used inside SalesProvider');
  }

  return context;
}