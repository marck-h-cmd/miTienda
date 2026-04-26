import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteService } from '@/services/cliente.service';
import { useAuthStore } from '@/stores/authStore';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Heart } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

export default function Perfil() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showDireccionForm, setShowDireccionForm] = useState(false);

  const { data: perfil, isLoading } = useQuery({
    queryKey: ['perfil'],
    queryFn: () => clienteService.obtenerPerfil(),
  });

  const { register, handleSubmit } = useForm({
    defaultValues: {
      nombre: perfil?.nombre || user?.nombre || '',
      apellido: perfil?.apellido || user?.apellido || '',
      telefono: perfil?.telefono || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => clienteService.actualizarPerfil(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil'] });
      toast.success('Perfil actualizado');
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info personal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Información Personal</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input {...register('nombre')} />
                  </div>
                  <div>
                    <Label>Apellido</Label>
                    <Input {...register('apellido')} />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={perfil?.email || user?.email || ''} disabled />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input {...register('telefono')} placeholder="+51 999 999 999" />
                </div>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Guardando...' : 'Actualizar Perfil'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Direcciones */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Direcciones</CardTitle>
              <Button size="sm" onClick={() => setShowDireccionForm(!showDireccionForm)}>
                <Plus size={16} className="mr-1" /> Nueva
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">Av. Principal 123, Lima</p>
                    <p className="text-sm text-gray-500">Lima, Lima</p>
                  </div>
                  <button className="text-red-500 hover:bg-red-50 p-1 rounded">
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 text-center py-4">
                  Gestiona tus direcciones de envío
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-primary-600">
                    {user?.nombre?.[0]}{user?.apellido?.[0]}
                  </span>
                </div>
                <h3 className="font-bold text-lg">{user?.nombre} {user?.apellido}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart size={18} /> Lista de Deseos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 text-center py-4">
                Guarda tus productos favoritos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}