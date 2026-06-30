import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Product } from '@/types/pos';

interface DeleteDialogProps {
  target: Product | Product[] | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteDialog({
  target,
  onClose,
  onConfirm,
}: DeleteDialogProps) {
  const isMany = Array.isArray(target);
  const name =
    !isMany && target
      ? `"${target.name}"`
      : `${(target as Product[])?.length} productos`;

  return (
    <AlertDialog open={!!target} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar {name}</AlertDialogTitle>
          <AlertDialogDescription>
            {isMany
              ? `Los ${name} seleccionados serán eliminados permanentemente.`
              : `El producto ${name} y su información de stock serán eliminados.`}{' '}
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
