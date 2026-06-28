interface CartSummaryProps {
  subtotal: number;
  discount: number | null | undefined;
  total: number;
}

export function CartSummary({ subtotal, discount, total }: CartSummaryProps) {
  return (
    <div className="space-y-1 text-sm">
      <div className="flex justify-between text-muted-foreground text-xs">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      {discount !== null && discount !== undefined && discount > 0 && (
        <div className="flex justify-between text-xs text-green-600">
          <span>Descuento (5%)</span>
          <span>−{formatCurrency(discount || 0)}</span>
        </div>
      )}
      <div className="flex justify-between font-semibold text-base pt-1.5 border-t">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
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
