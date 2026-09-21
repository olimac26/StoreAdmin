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
import { useSalesContext } from '@/contexts/sales-context';
import { Sale } from '@/types/sale';
import { statusMap } from '@/constants/orders-status';
import { OrderEditDialog } from './OrderEditDialog';

export function OrdersTable() {
  const { sales, loading } = useSalesContext();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const formattedSales = useMemo(() => {
    return sales.map((sale) => ({
      ...sale,
      time: new Date(sale.createdAt).toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    }));
  }, [sales]);

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
                        onClick={() => setSelectedSale(order)}
                        disabled={order.isVoided}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setSelectedSale(order)}
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

        <OrderEditDialog
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
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
