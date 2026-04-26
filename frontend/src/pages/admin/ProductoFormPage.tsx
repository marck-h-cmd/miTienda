import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productoService } from '@/services/producto.service';
import ProductForm from '@/components/producto/ProductForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function ProductoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const { data: producto, isLoading } = useQuery({
    queryKey: ['producto', id],
    queryFn: () => productoService.obtener(id!),
    enabled: isEditing,
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

  if (isEditing && isLoading) return <LoadingSpinner />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      </h1>

      <Card>
        <CardContent className="pt-6">
          <ProductForm
            initialData={producto}
            onSubmit={(data) => isEditing ? updateMutation.mutate(data) : createMutation.mutate(data)}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}