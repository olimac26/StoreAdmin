'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Category, Product } from '@/types/product';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  barcode: z.string().optional(),
  category_id: z.number().min(1, 'Selecciona una categoría'),
  description: z.string().optional(),
  price: z.number().positive('Precio inválido'),
  cost: z.number().min(0).optional(),
  stock: z.number().min(0, 'Stock inválido'),
  minStock: z.number().min(0).default(5),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface ProductFormProps {
  defaultValues?: Partial<Product>;
  categories: Category[];
  onSave: (data: Omit<Product, 'id'>) => void;
  onCancel: () => void;
  submitLabel: string;
}

export function ProductForm({
  defaultValues,
  onSave,
  onCancel,
  submitLabel,
  categories,
}: ProductFormProps) {
  const form = useForm<FormInput, undefined, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      barcode: defaultValues?.barcode ?? '',
      category_id: defaultValues?.category_id ?? 0,
      description: defaultValues?.description ?? '',
      price: defaultValues?.price ?? 0,
      cost: defaultValues?.cost ?? 0,
      stock: defaultValues?.stock ?? 0,
      minStock: defaultValues?.minStock ?? 5,
    },
  });

  function handleSubmit(data: FormOutput) {
    onSave(data);
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Información general
        </p>

        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nombre *</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Ej: Zapatillas Air Pro"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="w-full">
          <Controller
            name="barcode"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Código de barras</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="7891234..."
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          name="category_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Categoría *</FieldLabel>
              <Select
                name={field.name}
                value={field.value ? String(field.value) : ''}
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
              >
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                placeholder="Descripción breve..."
                className="resize-none"
              />
            </Field>
          )}
        />

        <Separator />
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Precio y stock
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="price"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Precio (COP) *</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min={0}
                  step={100}
                  aria-invalid={fieldState.invalid}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="cost"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Precio costo</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min={0}
                  step={100}
                  placeholder="Opcional"
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="stock"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Stock actual *</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min={0}
                  aria-invalid={fieldState.invalid}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="minStock"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Stock mínimo</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min={0}
                  placeholder="5"
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
                <FieldDescription>Alerta de reposición</FieldDescription>
              </Field>
            )}
          />
        </div>

        <Field orientation="horizontal" className="pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1">
            {submitLabel}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
