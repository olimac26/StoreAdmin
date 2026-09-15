import { Banknote, QrCode, Receipt, LucideIcon } from 'lucide-react';
import { PayMethod } from '@/types/pos';

export interface PaymentMethodConfig {
  id: PayMethod;
  label: string;
  icon: LucideIcon;
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: 'efectivo', label: 'Efectivo', icon: Banknote },
  { id: 'transferencia', label: 'QR / Transfer', icon: QrCode },
  { id: 'credito', label: 'Crédito', icon: Receipt },
];
