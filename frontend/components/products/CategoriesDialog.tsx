'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Category } from '@/types/product';

interface CategoriesDialogProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onCreate: (name: string, description?: string) => void;
  onUpdate: (id: number, name: string, description?: string) => void;
  onDelete: (id: number) => void;
}

export function CategoriesDialog({
  open,
  onClose,
  categories,
  onCreate,
  onUpdate,
  onDelete,
}: CategoriesDialogProps) {
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [editError, setEditError] = useState('');

  function handleCreate() {
    const name = newName.trim();
    if (!name) {
      setError('El nombre es requerido');
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setError('Ya existe una categoría con ese nombre');
      return;
    }
    onCreate(name, newDesc.trim() || undefined);
    setNewName('');
    setNewDesc('');
    setError('');
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description ?? '');
    setDeleteConfirm(null);
    setEditError('');
  }

  function saveEdit() {
    const name = editName.trim();
    if (editingId === null) return;

    if (!name) {
      setEditError('El nombre de la categoría no puede estar vacío');
      return;
    }

    if (
      categories.some(
        (c) =>
          c.id !== editingId && c.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      setEditError('Ya existe otra categoría con ese nombre');
      return;
    }

    onUpdate(editingId, name, editDesc.trim() || undefined);
    setEditingId(null);
    setEditError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError('');
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gestionar categorías</DialogTitle>
          <DialogDescription>
            Crea, edita o elimina las categorías de tus productos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 pb-3 border-b">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Nueva categoría
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Nombre de la categoría"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="h-8 text-sm"
            />
            <Button
              size="sm"
              className="h-8 gap-1.5 shrink-0"
              onClick={handleCreate}
            >
              <Plus className="w-3.5 h-3.5" /> Agregar
            </Button>
          </div>
          <Input
            placeholder="Descripción (opcional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="h-8 text-sm"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        {/* Lista de categorías */}
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No hay categorías aún
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id}>
                {editingId === cat.id ? (
                  <div className="flex flex-col gap-1.5 p-2 rounded-lg border bg-muted/30">
                    <Input
                      value={editName}
                      onChange={(e) => {
                        setEditName(e.target.value);
                        setEditError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      className="h-7 text-sm"
                      autoFocus
                    />
                    <Input
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Descripción (opcional)"
                      className="h-7 text-sm"
                    />
                    {editError && (
                      <p className="text-xs text-destructive px-1">
                        {editError}
                      </p>
                    )}
                    <div className="flex gap-1.5 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={cancelEdit}
                      >
                        <X className="w-3 h-3 mr-1" /> Cancelar
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={saveEdit}
                      >
                        <Check className="w-3 h-3 mr-1" /> Guardar
                      </Button>
                    </div>
                  </div>
                ) : deleteConfirm === cat.id ? (
                  /* Confirmación de eliminación inline */
                  <div className="flex items-center gap-2 px-2 py-2 rounded-lg border border-destructive/30 bg-destructive/5">
                    <p className="text-xs text-destructive flex-1">
                      ¿Eliminar <span className="font-medium">{cat.name}</span>?
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        onDelete(cat.id);
                        setDeleteConfirm(null);
                      }}
                    >
                      Eliminar
                    </Button>
                  </div>
                ) : (
                  /* Fila normal */
                  <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted/50 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => startEdit(cat)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteConfirm(cat.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            {categories.length} categoría{categories.length !== 1 ? 's' : ''}
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
