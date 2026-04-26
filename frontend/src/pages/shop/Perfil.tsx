import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteService } from '@/services/cliente.service';
import { useAuthStore } from '@/stores/authStore';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Heart, Edit2, Check, X } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function Perfil() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showDireccionForm, setShowDireccionForm] = useState(false);
  const [editingDireccionId, setEditingDireccionId] = useState<string | null>(null);

  // Formulario de perfil
  const { register: registerPerfil, handleSubmit: handleSubmitPerfil, reset: resetPerfil, watch: watchPerfil } = useForm({
    defaultValues: {
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      telefono: '',
    },
  });

  // Formulario de dirección
  const { 
    register: registerDireccion, 
    handleSubmit: handleSubmitDireccion, 
    reset: resetDireccion,
    watch: watchDireccion,
    setValue: setValueDireccion
  } = useForm({
    defaultValues: {
      nombre: '',
      apellido: '',
      direccion: '',
      ciudad: '',
      departamento: '',
      codigo_postal: '',
      telefono: '',
      es_principal: false,
    },
  });

  // Queries
  const { data: perfil, isLoading } = useQuery({
    queryKey: ['perfil'],
    queryFn: () => clienteService.obtenerPerfil(),
  });

  const { data: direcciones = [] } = useQuery({
    queryKey: ['direcciones'],
    queryFn: () => clienteService.obtenerDirecciones(),
  });

  // Mutations
  const updatePerfilMutation = useMutation({
    mutationFn: (data: any) => clienteService.actualizarPerfil(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil'] });
      toast.success('Perfil actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar perfil');
    },
  });

  const crearDireccionMutation = useMutation({
    mutationFn: (data: any) => clienteService.crearDireccion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direcciones'] });
      toast.success('Dirección creada');
      resetDireccion();
      setShowDireccionForm(false);
    },
    onError: () => {
      toast.error('Error al crear dirección');
    },
  });

  const actualizarDireccionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      clienteService.actualizarDireccion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direcciones'] });
      toast.success('Dirección actualizada');
      setEditingDireccionId(null);
      resetDireccion();
    },
    onError: () => {
      toast.error('Error al actualizar dirección');
    },
  });

  const eliminarDireccionMutation = useMutation({
    mutationFn: (id: string) => clienteService.eliminarDireccion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direcciones'] });
      toast.success('Dirección eliminada');
    },
    onError: () => {
      toast.error('Error al eliminar dirección');
    },
  });

  const handleEditarDireccion = (direccion: any) => {
    setEditingDireccionId(direccion.id);
    setValueDireccion('nombre', direccion.nombre);
    setValueDireccion('apellido', direccion.apellido);
    setValueDireccion('direccion', direccion.direccion);
    setValueDireccion('ciudad', direccion.ciudad);
    setValueDireccion('departamento', direccion.departamento);
    setValueDireccion('codigo_postal', direccion.codigo_postal);
    setValueDireccion('telefono', direccion.telefono);
    setValueDireccion('es_principal', direccion.es_principal);
    setShowDireccionForm(true);
  };

  const handleCancelarEdicion = () => {
    setEditingDireccionId(null);
    resetDireccion();
    setShowDireccionForm(false);
  };

  const onSubmitDireccion = async (data: any) => {
    if (editingDireccionId) {
      actualizarDireccionMutation.mutate({ id: editingDireccionId, data });
    } else {
      crearDireccionMutation.mutate(data);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info personal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Formulario de Perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmitPerfil((data) => updatePerfilMutation.mutate(data))}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input
                      {...registerPerfil('nombre')}
                      defaultValue={perfil?.nombre || user?.nombre || ''}
                    />
                  </div>
                  <div>
                    <Label>Apellido</Label>
                    <Input
                      {...registerPerfil('apellido')}
                      defaultValue={perfil?.apellido || user?.apellido || ''}
                    />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={perfil?.email || user?.email || ''} disabled />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    {...registerPerfil('telefono')}
                    placeholder="+51 999 999 999"
                    defaultValue={perfil?.telefono || ''}
                  />
                </div>
                <Button type="submit" disabled={updatePerfilMutation.isPending}>
                  {updatePerfilMutation.isPending ? 'Guardando...' : 'Actualizar Perfil'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Formulario de Dirección */}
          {showDireccionForm && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle>
                  {editingDireccionId ? 'Editar Dirección' : 'Nueva Dirección'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitDireccion(onSubmitDireccion)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre</Label>
                      <Input {...registerDireccion('nombre')} required />
                    </div>
                    <div>
                      <Label>Apellido</Label>
                      <Input {...registerDireccion('apellido')} required />
                    </div>
                  </div>

                  <div>
                    <Label>Dirección Completa</Label>
                    <Input
                      {...registerDireccion('direccion')}
                      placeholder="Av. Principal 123, Apto 401"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Ciudad</Label>
                      <Input {...registerDireccion('ciudad')} required />
                    </div>
                    <div>
                      <Label>Departamento</Label>
                      <Input {...registerDireccion('departamento')} required />
                    </div>
                    <div>
                      <Label>Código Postal</Label>
                      <Input {...registerDireccion('codigo_postal')} />
                    </div>
                  </div>

                  <div>
                    <Label>Teléfono</Label>
                    <Input {...registerDireccion('telefono')} required />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="es_principal"
                      {...registerDireccion('es_principal')}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="es_principal" className="cursor-pointer">
                      Marcar como dirección principal
                    </Label>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelarEdicion}
                      disabled={crearDireccionMutation.isPending || actualizarDireccionMutation.isPending}
                    >
                      <X size={16} className="mr-1" /> Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={crearDireccionMutation.isPending || actualizarDireccionMutation.isPending}
                    >
                      {crearDireccionMutation.isPending || actualizarDireccionMutation.isPending
                        ? 'Guardando...'
                        : editingDireccionId
                        ? 'Actualizar'
                        : 'Crear'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de Direcciones */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Direcciones de Envío</CardTitle>
              {!showDireccionForm && (
                <Button size="sm" onClick={() => setShowDireccionForm(true)}>
                  <Plus size={16} className="mr-1" /> Nueva
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {direcciones.length > 0 ? (
                <div className="space-y-3">
                  {direcciones.map((direccion: any) => (
                    <div key={direccion.id} className="border rounded-lg p-4">
                      {editingDireccionId === direccion.id ? (
                        <div className="text-sm text-gray-600">Editando...</div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">
                                {direccion.nombre} {direccion.apellido}
                              </p>
                              <p className="text-sm text-gray-600">{direccion.direccion}</p>
                              <p className="text-sm text-gray-600">
                                {direccion.ciudad}, {direccion.departamento} {direccion.codigo_postal}
                              </p>
                              <p className="text-sm text-gray-600">Tel: {direccion.telefono}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditarDireccion(direccion)}
                                className="text-blue-500 hover:bg-blue-50 p-2 rounded transition"
                                title="Editar"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => eliminarDireccionMutation.mutate(direccion.id)}
                                disabled={eliminarDireccionMutation.isPending}
                                className="text-red-500 hover:bg-red-50 p-2 rounded transition disabled:opacity-50"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          {direccion.es_principal && (
                            <div className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                              ✓ Principal
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No hay direcciones registradas.
                  {!showDireccionForm && (
                    <>
                      <br />
                      <button
                        onClick={() => setShowDireccionForm(true)}
                        className="text-blue-500 hover:underline mt-2"
                      >
                        Crear tu primera dirección
                      </button>
                    </>
                  )}
                </p>
              )}
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