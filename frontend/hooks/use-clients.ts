'use client';

import { useState } from 'react';
import { Client, HistoryItem } from '@/types/client';

const INITIAL: Client[] = [
  {
    id: 1,
    name: 'Carlos Mendoza',
    phone: '300 123 4567',
    email: 'carlos@email.com',
    doc: '10234567',
    history: [
      {
        id: 1,
        type: 'credit',
        desc: 'Compra #0035',
        amount: 312000,
        date: '2026-07-01',
      },
      {
        id: 2,
        type: 'payment',
        desc: 'Abono en efectivo',
        amount: 100000,
        date: '2026-07-02',
      },
      {
        id: 3,
        type: 'credit',
        desc: 'Compra #0041',
        amount: 89000,
        date: '2026-07-04',
      },
    ],
  },
  // ...resto de clientes
];

export function useClients() {
  const [clients, setClients] = useState<Client[]>(INITIAL);

  function create(data: Omit<Client, 'id' | 'history'>) {
    setClients((prev) => [{ ...data, id: Date.now(), history: [] }, ...prev]);
  }

  function update(id: number, data: Partial<Omit<Client, 'id' | 'history'>>) {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
    );
  }

  function remove(id: number) {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  function addPayment(clientId: number, amount: number) {
    const item: HistoryItem = {
      id: Date.now(),
      type: 'payment',
      desc: 'Abono registrado',
      amount,
      date: new Date().toISOString().split('T')[0],
    };
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, history: [...c.history, item] } : c,
      ),
    );
  }

  function addCredit(clientId: number, amount: number, desc: string) {
    const item: HistoryItem = {
      id: Date.now(),
      type: 'credit',
      desc,
      amount,
      date: new Date().toISOString().split('T')[0],
    };
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, history: [...c.history, item] } : c,
      ),
    );
  }

  return { clients, create, update, remove, addPayment, addCredit };
}
