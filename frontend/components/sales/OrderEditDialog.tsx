'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sale } from '@/types/sale';
import { OrderEditForm } from './OrderEditForm';

interface OrderEditDialogProps {
  sale: Sale | null;
  onClose: () => void;
}

export function OrderEditDialog({
  sale,
  onClose,
}: OrderEditDialogProps) {
  return (
    <Dialog open={Boolean(sale)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {sale?.isVoided ? 'Venta anulada' : 'Editar venta'}
          </DialogTitle>
          <DialogDescription>
            {sale?.isVoided
              ? 'Puedes ver el detalle o eliminar esta venta.'
              : 'Puedes modificar los datos y cantidades de la venta sin eliminar el registro.'}
          </DialogDescription>
        </DialogHeader>

        {sale && (
          <OrderEditForm
            key={sale.id}
            sale={sale}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
