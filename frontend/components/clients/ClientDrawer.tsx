'use client';

import { Pencil } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PaymentForm } from './PaymentForm';
import { cn } from '@/lib/utils';
import {
  Client,
  getBalance,
  getTotalPurchases,
  getDebtStatus,
} from '@/types/client';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

interface ClientDrawerProps {
  client: Client | null;
  onClose: () => void;
  onPayment: (clientId: number, amount: number) => void;
  onEdit: (client: Client) => void;
}

export function ClientDrawer({
  client,
  onClose,
  onPayment,
  onEdit,
}: ClientDrawerProps) {
  if (!client) return null;

  const balance = getBalance(client);
  const total = getTotalPurchases(client);
  const payments = client.history
    .filter((h) => h.type === 'payment')
    .reduce((a, h) => a + h.amount, 0);
  const status = getDebtStatus(client);

  const history = [...client.history].reverse();

  return (
    <Sheet open={!!client} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-100 sm:w-110 flex flex-col p-0 gap-0">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b">
          <div className="flex items-start justify-between">
            <SheetTitle className="sr-only">Detalle del cliente</SheetTitle>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                {initials(client.name)}
              </div>
              <div>
                <p className="text-base font-medium text-foreground">
                  {client.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[client.phone, client.email, client.doc]
                    .filter(Boolean)
                    .join(' · ') || 'Sin información adicional'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => onEdit(client)}
              aria-label="Editar cliente"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          </div>
        </SheetHeader>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 px-5 py-4 border-b">
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="text-base font-semibold">{formatCurrency(total)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total compras
            </p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="text-base font-semibold">
              {formatCurrency(payments)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total abonado
            </p>
          </div>
          <div
            className={cn(
              'rounded-lg p-3',
              balance > 0 ? 'bg-destructive/10' : 'bg-green-500/10',
            )}
          >
            <p
              className={cn(
                'text-base font-semibold',
                balance > 0
                  ? 'text-destructive'
                  : 'text-green-600 dark:text-green-400',
              )}
            >
              {formatCurrency(Math.max(balance, 0))}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Saldo pendiente
            </p>
          </div>
        </div>

        {/* Body con scroll */}
        <div className="flex-1 overflow-y-auto">
          {/* Registrar abono */}
          <div className="px-5 py-4 border-b">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Registrar abono
            </p>
            <PaymentForm client={client} onPayment={onPayment} />
          </div>

          {/* Historial */}
          <div className="px-5 py-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Historial de créditos
            </p>

            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Sin historial de créditos
              </p>
            ) : (
              <div className="divide-y">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center gap-3 py-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0',
                        h.type === 'credit'
                          ? 'bg-destructive/10'
                          : 'bg-green-500/10',
                      )}
                    >
                      {h.type === 'credit' ? '🛒' : '💵'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{h.desc}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(h.date)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'text-sm font-medium shrink-0',
                        h.type === 'credit'
                          ? 'text-destructive'
                          : 'text-green-600 dark:text-green-400',
                      )}
                    >
                      {h.type === 'credit' ? '−' : '+'}
                      {formatCurrency(h.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer con estado */}
        <div className="px-5 py-3 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                status === 'ok' && 'bg-green-500',
                status === 'partial' && 'bg-amber-500',
                status === 'debt' && 'bg-destructive',
                status === 'none' && 'bg-muted-foreground',
              )}
            />
            <span className="text-xs text-muted-foreground">
              {status === 'ok' && 'Cuenta al día'}
              {status === 'partial' && 'Pago parcial pendiente'}
              {status === 'debt' && 'Saldo pendiente por cobrar'}
              {status === 'none' && 'Sin historial de créditos'}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
