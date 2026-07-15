'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClients } from '@/hooks/use-clients';
import { ClientFormDialog } from '@/components/clients/ClientFormDialog';
import { ClientMutationPayload } from '@/types/client';

interface CreditPaymentProps {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

export function CreditPayment({ value, onChange, error }: CreditPaymentProps) {
  const { clients, create, loading } = useClients();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // CAMBIADO: El tipo correcto aquí es ClientMutationPayload
  async function handleCreateClient(data: ClientMutationPayload) {
    try {
      await create(data);
      onChange(data.name);
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error al crear cliente desde POS:', err);
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={Boolean(error)}
            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecciona un cliente...</option>
            {loading ? (
              <option disabled>Cargando clientes...</option>
            ) : (
              clients.map((client) => (
                <option key={client.id} value={client.name}>
                  {client.name} {client.doc ? `(${client.doc})` : ''} — Saldo: $
                  {client.balance.toLocaleString('es-CO')}
                </option>
              ))
            )}
          </select>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setIsDialogOpen(true)}
          title="Agregar nuevo cliente"
        >
          <UserPlus className="w-4 h-4" />
        </Button>
      </div>

      {error ? (
        <p className="text-[11px] text-destructive px-0.5">{error}</p>
      ) : (
        <p className="text-[11px] text-muted-foreground px-0.5">
          Se registrará en la cuenta corriente del cliente seleccionado.
        </p>
      )}

      <ClientFormDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleCreateClient}
      />
    </div>
  );
}
