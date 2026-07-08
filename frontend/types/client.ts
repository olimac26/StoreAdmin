// types/client.ts
export type HistoryItemType = 'credit' | 'payment';

export interface HistoryItem {
  id: number;
  type: HistoryItemType;
  desc: string;
  amount: number;
  date: string;
  orderId?: string;
}

export interface Client {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  doc?: string;
  balance: number; // ← viene calculado del backend
  total: number; // ← viene calculado del backend
  history: HistoryItem[];
}

export type DebtStatus = 'ok' | 'partial' | 'debt' | 'none';

export type ClientMutationPayload = Omit<
  Client,
  'id' | 'balance' | 'total' | 'created_at' | 'updated_at' | 'history'
>;

export function getBalance(client: Client): number {
  return client.balance; // ya no se calcula en frontend
}

export function getTotalPurchases(client: Client): number {
  return client.total;
}

export function getDebtStatus(client: Client): DebtStatus {
  if (!client.history.length && client.balance === 0) return 'none';
  if (client.balance <= 0) return 'ok';
  if (client.balance < client.total) return 'partial';
  return 'debt';
}
