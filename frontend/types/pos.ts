import { Product } from './product';

export type PayMethod = 'efectivo' | 'transferencia' | 'credito';

export interface CartItem extends Product {
  qty: number;
}

export interface SaleItemPayload {
  productId: number;
  quantity: number;
  price: number;
}
