export type OrderStatus = 'completed' | 'pending' | 'processing';

export interface Order {
  id: string;
  customer: string;
  time: string;
  status: OrderStatus;
  total: number;
}

export interface SaleMetric {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
}
