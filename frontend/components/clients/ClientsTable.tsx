'use client';

import { useState, useMemo } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Client,
  getBalance,
  getTotalPurchases,
  getDebtStatus,
  DebtStatus,
} from '@/types/client';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const debtStatusConfig: Record<
  DebtStatus,
  { label: string; className: string }
> = {
  ok: {
    label: 'Al día',
    className:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400',
  },
  partial: {
    label: 'Pago parcial',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400',
  },
  debt: {
    label: 'Con deuda',
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400',
  },
  none: {
    label: 'Sin créditos',
    className: 'bg-muted text-muted-foreground border-border',
  },
};

type DebtFilter = 'all' | 'debt' | 'ok' | 'none';

interface ClientsTableProps {
  clients: Client[];
  onSelect: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (id: number) => void;
}

export function ClientsTable({
  clients,
  onSelect,
  onEdit,
  onDelete,
}: ClientsTableProps) {
  const [search, setSearch] = useState('');
  const [debtFilter, setDebtFilter] = useState<DebtFilter>('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter((c) => {
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.phone ?? '').includes(q) ||
        (c.doc ?? '').includes(q) ||
        (c.email ?? '').toLowerCase().includes(q);
      const status = getDebtStatus(c);
      const matchD =
        debtFilter === 'all' ||
        (debtFilter === 'debt' &&
          (status === 'debt' || status === 'partial')) ||
        (debtFilter === 'ok' && status === 'ok') ||
        (debtFilter === 'none' && status === 'none');
      return matchQ && matchD;
    });
  }, [clients, search, debtFilter]);

  return (
    <div className="flex flex-col gap-3 flex-1">
      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-50 max-w-xs">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            🔍
          </span>
          <Input
            placeholder="Buscar por nombre, teléfono, doc..."
            className="pl-7 h-8 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select
          value={debtFilter}
          onValueChange={(v) => setDebtFilter(v as DebtFilter)}
        >
          <SelectTrigger className="h-8 w-40 text-sm">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="debt">Con deuda</SelectItem>
            <SelectItem value="ok">Al día</SelectItem>
            <SelectItem value="none">Sin créditos</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} cliente{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border overflow-hidden flex-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Cliente</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead className="text-right">Total compras</TableHead>
              <TableHead className="text-right">Saldo pendiente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-16 text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">👤</span>
                    <span className="text-sm">No se encontraron clientes</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => {
                const balance = getBalance(c);
                const total = getTotalPurchases(c);
                const status = getDebtStatus(c);
                const badge = debtStatusConfig[status];

                return (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => onSelect(c)}
                  >
                    {/* Nombre */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                          {initials(c.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{c.name}</p>
                          {c.email && (
                            <p className="text-xs text-muted-foreground">
                              {c.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {c.phone || '—'}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {c.doc || '—'}
                    </TableCell>

                    <TableCell className="text-right font-medium text-sm">
                      {total > 0 ? formatCurrency(total) : '—'}
                    </TableCell>

                    <TableCell className="text-right">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          balance > 0 && 'text-destructive',
                        )}
                      >
                        {balance > 0 ? formatCurrency(balance) : '—'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                          badge.className,
                        )}
                      >
                        {badge.label}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 opacity-0 [tr:hover_&]:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(c);
                          }}
                          aria-label={`Ver detalle de ${c.name}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(c);
                          }}
                          aria-label={`Editar ${c.name}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(c.id);
                          }}
                          aria-label={`Eliminar ${c.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
