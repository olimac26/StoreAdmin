// types/pos.ts
export type PayMethod = 'efectivo' | 'transferencia' | 'credito';

export interface Product {
  id: number;
  name: string;
  emoji: string;
  price: number;
  category: string;
  stock: number;
}

export interface CartItem extends Product {
  qty: number;
}
