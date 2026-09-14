'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClients } from '@/hooks/use-clients';
import { ClientFormDialog } from '@/components/clients/ClientFormDialog';
import { ClientMutationPayload } from '@/types/client';
import { usePOSStore } from '@/stores/use-store-pos';

export function CreditPayment() {
  const { clients, create, loading } = useClients();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const setCustomerName = usePOSStore((s) => s.setCustomerName);
  const customerError = usePOSStore((s) => s.customerError);
  const setClientId = usePOSStore((s) => s.setClientId);
  const clientId = usePOSStore((s) => s.clientId);

  function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedIdStr = event.target.value;

    if (selectedIdStr === '') {
      setClientId(null);
      setCustomerName('');
      return;
    }

    const selectedId = Number(selectedIdStr);
    const client = clients.find((c) => c.id === selectedId);

    if (client) {
      setClientId(client.id);
      setCustomerName(client.name);
    }
  }

  async function handleCreateClient(data: ClientMutationPayload) {
    try {
      const newClient = await create(data);

      if (newClient && newClient.id) {
        setClientId(newClient.id);
        setCustomerName(newClient.name);
      } else {
        setCustomerName(data.name);
      }
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
            value={clientId ?? ''}
            onChange={handleSelectChange}
            aria-invalid={Boolean(customerError)}
            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecciona un cliente...</option>
            {loading ? (
              <option disabled>Cargando clientes...</option>
            ) : (
              clients.map((client) => (
                <option key={client.id} value={client.id}>
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

      {customerError ? (
        <p className="text-[11px] text-destructive px-0.5">{customerError}</p>
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
