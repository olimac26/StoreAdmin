'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldLabel,
  FieldGroup,
  FieldDescription,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Client, ClientMutationPayload } from '@/types/client';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  phone: z.string().optional(),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  doc: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ClientFormDialogProps {
  open: boolean;
  onClose: () => void;
  defaultValues?: Partial<Client>;
  onSave: (data: ClientMutationPayload) => void;
}

export function ClientFormDialog({
  open,
  onClose,
  defaultValues,
  onSave,
}: ClientFormDialogProps) {
  const isEditing = !!defaultValues?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      phone: defaultValues?.phone ?? '',
      email: defaultValues?.email ?? '',
      doc: defaultValues?.doc ?? '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: defaultValues?.name ?? '',
        phone: defaultValues?.phone ?? '',
        email: defaultValues?.email ?? '',
        doc: defaultValues?.doc ?? '',
      });
    } else {
      form.reset({ name: '', phone: '', email: '', doc: '' });
    }
  }, [defaultValues, open, form]);

  function handleSave(data: FormValues) {
    onSave({
      name: data.name,
      phone: data.phone || undefined,
      email: data.email || undefined,
      doc: data.doc || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar cliente' : 'Nuevo cliente'}
          </DialogTitle>
          <DialogDescription>Solo el nombre es obligatorio.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSave)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Nombre completo *
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Ej: Carlos Mendoza"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="phone"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Teléfono{' '}
                    <span className="text-muted-foreground font-normal">
                      (opcional)
                    </span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="tel"
                    placeholder="Ej: 300 123 4567"
                  />
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Correo{' '}
                    <span className="text-muted-foreground font-normal">
                      (opcional)
                    </span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    placeholder="Ej: carlos@email.com"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="doc"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Cédula / NIT{' '}
                    <span className="text-muted-foreground font-normal">
                      (opcional)
                    </span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Ej: 1234567890"
                  />
                  <FieldDescription>
                    Se usa para identificar al cliente en ventas a crédito.
                  </FieldDescription>
                </Field>
              )}
            />

            <Field orientation="horizontal" className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {isEditing ? 'Guardar cambios' : 'Crear cliente'}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
