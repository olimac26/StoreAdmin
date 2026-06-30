export type PayMethod = 'efectivo' | 'transferencia' | 'credito';

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  desc?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
}
export interface CartItem extends Product {
  qty: number;
}
