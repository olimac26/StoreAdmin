// components/pos/methods/QRPayment.tsx
interface QRPaymentProps {
  total: number;
}

export function QRPayment({ total }: QRPaymentProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 bg-muted/40 rounded-lg p-3 text-center border">
      <span className="text-4xl">📲</span>
      <p className="text-xs text-muted-foreground">Nequi / Daviplata</p>
      <p className="text-sm font-semibold text-primary">300 123 4567</p>
      <p className="text-xs text-muted-foreground">
        Monto:{' '}
        <span className="font-medium text-foreground">
          {formatCurrency(total)}
        </span>
      </p>
    </div>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);
}
