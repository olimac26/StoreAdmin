'use client';

import { useState } from 'react';
import { Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CashPayment } from './methods/CashPayment';
import { QRPayment } from './methods/QRPayment';
import { CreditPayment } from './methods/CreditPayment';
import { PAYMENT_METHODS } from '@/constants/payment-methods';
import { CartItem, PayMethod } from '@/types/pos';
import { usePOSStore } from '@/stores/use-store-pos';
import { useSales } from '@/hooks/use-sales';
import { PaymentContext } from './PaymentContext';

interface PaymentPanelProps {
  items: CartItem[];
  onSale: () => Promise<void>;
}

function normalizeCustomerName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function PaymentPanel({ items, onSale }: PaymentPanelProps) {
  const { createSale } = useSales();
  const clearCart = usePOSStore((state) => state.clearCart);
  const [payMethod, setPayMethod] = useState<PayMethod>('efectivo');
  const [customerName, setCustomerName] = useState('');
  const [clientId, setClientId] = useState<number | null>(null);
  const [customerError, setCustomerError] = useState('');

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const disabled = items.length === 0;
  const isCheckoutDisabled = disabled || (payMethod === 'credito' && !clientId);

  function handleCustomerNameChange(name: string) {
    setCustomerName(name);
    if (customerError && name.trim()) setCustomerError('');
    if (!name.trim()) setClientId(null);
  }

  function handlePayMethodChange(method: PayMethod) {
    setPayMethod(method);
    if (method !== 'credito') setCustomerError('');
  }

  async function checkout() {
    if (disabled) return;

    const normalizedCustomer = normalizeCustomerName(customerName);
    if (payMethod === 'credito' && (!normalizedCustomer || !clientId)) {
      setCustomerError(
        'Debes buscar y seleccionar un cliente registrado para ventas a crédito.',
      );
      return;
    }

    setCustomerError('');
    const sale = await createSale({
      customer:
        payMethod === 'credito' ? normalizedCustomer : 'Cliente general',
      paymentMethod: payMethod,
      clientId: payMethod === 'credito' ? clientId : null,
      notes: 'Venta registrada desde POS',
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.qty,
        price: item.price,
      })),
    });

    if (!sale) return;

    clearCart();
    await onSale();
    setCustomerName('');
    setClientId(null);
  }

  const paymentContext = {
    clientId,
    customerError,
    onClientChange: setClientId,
    onCustomerNameChange: handleCustomerNameChange,
  };

  return (
    <PaymentContext.Provider value={paymentContext}>
      <div className="space-y-2.5">
        {/* Selector de método */}
        <div className="grid grid-cols-3 gap-1.5">
          {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handlePayMethodChange(id)}
              className={cn(
                'flex flex-col items-center gap-1 py-2 rounded-lg border text-xs transition-colors',
                payMethod === id
                  ? 'border-primary/40 bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted',
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Panel específico del método */}
        {!disabled && (
          <div>
            {payMethod === 'efectivo' && <CashPayment total={total} />}
            {payMethod === 'transferencia' && <QRPayment total={total} />}
            {payMethod === 'credito' && <CreditPayment />}
          </div>
        )}

        {/* Botón cobrar */}
        <Button
          className="w-full"
          disabled={isCheckoutDisabled}
          onClick={checkout}
        >
          {isCheckoutDisabled ? (
            <>
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              {payMethod === 'credito' && !clientId
                ? 'Seleccione un Cliente'
                : 'Cobrar'}
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5" /> Cobrar{' '}
              {formatCurrency(total)}
            </>
          )}
        </Button>
      </div>
    </PaymentContext.Provider>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);
}
