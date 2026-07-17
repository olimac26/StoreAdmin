'use client';

import { useState, useEffect, useRef } from 'react';
import { Client, HistoryItem } from '@/types/client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

interface ClientAPI {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  doc: string | null;
  balance: number;
  total: number;
  created_at: string;
  updated_at: string;
  history?: HistoryItemAPI[];
}

interface HistoryItemAPI {
  id: number;
  client_id: number;
  type: 'credit' | 'payment';
  description: string;
  amount: number;
  date: string;
  order_id: string | null;
  created_at: string;
}

interface APIResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

function mapClient(c: ClientAPI): Client {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone ?? undefined,
    email: c.email ?? undefined,
    doc: c.doc ?? undefined,
    balance: c.balance,
    total: c.total,
    history: (c.history ?? []).map(mapHistoryItem),
  };
}

function mapHistoryItem(h: HistoryItemAPI): HistoryItem {
  return {
    id: h.id,
    type: h.type,
    desc: h.description,
    amount: h.amount,
    date: h.date,
    orderId: h.order_id ?? undefined,
  };
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }
  const json: APIResponse<T> = await res.json();
  return json.data;
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref para disparar recargas manuales sin que refetch sea dependencia del efecto
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const refetch = () => setFetchTrigger((n) => n + 1);

  // Ref para poder cancelar el fetch si el componente se desmonta
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancela cualquier fetch previo en vuelo
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/clients`, {
          headers: { 'Content-Type': 'application/json' },
          signal: abortRef.current?.signal,
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json: APIResponse<ClientAPI[]> = await res.json();
        setClients(json.data.map(mapClient));
      } catch (err) {
        // AbortError no es un error real — el componente se desmontó
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(
          err instanceof Error ? err.message : 'Error cargando clientes',
        );
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => {
      abortRef.current?.abort();
    };
  }, [fetchTrigger]); // solo re-ejecuta cuando se llama refetch()

  // ── Crear cliente ─────────────────────────────────────────────────────────
  async function create(
    data: Omit<Client, 'id' | 'history' | 'balance' | 'total'>,
  ): Promise<Client> {
    const response = await apiFetch<{ id: number }>('/api/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        phone: data.phone ?? null,
        email: data.email ?? null,
        doc: data.doc ?? null,
      }),
    });

    const newClient: Client = {
      id: response.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      doc: data.doc,
      balance: 0,
      total: 0,
      history: [],
    };

    setClients((prev) => [...prev, newClient]);

    refetch();

    return newClient;
  }

  // ── Actualizar cliente ────────────────────────────────────────────────────
  async function update(
    id: number,
    data: Partial<Omit<Client, 'id' | 'history' | 'balance' | 'total'>>,
  ) {
    await apiFetch(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: data.name ?? undefined,
        phone: data.phone ?? null,
        email: data.email ?? null,
        doc: data.doc ?? null,
      }),
    });
    // Optimista local mientras refetch trae la lista actualizada
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
    );
    refetch();
  }

  // ── Eliminar cliente ──────────────────────────────────────────────────────
  async function remove(id: number) {
    // Optimista: eliminar de UI inmediatamente
    setClients((prev) => prev.filter((c) => c.id !== id));
    try {
      await apiFetch(`/api/clients/${id}`, { method: 'DELETE' });
    } catch (err) {
      // Revertir si falla
      refetch();
      throw err;
    }
  }

  // ── Cargar historial de un cliente ────────────────────────────────────────
  async function fetchHistory(clientId: number): Promise<HistoryItem[]> {
    const data = await apiFetch<HistoryItemAPI[]>(
      `/api/clients/${clientId}/history`,
    );
    const history = data.map(mapHistoryItem);
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, history } : c)),
    );
    return history;
  }

  // ── Registrar abono ───────────────────────────────────────────────────────
  async function addPayment(clientId: number, amount: number) {
    await apiFetch(`/api/clients/${clientId}/history`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'payment',
        description: 'Abono registrado',
        amount,
      }),
    });
    // Optimista local
    const item: HistoryItem = {
      id: Date.now(),
      type: 'payment',
      desc: 'Abono registrado',
      amount,
      date: new Date().toISOString().split('T')[0],
    };
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, balance: c.balance - amount, history: [...c.history, item] }
          : c,
      ),
    );
  }

  // ── Registrar crédito (desde POS) ─────────────────────────────────────────
  async function addCredit(
    clientId: number,
    amount: number,
    desc: string,
    orderId?: string,
  ) {
    await apiFetch(`/api/clients/${clientId}/history`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'credit',
        description: desc,
        amount,
        order_id: orderId ?? null,
      }),
    });
    const item: HistoryItem = {
      id: Date.now(),
      type: 'credit',
      desc,
      amount,
      date: new Date().toISOString().split('T')[0],
      orderId,
    };
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              balance: c.balance + amount,
              total: c.total + amount,
              history: [...c.history, item],
            }
          : c,
      ),
    );
  }

  return {
    clients,
    loading,
    error,
    refetch,
    create,
    update,
    remove,
    fetchHistory,
    addPayment,
    addCredit,
  };
}
