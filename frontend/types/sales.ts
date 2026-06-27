// types/sales.ts
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

// types/inventory.ts
export type StockLevel = 'ok' | 'low' | 'critical' | 'out';

export interface Product {
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  stockLevel: StockLevel;
}
