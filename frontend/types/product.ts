export interface Product {
  id: number;
  name: string;
  barcode?: string;
  category: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}
