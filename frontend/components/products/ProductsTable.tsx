'use client';

import { useState, useMemo } from 'react';
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Category, Product } from '@/types/product';

type SortKey = keyof Pick<Product, 'name' | 'category' | 'price' | 'stock'>;
type SortDir = 'asc' | 'desc';
type StockFilter = 'all' | 'ok' | 'low' | 'out';

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onDeleteMany: (products: Product[]) => void;
}

function getStockLevel(p: Product): 'ok' | 'low' | 'out' {
  if (p.stock === 0) return 'out';
  if (p.stock <= p.minStock) return 'low';
  return 'ok';
}

const stockBadgeVariant = {
  ok: {
    label: 'En stock',
    className:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400',
  },
  low: {
    label: 'Stock bajo',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400',
  },
  out: {
    label: 'Agotado',
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400',
  },
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);

function SortIcon({
  col,
  sortKey,
  sortDir,
}: {
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  if (sortKey !== col)
    return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />;
  return sortDir === 'asc' ? (
    <ArrowUp className="w-3 h-3 ml-1 text-primary" />
  ) : (
    <ArrowDown className="w-3 h-3 ml-1 text-primary" />
  );
}

export function ProductsTable({
  products,
  categories,
  onEdit,
  onDelete,
  onDeleteMany,
}: ProductsTableProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products
      .filter((p) => {
        const matchQ =
          !q ||
          p.name.toLowerCase().includes(q) ||
          (p.barcode ?? '').includes(q);
        const matchCat = category === 'all' || p.category === category;
        const matchSt =
          stockFilter === 'all' || getStockLevel(p) === stockFilter;
        return matchQ && matchCat && matchSt;
      })
      .sort((a, b) => {
        const av = a[sortKey],
          bv = b[sortKey];
        const cmp =
          typeof av === 'string'
            ? (av as string).localeCompare(bv as string)
            : (av as number) - (bv as number);
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [products, search, category, stockFilter, sortKey, sortDir]);

  const allSelected =
    filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const someSelected = filtered.some((p) => selected.has(p.id));
  const selectedProducts = products.filter((p) => selected.has(p.id));

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((p) => next.delete(p.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((p) => next.add(p.id));
        return next;
      });
    }
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function handleDeleteMany() {
    onDeleteMany(selectedProducts);
    clearSelection();
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  return (
    <div className="flex flex-col gap-3 flex-1">
      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-50 max-w-xs">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            🔍
          </span>
          <Input
            placeholder="Buscar por nombre o código de barras"
            className="pl-7 h-8 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-8 w-44 text-sm">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={stockFilter}
          onValueChange={(v) => setStockFilter(v as StockFilter)}
        >
          <SelectTrigger className="h-8 w-36 text-sm">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo el stock</SelectItem>
            <SelectItem value="ok">En stock</SelectItem>
            <SelectItem value="low">Stock bajo</SelectItem>
            <SelectItem value="out">Agotado</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Barra de selección masiva */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20">
          <span className="text-sm text-accent font-medium flex-1">
            {selected.size} producto{selected.size !== 1 ? 's' : ''}{' '}
            seleccionado{selected.size !== 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={clearSelection}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={handleDeleteMany}
          >
            <Trash2 className="w-3 h-3" />
            Eliminar
          </Button>
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-lg border overflow-hidden flex-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    allSelected ? true : someSelected ? 'indeterminate' : false
                  }
                  onCheckedChange={toggleAll}
                  aria-label="Seleccionar todos"
                />
              </TableHead>

              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Producto{' '}
                  <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                </div>
              </TableHead>

              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center">
                  Categoría{' '}
                  <SortIcon
                    col="category"
                    sortKey={sortKey}
                    sortDir={sortDir}
                  />
                </div>
              </TableHead>

              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center justify-end">
                  Precio{' '}
                  <SortIcon col="price" sortKey={sortKey} sortDir={sortDir} />
                </div>
              </TableHead>

              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort('stock')}
              >
                <div className="flex items-center justify-end">
                  Stock{' '}
                  <SortIcon col="stock" sortKey={sortKey} sortDir={sortDir} />
                </div>
              </TableHead>

              <TableHead>Estado</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-16 text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">📦</span>
                    <span className="text-sm">No se encontraron productos</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const level = getStockLevel(p);
                const badge = stockBadgeVariant[level];
                const isSelected = selected.has(p.id);

                return (
                  <TableRow
                    key={p.id}
                    className={cn(isSelected && 'bg-accent/5')}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOne(p.id)}
                        aria-label={`Seleccionar ${p.name}`}
                      />
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-sm">{p.name}</div>
                      {p.barcode && (
                        <div className="text-xs text-muted-foreground">
                          {p.barcode}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-xs font-normal">
                        {p.category}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right font-medium text-sm">
                      {formatCurrency(p.price)}
                    </TableCell>

                    <TableCell className="text-right">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          level === 'out' && 'text-destructive',
                          level === 'low' &&
                            'text-amber-600 dark:text-amber-400',
                        )}
                      >
                        {p.stock}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {' '}
                        / mín {p.minStock}
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
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity [tr:hover_&]:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => onEdit(p)}
                          aria-label={`Editar ${p.name}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete(p)}
                          aria-label={`Eliminar ${p.name}`}
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
