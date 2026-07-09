'use client';

import { useState } from 'react';
import { ClientsTable } from '@/components/clients/ClientsTable';
import { ClientDrawer } from '@/components/clients/ClientDrawer';
import { ClientFormDialog } from '@/components/clients/ClientFormDialog';
import { DeleteDialog } from '@/components/ui/DeleteDialog';
import { useClients } from '@/hooks/use-clients';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Client, ClientMutationPayload } from '@/types/client';

export default function ClientsPage() {
  const { clients, create, update, remove, addPayment } = useClients();
  const [drawerClient, setDrawerClient] = useState<Client | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(c: Client) {
    setEditing(c);
    setFormOpen(true);
  }

  function handleSave(data: ClientMutationPayload) {
    if (editing) {
      update(editing.id, data);
    } else {
      create(data);
    }
    setFormOpen(false);
  }

  function handlePayment(clientId: number, amount: number) {
    addPayment(clientId, amount);
    const updated = clients.find((c) => c.id === clientId);
    if (updated) setDrawerClient({ ...updated });
  }

  function handleDelete() {
    if (!deleteTarget) return;

    remove(deleteTarget.id);
    setDeleteTarget(null);
  }

  const clientName = deleteTarget ? `"${deleteTarget.name}"` : '';

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            {clients.length} clientes registrados
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Nuevo cliente
        </Button>
      </div>

      <ClientsTable
        clients={clients}
        onSelect={setDrawerClient}
        onEdit={openEdit}
        onDelete={(c) => setDeleteTarget(c)}
      />

      <ClientDrawer
        client={drawerClient}
        onClose={() => setDrawerClient(null)}
        onPayment={handlePayment}
        onEdit={openEdit}
      />

      <DeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Eliminar cliente`}
        description={`El cliente ${clientName} y todo su historial de cuentas o abonos asociados serán eliminados. Esta acción no se puede deshacer.`}
      />

      <ClientFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        defaultValues={editing ?? undefined}
        onSave={handleSave}
      />
    </div>
  );
}
