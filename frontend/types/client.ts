export type HistoryItemType = 'credit' | 'payment';

export interface HistoryItem {
  id: number;
  type: HistoryItemType;
  desc: string;
  amount: number;
  date: string;
}

export interface Client {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  doc?: string;
  history: HistoryItem[];
}

export function getBalance(client: Client): number {
  return client.history.reduce(
    (acc, h) => (h.type === 'credit' ? acc + h.amount : acc - h.amount),
    0,
  );
}

export function getTotalPurchases(client: Client): number {
  return client.history
    .filter((h) => h.type === 'credit')
    .reduce((a, h) => a + h.amount, 0);
}

export type DebtStatus = 'ok' | 'partial' | 'debt' | 'none';

export function getDebtStatus(client: Client): DebtStatus {
  if (!client.history.length) return 'none';
  const balance = getBalance(client);
  if (balance <= 0) return 'ok';
  const total = getTotalPurchases(client);
  return balance < total ? 'partial' : 'debt';
}
