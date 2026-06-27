import { MetricCard } from '@/components/sales/MetricCards';
import { OrdersTable } from '@/components/sales/OrdersTable';
import { SalesChart } from '@/components/sales/SalesChart';
import { TopProducts } from '@/components/sales/TopProducts';

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Resumen del día</h1>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Ventas hoy"
          value="$4,280"
          change="+12% vs ayer"
          trend="up"
        />
        <MetricCard label="Órdenes" value="38" change="+5 nuevas" trend="up" />
        <MetricCard
          label="Ticket promedio"
          value="$112"
          change="-3% vs ayer"
          trend="down"
        />
        <MetricCard label="Clientes" value="29" change="+8 nuevos" trend="up" />
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3">
          <SalesChart />
        </div>
        <div className="col-span-2">
          <TopProducts />
        </div>
      </div>

      <OrdersTable />
    </div>
  );
}
