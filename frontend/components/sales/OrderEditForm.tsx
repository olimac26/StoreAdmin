import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DialogFooter } from '../ui/dialog';
import { Sale } from '@/types/sale';
import { useSalesContext } from '@/contexts/sales-context';

interface OrderEditFormProps {
  sale: Sale;
  onClose: () => void;
}

export function OrderEditForm({
  sale,
  onClose,
}: OrderEditFormProps) {
  const { updateSale, cancelSale, deleteSale } = useSalesContext();
  const [customer, setCustomer] = useState(sale.customer);
  const [notes, setNotes] = useState(sale.notes);
  const [status, setStatus] = useState(sale.status);
  const [reason, setReason] = useState('');
  const [editableItems, setEditableItems] = useState<Sale['items']>(() =>
    sale.items.map((item) => ({ ...item })),
  );

  const currentTotal = useMemo(() => {
    return editableItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
  }, [editableItems]);

  function updateItemQuantity(productId: number, newQuantity: number) {
    if (newQuantity < 0) return;
    setEditableItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item,
      ),
    );
  }

  async function handleSave() {
    const finalItems = editableItems
      .filter((item) => item.quantity > 0)
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

    if (finalItems.length === 0) {
      alert(
        'La venta debe contener al menos un producto con cantidad mayor a cero.',
      );
      return;
    }

    await updateSale(sale.id, { customer, notes, status, items: finalItems });
    onClose();
  }

  async function handleCancel() {
    await cancelSale(sale.id, reason || 'Anulación desde el panel');
    onClose();
  }

  async function handleDelete() {
    await deleteSale(sale.id);
    onClose();
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-md border bg-muted/20 p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Cliente Inicial</p>
              <p className="font-medium">
                {sale.customer || 'Cliente general'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Método</p>
              <p className="font-medium">{sale.paymentMethod}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fecha</p>
              <p className="font-medium">
                {new Date(sale.createdAt).toLocaleString('es-CO', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Actualizado</p>
              <p className="font-semibold text-primary">
                {formatCurrency(sale.isVoided ? sale.total : currentTotal)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Productos y Cantidades</p>
            <div className="overflow-hidden rounded-md border bg-background">
              <div className="grid grid-cols-[2fr_1.2fr_0.8fr_0.8fr] border-b bg-muted/40 px-3 py-2 text-xs font-medium uppercase text-muted-foreground">
                <span>Producto</span>
                <span className="text-center">Cant.</span>
                <span className="text-right">P. unit.</span>
                <span className="text-right">Total</span>
              </div>

              {(sale.isVoided ? sale.items : editableItems).map((item) => (
                <div
                  key={item.productId}
                  className="grid grid-cols-[2fr_1.2fr_0.8fr_0.8fr] items-center border-b px-3 py-2 text-sm last:border-b-0"
                >
                  <span className="truncate pr-1">{item.productName}</span>

                  <div className="flex items-center justify-center gap-1">
                    {!sale.isVoided ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            updateItemQuantity(
                              item.productId,
                              item.quantity - 1,
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItemQuantity(
                              item.productId,
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="h-6 w-12 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            updateItemQuantity(
                              item.productId,
                              item.quantity + 1,
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <span className="text-center">{item.quantity}</span>
                    )}
                  </div>

                  <span className="text-right">
                    {formatCurrency(item.price)}
                  </span>
                  <span className="text-right font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Cliente</Label>
          <Input
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            disabled={sale.isVoided}
          />
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Sale['status'])}
            disabled={sale.isVoided}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="completed">Completada</option>
            <option value="pending">Pendiente</option>
            <option value="processing">En proceso</option>
            <option value="cancelled">Anulada</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Notas</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={sale.isVoided}
          />
        </div>
        {!sale.isVoided && (
          <div className="space-y-2">
            <Label>Motivo de anulación</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Opcional"
            />
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
        {sale.isVoided ? (
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            Eliminar
          </Button>
        ) : (
          <>
            <Button variant="destructive" onClick={handleCancel}>
              Anular venta
            </Button>
            <Button onClick={handleSave}>Guardar</Button>
          </>
        )}
      </DialogFooter>
    </>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}
