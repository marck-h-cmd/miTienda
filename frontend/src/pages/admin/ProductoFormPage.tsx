import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productoService } from '@/services/producto.service';
import { categoriaService } from '@/services/categoria.service';
import { marcaService } from '@/services/marca.service';
import ProductForm from '@/components/producto/ProductForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function ProductoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  // Cargar producto si estamos editando
  const { data: producto, isLoading: isLoadingProducto } = useQuery({
    queryKey: ['producto', id],
    queryFn: () => productoService.obtener(id!),
    enabled: isEditing,
  });

  // Cargar categorías para el select
  const { data: categorias, isLoading: isLoadingCategorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriaService.listar({ limit: '100' }),
  });

  // Cargar marcas para el select
  const { data: marcas, isLoading: isLoadingMarcas } = useQuery({
    queryKey: ['marcas'],
    queryFn: () => marcaService.listar({ limit: '100' }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => productoService.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-productos'] });
      toast.success('Producto creado exitosamente');
      navigate('/admin/productos');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear producto');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => productoService.actualizar(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-productos'] });
      toast.success('Producto actualizado exitosamente');
      navigate('/admin/productos');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar producto');
    },
  });

  if (isEditing && isLoadingProducto) return <LoadingSpinner />;
  if (isLoadingCategorias || isLoadingMarcas) return <LoadingSpinner />;

  // Transformar la respuesta del backend al formato esperado por el formulario
  const initialData = producto ? {
    sku: producto.sku,
    nombre: producto.nombre,
    descripcion_corta: producto.descripcion_corta,
    descripcion_larga: producto.descripcion_larga,
    categoria_id: producto.categoria_id,
    marca_id: producto.marca_id,
    precio_costo: Number(producto.precio_costo),
    precio_venta: Number(producto.precio_venta),
    precio_oferta: producto.precio_oferta ? Number(producto.precio_oferta) : undefined,
    stock_minimo: producto.stock_minimo,
    estado: producto.estado,
  } : undefined;

  const initialImageUrl = producto?.cat_imagenes_producto?.find((img) => img.es_principal)?.url || producto?.cat_imagenes_producto?.[0]?.url;

  // Extraer arrays de categorías y marcas
  const categoriasList = categorias?.data || categorias?.categorias || [];
  const marcasList = marcas?.data || marcas?.marcas || [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      </h1>

      <Card>
        <CardContent className="pt-6">
          <ProductForm
            initialData={initialData}
            initialImageUrl={initialImageUrl}
            onSubmit={(data) => isEditing ? updateMutation.mutate(data) : createMutation.mutate(data)}
            isLoading={createMutation.isPending || updateMutation.isPending}
            categorias={categoriasList}
            marcas={marcasList}
          />
        </CardContent>
      </Card>
    </div>
  );
}