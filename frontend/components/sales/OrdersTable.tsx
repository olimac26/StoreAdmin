import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order, OrderStatus } from '@/types/sales';

const statusMap: Record<
  OrderStatus,
  { label: string; variant: 'success' | 'warning' | 'secondary' }
> = {
  completed: { label: 'Completada', variant: 'success' },
  pending: { label: 'Pdte. de pago', variant: 'warning' },
  processing: { label: 'En proceso', variant: 'secondary' },
};

export function OrdersTable() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Órdenes recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Orden</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const status = statusMap[order.status];
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-primary">
                    #{order.id}
                  </TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {order.time}
                  </TableCell>
                  <TableCell>
                    <Badge>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${order.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

const orders: Order[] = [
  {
    id: '0038',
    customer: 'Carlos Mendoza',
    time: 'hace 5 min',
    status: 'processing',
    total: 145,
  },
  {
    id: '0037',
    customer: 'María García',
    time: 'hace 18 min',
    status: 'completed',
    total: 230,
  },
  {
    id: '0036',
    customer: 'Juan Rodríguez',
    time: 'hace 42 min',
    status: 'completed',
    total: 89,
  },
  {
    id: '0035',
    customer: 'Ana Martínez',
    time: 'hace 1h',
    status: 'pending',
    total: 312,
  },
];
