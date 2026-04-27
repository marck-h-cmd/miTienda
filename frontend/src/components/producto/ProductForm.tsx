import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const productoSchema = z.object({
  sku: z.string().min(3, 'SKU debe tener al menos 3 caracteres'),
  nombre: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  descripcion_corta: z.string().optional(),
  descripcion_larga: z.string().optional(),
  categoria_id: z.string().min(1, 'Selecciona una categoría'),
  marca_id: z.string().optional(),
  precio_costo: z.coerce.number().positive('Debe ser positivo'),
  precio_venta: z.coerce.number().positive('Debe ser positivo'),
  precio_oferta: z.coerce.number().positive().optional(),
  stock_minimo: z.coerce.number().int().positive().default(5),
  estado: z.enum(['activo', 'inactivo', 'borrador']).default('activo'),
});

type ProductoFormData = z.infer<typeof productoSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductoFormData>;
  onSubmit: (data: ProductoFormData) => void;
  isLoading?: boolean;
  categorias?: Array<{ id: string; nombre: string }>;
  marcas?: Array<{ id: string; nombre: string }>;
}

export default function ProductForm({ 
  initialData, 
  onSubmit, 
  isLoading, 
  categorias = [], 
  marcas = [] 
}: ProductFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductoFormData>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      estado: 'activo',
      stock_minimo: 5,
      ...initialData,
    },
  });

  // Actualizar el formulario cuando cambian los initialData
  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (value !== undefined) {
          setValue(key as any, value);
        }
      });
    }
  }, [initialData, setValue]);

  const selectedCategoria = watch('categoria_id');
  const selectedMarca = watch('marca_id');
  const selectedEstado = watch('estado');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SKU */}
        <div>
          <Label htmlFor="sku">SKU *</Label>
          <Input id="sku" {...register('sku')} placeholder="PROD-001" />
          {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
        </div>

        {/* Nombre */}
        <div>
          <Label htmlFor="nombre">Nombre *</Label>
          <Input id="nombre" {...register('nombre')} placeholder="Nombre del producto" />
          {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
        </div>

        {/* Categoría */}
        <div>
          <Label htmlFor="categoria_id">Categoría *</Label>
          <Select 
            value={selectedCategoria} 
            onValueChange={(value) => setValue('categoria_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoria_id && <p className="text-red-500 text-xs mt-1">{errors.categoria_id.message}</p>}
        </div>

        {/* Marca */}
        <div>
          <Label htmlFor="marca_id">Marca</Label>
          <Select 
            value={selectedMarca} 
            onValueChange={(value) => setValue('marca_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar marca" />
            </SelectTrigger>
            <SelectContent>
              {marcas.map((marca) => (
                <SelectItem key={marca.id} value={marca.id}>{marca.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Precio Costo */}
        <div>
          <Label htmlFor="precio_costo">Precio Costo *</Label>
          <Input id="precio_costo" type="number" step="0.01" {...register('precio_costo')} />
          {errors.precio_costo && <p className="text-red-500 text-xs mt-1">{errors.precio_costo.message}</p>}
        </div>

        {/* Precio Venta */}
        <div>
          <Label htmlFor="precio_venta">Precio Venta *</Label>
          <Input id="precio_venta" type="number" step="0.01" {...register('precio_venta')} />
          {errors.precio_venta && <p className="text-red-500 text-xs mt-1">{errors.precio_venta.message}</p>}
        </div>

        {/* Precio Oferta */}
        <div>
          <Label htmlFor="precio_oferta">Precio Oferta</Label>
          <Input id="precio_oferta" type="number" step="0.01" {...register('precio_oferta')} />
        </div>

        {/* Stock Mínimo */}
        <div>
          <Label htmlFor="stock_minimo">Stock Mínimo</Label>
          <Input id="stock_minimo" type="number" {...register('stock_minimo')} />
          {errors.stock_minimo && <p className="text-red-500 text-xs mt-1">{errors.stock_minimo.message}</p>}
        </div>

        {/* Estado */}
        <div>
          <Label htmlFor="estado">Estado</Label>
          <Select 
            value={selectedEstado} 
            onValueChange={(value: 'activo' | 'inactivo' | 'borrador') => setValue('estado', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
              <SelectItem value="borrador">Borrador</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Descripción Corta */}
      <div>
        <Label htmlFor="descripcion_corta">Descripción Corta</Label>
        <Input id="descripcion_corta" {...register('descripcion_corta')} placeholder="Breve descripción" />
      </div>

      {/* Descripción Larga */}
      <div>
        <Label htmlFor="descripcion_larga">Descripción Larga</Label>
        <textarea
          id="descripcion_larga"
          {...register('descripcion_larga')}
          rows={4}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Descripción detallada del producto"
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : initialData?.nombre ? 'Actualizar Producto' : 'Crear Producto'}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}