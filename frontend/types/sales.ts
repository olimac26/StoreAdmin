export type OrderStatus = 'completed' | 'pending' | 'processing' | 'cancelled';

export interface SaleItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  customer: string;
  status: OrderStatus;
  total: number;
  paymentMethod: string;
  notes: string;
  isVoided: boolean;
  voidedAt?: string;
  voidReason?: string;
  createdAt: string;
  updatedAt: string;
  items: SaleItem[];
}

export interface Order extends Sale {
  time: string;
}

export interface SaleMetric {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
}

export interface CreateSalePayload {
  customer: string;
  status?: string;
  paymentMethod?: string;
  notes?: string;
  items: Array<{
    productId: number;
    quantity: number;
    price?: number;
  }>;
}

export interface UpdateSalePayload {
  customer?: string;
  status?: string;
  paymentMethod?: string;
  notes?: string;
  items?: Array<{
    productId: number;
    quantity: number;
    price?: number;
  }>;
}

export interface ReturnSalePayload {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
  reason?: string;
}
