'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { day: 'Lun', ventas: 3200 },
  { day: 'Mar', ventas: 4100 },
  { day: 'Mié', ventas: 3700 },
  { day: 'Jue', ventas: 5200 },
  { day: 'Vie', ventas: 4800 },
  { day: 'Sáb', ventas: 6100 },
  { day: 'Hoy', ventas: 4280 },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded-lg px-3 py-2 text-sm shadow-md">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-medium">${payload[0].value.toLocaleString()}</p>
    </div>
  );
};

export function SalesChart() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Ventas esta semana
          </CardTitle>
          <span className="text-xs text-primary cursor-pointer hover:underline">
            Ver mes →
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={data}
            barSize={28}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
            />
            <Bar
              dataKey="ventas"
              radius={[4, 4, 0, 0]}
              fill="hsl(var(--primary))"
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="flex gap-6 pt-3 border-t mt-2">
          <div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
            <p className="text-base font-semibold">$31,380</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Semana anterior</p>
            <p className="text-base font-semibold text-muted-foreground">
              $27,900
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Diferencia</p>
            <p className="text-base font-semibold text-green-600">+12.5%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
