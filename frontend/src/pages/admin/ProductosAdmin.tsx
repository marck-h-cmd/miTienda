import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { productoService } from '@/services/producto.service';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductosAdmin() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-productos', page, search],
    queryFn: () => productoService.listar({ page: String(page), limit: '10', busqueda: search }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productoService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-productos'] });
      toast.success('Producto eliminado');
      setDeleteId(null);
    },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Link to="/admin/productos/nuevo">
          <Button>
            <Plus size={18} className="mr-2" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">SKU</th>
                      <th className="text-left p-3">Producto</th>
                      <th className="text-left p-3">Categoría</th>
                      <th className="text-right p-3">Precio</th>
                      <th className="text-center p-3">Stock</th>
                      <th className="text-center p-3">Estado</th>
                      <th className="text-right p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data?.map((producto) => (
                      <tr key={producto.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs">{producto.sku}</td>
                        <td className="p-3 font-medium">{producto.nombre}</td>
                        <td className="p-3 text-gray-500">{producto.cat_categorias?.nombre || '-'}</td>
                        <td className="p-3 text-right font-bold">
                          {formatCurrency(producto.precio_oferta || producto.precio_venta)}
                        </td>
                        <td className="p-3 text-center">
                          {(producto as any).inv_stock_producto?.[0]?.cantidad_fisica ?? 0}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            producto.estado === 'activo' ? 'bg-green-100 text-green-800' :
                            producto.estado === 'inactivo' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {producto.estado}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Link to={`/admin/productos/${producto.id}/editar`}>
                              <Button variant="ghost" size="icon">
                                <Edit size={16} />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(producto.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
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
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Eliminar Producto"
        message="¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}