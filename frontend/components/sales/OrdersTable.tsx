'use client';

import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSales } from '@/hooks/use-sales';
import { Sale } from '@/types/sale';
import { Plus, Minus } from 'lucide-react'; // Iconos limpios para los botones de cantidad

const statusMap = {
  completed: { label: 'Completada', variant: 'default' as const },
  pending: { label: 'Pdte. de pago', variant: 'secondary' as const },
  processing: { label: 'En proceso', variant: 'outline' as const },
  cancelled: { label: 'Anulada', variant: 'destructive' as const },
};

export function OrdersTable() {
  const { sales, loading, cancelSale, updateSale, deleteSale } = useSales();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [customer, setCustomer] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('completed');
  const [reason, setReason] = useState('');

  // Nuevo estado para rastrear los items que se están editando en el diálogo
  const [editableItems, setEditableItems] = useState<Sale['items']>([]);

  const formattedSales = useMemo(() => {
    return sales.map((sale) => ({
      ...sale,
      time: new Date(sale.createdAt).toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    }));
  }, [sales]);

  // Calcula dinámicamente el total de la orden basándose en las cantidades actuales en el diálogo
  const currentTotal = useMemo(() => {
    return editableItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
  }, [editableItems]);

  function openEdit(sale: Sale) {
    setSelectedSale(sale);
    setCustomer(sale.customer);
    setNotes(sale.notes);
    setStatus(sale.status);
    setReason('');
    // Clonamos los items originales en el estado editable
    setEditableItems(sale.items.map((item) => ({ ...item })));
  }

  // Manejador para alterar la cantidad mediante botones o inputs directos
  function updateItemQuantity(productId: number, newQuantity: number) {
    if (newQuantity < 0) return; // Evita cantidades negativas
    setEditableItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item,
      ),
    );
  }

  async function handleSave() {
    if (!selectedSale) return;

    // Filtramos productos con cantidad mayor a 0 para el payload
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

    await updateSale(selectedSale.id, {
      customer,
      notes,
      status,
      items: finalItems, // Se envía el arreglo estructurado esperado por updateSaleRequest de Go
    });

    setSelectedSale(null);
  }

  async function handleCancel() {
    if (!selectedSale) return;
    await cancelSale(selectedSale.id, reason || 'Anulación desde el panel');
    setSelectedSale(null);
    setReason('');
  }

  async function handleDelete() {
    if (!selectedSale) return;
    await deleteSale(selectedSale.id);
    setSelectedSale(null);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Historial de ventas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando ventas…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Orden</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formattedSales.map((order) => {
                const status =
                  statusMap[order.status as keyof typeof statusMap] ??
                  statusMap.completed;
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-primary">
                      #{order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {order.time}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(order)}
                        disabled={order.isVoided}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openEdit(order)}
                        disabled={order.isVoided}
                      >
                        Anular
                      </Button>
                      {order.isVoided && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSale(order)}
                          className="text-xs"
                        >
                          Eliminar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        <Dialog
          open={Boolean(selectedSale)}
          onOpenChange={() => setSelectedSale(null)}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {selectedSale?.isVoided ? 'Venta anulada' : 'Editar venta'}
              </DialogTitle>
              <DialogDescription>
                {selectedSale?.isVoided
                  ? 'Puedes ver el detalle o eliminar esta venta.'
                  : 'Puedes modificar los datos y cantidades de la venta sin eliminar el registro.'}
              </DialogDescription>
            </DialogHeader>

            {selectedSale && (
              <div className="space-y-4">
                <div className="rounded-md border bg-muted/20 p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Cliente Inicial</p>
                      <p className="font-medium">
                        {selectedSale.customer || 'Cliente general'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Método</p>
                      <p className="font-medium">
                        {selectedSale.paymentMethod}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fecha</p>
                      <p className="font-medium">
                        {new Date(selectedSale.createdAt).toLocaleString(
                          'es-CO',
                          { dateStyle: 'medium', timeStyle: 'short' },
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Actualizado</p>
                      <p className="font-semibold text-primary">
                        {formatCurrency(
                          selectedSale.isVoided
                            ? selectedSale.total
                            : currentTotal,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Productos y Cantidades
                    </p>
                    <div className="overflow-hidden rounded-md border bg-background">
                      <div className="grid grid-cols-[2fr_1.2fr_0.8fr_0.8fr] border-b bg-muted/40 px-3 py-2 text-xs font-medium uppercase text-muted-foreground">
                        <span>Producto</span>
                        <span className="text-center">Cant.</span>
                        <span className="text-right">P. unit.</span>
                        <span className="text-right">Total</span>
                      </div>

                      {/* Usamos editableItems si se está editando una venta activa, si no, los items estáticos */}
                      {(selectedSale.isVoided
                        ? selectedSale.items
                        : editableItems
                      ).map((item) => (
                        <div
                          key={item.productId}
                          className="grid grid-cols-[2fr_1.2fr_0.8fr_0.8fr] items-center border-b px-3 py-2 text-sm last:border-b-0"
                        >
                          <span className="truncate pr-1">
                            {item.productName}
                          </span>

                          {/* Controles interactivos de cantidad */}
                          <div className="flex items-center justify-center gap-1">
                            {!selectedSale.isVoided ? (
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
                              <span className="text-center">
                                {item.quantity}
                              </span>
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
                    disabled={selectedSale.isVoided}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={selectedSale.isVoided}
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
                    disabled={selectedSale.isVoided}
                  />
                </div>
                {!selectedSale.isVoided && (
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
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedSale(null)}>
                Cerrar
              </Button>
              {selectedSale?.isVoided ? (
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
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}
