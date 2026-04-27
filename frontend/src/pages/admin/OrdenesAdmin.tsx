import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordenService } from '@/services/orden.service';
import { reporteService } from '@/services/reporte.service';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { ESTADOS_ORDEN } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import { Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrdenesAdmin() {
  const [page, setPage] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ordenes', page, filtroEstado],
    queryFn: () => ordenService.listar({
      page: String(page),
      limit: '10',
      ...(filtroEstado && filtroEstado !== 'todos' && { estado: filtroEstado }),
    }),
  });

  const cambiarEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) =>
      ordenService.cambiarEstado(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ordenes'] });
      toast.success('Estado actualizado');
    },
  });

  if (isLoading) return <LoadingSpinner />;

  // Log para debug - ver qué datos llegan
  console.log('Datos de órdenes:', data?.data?.[0]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Órdenes</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <Select 
              value={filtroEstado} 
              onValueChange={setFiltroEstado}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {Object.entries(ESTADOS_ORDEN).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Orden</th>
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-right p-3">Total</th>
                  <th className="text-center p-3">Estado</th>
                  <th className="text-left p-3">Fecha</th>
                  <th className="text-right p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((orden) => (
                  <tr key={orden.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs">#{orden.id.slice(0, 8)}</td>
                    <td className="p-3">
                      {/* ✅ Usar seg_usuarios en lugar de cli_clientes */}
                      {orden.seg_usuarios?.nombre} {orden.seg_usuarios?.apellido}
                      {orden.seg_usuarios?.email && (
                        <div className="text-xs text-gray-500">
                          {orden.seg_usuarios.email}
                        </div>
                      )}
                      {!orden.seg_usuarios && (
                        <span className="text-gray-400">Usuario no encontrado</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-bold">
                      {formatCurrency(Number(orden.total))}
                    </td>
                    <td className="p-3 text-center">
                      <select
                        value={orden.estado}
                        onChange={(e) => cambiarEstadoMutation.mutate({ id: orden.id, estado: e.target.value })}
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(orden.estado)} border-0 focus:ring-2 focus:ring-primary-500`}
                      >
                        {Object.entries(ESTADOS_ORDEN).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-gray-500">
                      {formatDate(orden.fecha_pedido)}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => reporteService.facturaOrden(orden.id)}
                          title="Descargar factura"
                        >
                          <Download size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.total > 10 && (
            <Pagination
              currentPage={data.page}
              totalPages={Math.ceil(data.total / data.limit)}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}