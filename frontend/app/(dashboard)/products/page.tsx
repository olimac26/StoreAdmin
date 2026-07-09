'use client';

import { useState } from 'react';
import { ProductsTable } from '@/components/products/ProductsTable';
import { ProductDrawer } from '@/components/products/ProductDrawer';
import { DeleteDialog } from '@/components/ui/DeleteDialog';
import { CategoriesDialog } from '@/components/products/CategoriesDialog';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { Button } from '@/components/ui/button';
import { Plus, Tags } from 'lucide-react';
import { Product } from '@/types/product';

export default function ProductsPage() {
  const { products, create, update, remove } = useProducts();
  const {
    categories,
    create: createCat,
    update: updateCat,
    remove: removeCat,
  } = useCategories();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
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

  const isMany = Array.isArray(deleteTarget);
  const productName =
    !isMany && deleteTarget
      ? `"${deleteTarget.name}"`
      : `${(deleteTarget as Product[])?.length} productos`;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">Productos</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} productos registrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setCategoriesOpen(true)}
          >
            <Tags className="w-4 h-4" />
            Categorías
          </Button>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="w-4 h-4" /> Nuevo producto
          </Button>
        </div>
      </div>

      <ProductsTable
        products={products}
        categories={categories}
        onEdit={openEdit}
        onDelete={(p) => setDeleteTarget(p)}
        onDeleteMany={(ps) => setDeleteTarget(ps)}
      />

      <ProductDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        product={editing}
        categories={categories}
        onSave={handleSave}
      />

      <DeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Eliminar ${productName}`}
        description={
          isMany
            ? `Los ${productName} seleccionados serán eliminados permanentemente.`
            : `El producto ${productName} y su información de stock serán eliminados. Esta acción no se puede deshacer.`
        }
      />

      <CategoriesDialog
        open={categoriesOpen}
        onClose={() => setCategoriesOpen(false)}
        categories={categories}
        onCreate={createCat}
        onUpdate={updateCat}
        onDelete={removeCat}
      />
    </div>
  );
}
