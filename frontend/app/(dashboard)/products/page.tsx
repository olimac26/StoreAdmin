'use client';

import { useState } from 'react';
import { ProductsTable } from '@/components/products/ProductsTable';
import { ProductDrawer } from '@/components/products/ProductDrawer';
import { DeleteDialog } from '@/components/products/DeleteDialog';
import { useProducts } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Product } from '@/types/product';

export default function ProductsPage() {
  const { products, create, update, remove } = useProducts();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | Product[] | null>(
    null,
  );

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }
  function openEdit(p: Product) {
    setEditing(p);
    setDrawerOpen(true);
  }

  function handleSave(data: Omit<Product, 'id'>) {
    if (editing) {
      update(editing.id, data);
    } else {
      create(data);
    }
    setDrawerOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;

    if (Array.isArray(deleteTarget)) {
      deleteTarget.forEach((p) => remove(p.id));
    } else {
      remove(deleteTarget.id);
    }
    setDeleteTarget(null);
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">Productos</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} productos registrados
          </p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Nuevo producto
        </Button>
      </div>

      <ProductsTable
        products={products}
        onEdit={openEdit}
        onDelete={(p) => setDeleteTarget(p)}
        onDeleteMany={(ps) => setDeleteTarget(ps)}
      />

      <ProductDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        product={editing}
        onSave={handleSave}
      />

      <DeleteDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
