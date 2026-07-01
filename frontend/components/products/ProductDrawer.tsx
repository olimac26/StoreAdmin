import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ProductForm } from './ProductForm';
import { Category, Product } from '@/types/product';

interface ProductDrawerProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  onSave: (data: Omit<Product, 'id'>) => void;
}

export function ProductDrawer({
  open,
  onClose,
  product,
  categories,
  onSave,
}: ProductDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-95 sm:w-105 flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {product ? 'Editar producto' : 'Nuevo producto'}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <ProductForm
            categories={categories}
            defaultValues={product ?? undefined}
            onSave={onSave}
            onCancel={onClose}
            submitLabel={product ? 'Guardar cambios' : 'Crear producto'}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
