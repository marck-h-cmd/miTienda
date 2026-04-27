import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordenService } from '@/services/orden.service';
import { ESTADOS_ORDEN, IOrden } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

interface DireccionForm {
  nombre: string;
  apellido: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  codigo_postal: string;
  telefono: string;
}

export default function OrdenEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: orden, isLoading: isLoadingOrden } = useQuery<IOrden | undefined>({
    queryKey: ['orden', id],
    queryFn: () => ordenService.obtener(id!),
    enabled: !!id,
  });

  const { data: opciones, isLoading: isLoadingOpciones } = useQuery({
    queryKey: ['orden-opciones'],
    queryFn: () => ordenService.obtenerOpcionesEnvio(),
    enabled: !!id,
  });

  const [estado, setEstado] = useState('');
  const [metodoEnvioId, setMetodoEnvioId] = useState('');
  const [direccion, setDireccion] = useState<DireccionForm>({
    nombre: '',
    apellido: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    codigo_postal: '',
    telefono: '',
  });

  useEffect(() => {
    if (!orden) return;
    setEstado(orden.estado);
    setMetodoEnvioId(orden.ord_metodos_envio?.id ?? '');
    setDireccion({
      nombre: orden.ord_direcciones_envio?.nombre ?? '',
      apellido: orden.ord_direcciones_envio?.apellido ?? '',
      direccion: orden.ord_direcciones_envio?.direccion ?? '',
      ciudad: orden.ord_direcciones_envio?.ciudad ?? '',
      departamento: orden.ord_direcciones_envio?.departamento ?? '',
      codigo_postal: orden.ord_direcciones_envio?.codigo_postal ?? '',
      telefono: orden.ord_direcciones_envio?.telefono ?? '',
    });
  }, [orden]);

  const actualizarOrdenMutation = useMutation({
    mutationFn: (payload: Record<string, any>) => ordenService.actualizar(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ordenes'] });
      queryClient.invalidateQueries({ queryKey: ['orden', id] });
      toast.success('Orden actualizada exitosamente');
      navigate('/admin/ordenes');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la orden');
    },
  });

  if (isLoadingOrden || isLoadingOpciones) {
    return <LoadingSpinner />;
  }

  if (!orden) {
    return <div className="p-6 text-center">Orden no encontrada</div>;
  }

  const opcionesEnvio = opciones?.metodos ?? [];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    actualizarOrdenMutation.mutate({
      estado,
      metodoEnvioId,
      direccionEnvio: {
        nombre: direccion.nombre,
        apellido: direccion.apellido,
        direccion: direccion.direccion,
        ciudad: direccion.ciudad,
        departamento: direccion.departamento,
        codigo_postal: direccion.codigo_postal || undefined,
        telefono: direccion.telefono,
      },
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Editar Orden</h1>
          <p className="text-sm text-gray-500">Orden #{orden.id.slice(0, 8).toUpperCase()} — {formatDate(orden.fecha_pedido)}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/ordenes">
            <Button variant="outline">Volver a órdenes</Button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label>Cliente</Label>
              <div className="rounded-md border border-input bg-muted p-3">
                <p className="font-medium">{orden.seg_usuarios?.nombre} {orden.seg_usuarios?.apellido}</p>
                <p className="text-sm text-gray-600">{orden.seg_usuarios?.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Total</Label>
              <div className="rounded-md border border-input bg-muted p-3 text-right font-semibold">
                {formatCurrency(Number(orden.total))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent>
            <h2 className="text-lg font-semibold mb-4">Información de envío y estado</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger id="estado" className="w-full">
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ESTADOS_ORDEN).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodoEnvio">Método de envío</Label>
                <Select value={metodoEnvioId} onValueChange={setMetodoEnvioId}>
                  <SelectTrigger id="metodoEnvio" className="w-full">
                    <SelectValue placeholder="Selecciona método de envío" />
                  </SelectTrigger>
                  <SelectContent>
                    {opcionesEnvio.map((metodo: any) => (
                      <SelectItem key={metodo.id} value={metodo.id}>
                        {metodo.nombre} ({metodo.precio ? `S/ ${metodo.precio}` : 'Gratis'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent>
            <h2 className="text-lg font-semibold mb-4">Dirección de envío</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={direccion.nombre}
                  onChange={(e) => setDireccion({ ...direccion, nombre: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  value={direccion.apellido}
                  onChange={(e) => setDireccion({ ...direccion, apellido: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={direccion.direccion}
                  onChange={(e) => setDireccion({ ...direccion, direccion: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={direccion.ciudad}
                  onChange={(e) => setDireccion({ ...direccion, ciudad: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="departamento">Departamento</Label>
                <Input
                  id="departamento"
                  value={direccion.departamento}
                  onChange={(e) => setDireccion({ ...direccion, departamento: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="codigo_postal">Código postal</Label>
                <Input
                  id="codigo_postal"
                  value={direccion.codigo_postal}
                  onChange={(e) => setDireccion({ ...direccion, codigo_postal: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={direccion.telefono}
                  onChange={(e) => setDireccion({ ...direccion, telefono: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/ordenes')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={actualizarOrdenMutation.isPending}>
            {actualizarOrdenMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
