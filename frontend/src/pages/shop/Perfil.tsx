import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteService } from '@/services/cliente.service';
import { useAuthStore } from '@/stores/authStore';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Heart, Edit2, X, MapPin, User, Mail, Phone } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';
import { useFavoritosStore } from '@/stores/favoritosStore';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

interface PerfilFormData {
  nombre: string;
  apellido: string;
  telefono: string;
}

interface DireccionFormData {
  nombre: string;
  apellido: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  codigo_postal: string;
  telefono: string;
  es_principal: boolean;
}

export default function Perfil() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { items: favItems } = useFavoritosStore();
  const [showDireccionForm, setShowDireccionForm] = useState(false);
  const [editingDireccionId, setEditingDireccionId] = useState<string | null>(null);

  // ── Queries ────────────────────────────────────────────────
  const { data: perfil, isLoading: loadingPerfil } = useQuery({
    queryKey: ['perfil'],
    queryFn: clienteService.obtenerPerfil,
  });

  const { data: direcciones = [], isLoading: loadingDirecciones } = useQuery({
    queryKey: ['direcciones'],
    queryFn: clienteService.obtenerDirecciones,
  });

  // ── Formulario Perfil ──────────────────────────────────────
  const {
    register: rPerfil,
    handleSubmit: hPerfil,
    reset: resetPerfil,
  } = useForm<PerfilFormData>({
    defaultValues: { nombre: '', apellido: '', telefono: '' },
  });

  // Poblar el formulario cuando llegue el perfil del servidor
  useEffect(() => {
    if (perfil) {
      resetPerfil({
        nombre: perfil.nombre ?? '',
        apellido: perfil.apellido ?? '',
        telefono: perfil.telefono ?? '',
      });
    }
  }, [perfil, resetPerfil]);

  const updatePerfilMutation = useMutation({
    mutationFn: (data: PerfilFormData) => clienteService.actualizarPerfil(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil'] });
      toast.success('Perfil actualizado correctamente');
    },
    onError: () => toast.error('Error al actualizar el perfil'),
  });

  // ── Formulario Dirección ───────────────────────────────────
  const {
    register: rDir,
    handleSubmit: hDir,
    reset: resetDir,
    setValue: setDir,
  } = useForm<DireccionFormData>({
    defaultValues: {
      nombre: '', apellido: '', direccion: '',
      ciudad: '', departamento: '', codigo_postal: '',
      telefono: '', es_principal: false,
    },
  });

  const crearDireccionMutation = useMutation({
    mutationFn: (data: DireccionFormData) => clienteService.crearDireccion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direcciones'] });
      toast.success('Dirección creada');
      cerrarFormDir();
    },
    onError: () => toast.error('Error al crear la dirección'),
  });

  const actualizarDireccionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DireccionFormData }) =>
      clienteService.actualizarDireccion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direcciones'] });
      toast.success('Dirección actualizada');
      cerrarFormDir();
    },
    onError: () => toast.error('Error al actualizar la dirección'),
  });

  const eliminarDireccionMutation = useMutation({
    mutationFn: (id: string) => clienteService.eliminarDireccion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direcciones'] });
      toast.success('Dirección eliminada');
    },
    onError: () => toast.error('Error al eliminar la dirección'),
  });

  const cerrarFormDir = () => {
    setEditingDireccionId(null);
    setShowDireccionForm(false);
    resetDir();
  };

  const handleEditarDireccion = (d: any) => {
    setEditingDireccionId(d.id);
    setDir('nombre', d.nombre);
    setDir('apellido', d.apellido);
    setDir('direccion', d.direccion);
    setDir('ciudad', d.ciudad);
    setDir('departamento', d.departamento);
    setDir('codigo_postal', d.codigo_postal ?? '');
    setDir('telefono', d.telefono);
    setDir('es_principal', d.es_principal);
    setShowDireccionForm(true);
    // Scroll suave al formulario
    setTimeout(() => document.getElementById('dir-form')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const onSubmitDir = (data: DireccionFormData) => {
    if (editingDireccionId) {
      actualizarDireccionMutation.mutate({ id: editingDireccionId, data });
    } else {
      crearDireccionMutation.mutate(data);
    }
  };

  const isDirPending = crearDireccionMutation.isPending || actualizarDireccionMutation.isPending;

  if (loadingPerfil) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Columna principal ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={18} /> Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={hPerfil((data) => updatePerfilMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" {...rPerfil('nombre', { required: true })} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input id="apellido" {...rPerfil('apellido', { required: true })} />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="flex items-center gap-1">
                    <Mail size={14} /> Email
                  </Label>
                  <Input value={perfil?.email ?? user?.email ?? ''} disabled className="bg-gray-50 text-gray-500" />
                  <p className="text-xs text-gray-400">El email no se puede modificar</p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="telefono" className="flex items-center gap-1">
                    <Phone size={14} /> Teléfono
                  </Label>
                  <Input id="telefono" {...rPerfil('telefono')} placeholder="+51 999 999 999" />
                </div>

                <Button type="submit" disabled={updatePerfilMutation.isPending}>
                  {updatePerfilMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Formulario Nueva / Editar Dirección */}
          {showDireccionForm && (
            <Card id="dir-form" className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin size={18} />
                  {editingDireccionId ? 'Editar Dirección' : 'Nueva Dirección'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={hDir(onSubmitDir)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Nombre</Label>
                      <Input {...rDir('nombre', { required: true })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Apellido</Label>
                      <Input {...rDir('apellido', { required: true })} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Dirección Completa</Label>
                    <Input {...rDir('direccion', { required: true })} placeholder="Av. Principal 123, Apto 401" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label>Ciudad</Label>
                      <Input {...rDir('ciudad', { required: true })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Departamento</Label>
                      <Input {...rDir('departamento', { required: true })} />
                    </div>
                    <div className="space-y-1">
                      <Label>Código Postal</Label>
                      <Input {...rDir('codigo_postal')} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Teléfono</Label>
                    <Input {...rDir('telefono', { required: true })} />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" {...rDir('es_principal')} className="w-4 h-4 accent-primary-600" />
                    <span className="text-sm">Marcar como dirección principal</span>
                  </label>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="outline" onClick={cerrarFormDir} disabled={isDirPending}>
                      <X size={16} className="mr-1" /> Cancelar
                    </Button>
                    <Button type="submit" disabled={isDirPending}>
                      {isDirPending ? 'Guardando...' : editingDireccionId ? 'Actualizar' : 'Crear Dirección'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de Direcciones */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin size={18} /> Direcciones de Envío
              </CardTitle>
              {!showDireccionForm && (
                <Button size="sm" onClick={() => { resetDir(); setShowDireccionForm(true); }}>
                  <Plus size={16} className="mr-1" /> Nueva
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loadingDirecciones ? (
                <LoadingSpinner />
              ) : direcciones.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MapPin size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No tienes direcciones guardadas.</p>
                  {!showDireccionForm && (
                    <button onClick={() => setShowDireccionForm(true)} className="text-primary-600 hover:underline text-sm mt-2">
                      Agregar una dirección
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {direcciones.map((d: any) => (
                    <div
                      key={d.id}
                      className={`border rounded-lg p-4 transition ${editingDireccionId === d.id ? 'border-blue-300 bg-blue-50/30' : 'hover:border-gray-300'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <p className="font-semibold">{d.nombre} {d.apellido}</p>
                          <p className="text-sm text-gray-600">{d.direccion}</p>
                          <p className="text-sm text-gray-600">
                            {d.ciudad}, {d.departamento}{d.codigo_postal ? ` ${d.codigo_postal}` : ''}
                          </p>
                          <p className="text-sm text-gray-500">Tel: {d.telefono}</p>
                        </div>
                        <div className="flex gap-1 ml-2 flex-shrink-0">
                          <button
                            onClick={() => handleEditarDireccion(d)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded transition"
                            title="Editar"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => eliminarDireccionMutation.mutate(d.id)}
                            disabled={eliminarDireccionMutation.isPending}
                            className="p-2 text-red-400 hover:bg-red-50 rounded transition disabled:opacity-50"
                            title="Eliminar"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      {d.es_principal && (
                        <span className="inline-block mt-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                          ✓ Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          {/* Avatar */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary-600">
                    {(perfil?.nombre ?? user?.nombre ?? '?')[0]}
                    {(perfil?.apellido ?? user?.apellido ?? '')[0]}
                  </span>
                </div>
                <h3 className="font-bold text-lg leading-tight">
                  {perfil?.nombre ?? user?.nombre} {perfil?.apellido ?? user?.apellido}
                </h3>
                <p className="text-sm text-gray-500">{perfil?.email ?? user?.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Favoritos */}
          <Card className="hover:shadow-md transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart size={18} className="text-red-500" /> Lista de Deseos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favItems.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-2">
                  No tienes productos guardados aún.
                </p>
              ) : (
                <p className="text-sm text-gray-600 text-center py-1">
                  Tienes <span className="font-semibold text-red-500">{favItems.length}</span> producto{favItems.length !== 1 ? 's' : ''} guardado{favItems.length !== 1 ? 's' : ''}.
                </p>
              )}
              <Link
                to="/favoritos"
                className="mt-3 w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 py-2 rounded-lg text-sm hover:bg-red-50 transition"
              >
                <Heart size={15} />
                {favItems.length === 0 ? 'Explorar productos' : 'Ver mis favoritos'}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}