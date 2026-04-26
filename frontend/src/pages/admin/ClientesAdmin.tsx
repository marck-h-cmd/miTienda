import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteService } from '@/services/cliente.service';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import { Search, UserX, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClientesAdmin() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-clientes', page, search],
    queryFn: () => clienteService.listar({ page: String(page), limit: '10', busqueda: search }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      clienteService.toggleActivo(id, activo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-clientes'] });
      toast.success('Estado del cliente actualizado');
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Clientes</h1>

      <Card>
        <CardHeader>
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Buscar clientes..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Teléfono</th>
                  <th className="text-center p-3">Estado</th>
                  <th className="text-left p-3">Registro</th>
                  <th className="text-right p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((cliente) => (
                  <tr key={cliente.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{cliente.nombre} {cliente.apellido}</td>
                    <td className="p-3 text-gray-600">{cliente.email}</td>
                    <td className="p-3">{cliente.telefono || '-'}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        cliente.seg_usuarios?.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {cliente.seg_usuarios?.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{formatDate(cliente.seg_usuarios?.created_at || '')}</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleMutation.mutate({
                          id: cliente.id,
                          activo: !cliente.seg_usuarios?.activo,
                        })}
                        title={cliente.seg_usuarios?.activo ? 'Desactivar' : 'Activar'}
                      >
                        {cliente.seg_usuarios?.activo ? (
                          <UserX size={16} className="text-red-500" />
                        ) : (
                          <UserCheck size={16} className="text-green-500" />
                        )}
                      </Button>
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