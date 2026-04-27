import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { productoService } from '@/services/producto.service';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductosAdmin() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const filters: Record<string, string> = {};
  if (search) filters.busqueda = search;
  if (filtroEstado !== 'todos') filters.estado = filtroEstado;

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-productos', page, limit, filters],
    queryFn: () => productoService.listar({
      page: String(page),
      limit: String(limit),
      ...filters
    }),
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productoService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-productos'] });
      toast.success('Producto eliminado');
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar producto');
    },
  });

  const productos = data?.data ?? [];
  const total = typeof data?.total === 'number' ? data.total : 0;
  const currentPage = data?.page || 1;
  const itemsPerPage = data?.limit || limit;
  const totalPages = Math.ceil(total / itemsPerPage);

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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Buscar productos por nombre o SKU..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            <div className="w-48">
              <Select value={filtroEstado} onValueChange={(value) => {
                setFiltroEstado(value);
                setPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="borrador">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-36">
              <Select value={String(limit)} onValueChange={(value) => {
                setLimit(Number(value));
                setPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Mostrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 por página</SelectItem>
                  <SelectItem value="25">25 por página</SelectItem>
                  <SelectItem value="50">50 por página</SelectItem>
                  <SelectItem value="100">100 por página</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            {total} productos encontrados
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              Error al cargar productos: {error instanceof Error ? error.message : 'Error desconocido'}
            </div>
          )}

          {isLoading ? (
            <LoadingSpinner />
          ) : productos.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No hay productos disponibles</p>
              <p className="text-gray-400 text-sm mt-2">
                {search || filtroEstado !== 'todos'
                  ? 'Intenta con otros filtros de búsqueda'
                  : 'Comienza agregando tu primer producto'}
              </p>
              {!search && filtroEstado === 'todos' && (
                <Link to="/admin/productos/nuevo" className="mt-4 inline-block">
                  <Button variant="outline">
                    <Plus size={18} className="mr-2" />
                    Crear primer producto
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-center p-3 font-semibold">Imagen</th>
                      <th className="text-left p-3 font-semibold">SKU</th>
                      <th className="text-left p-3 font-semibold">Producto</th>
                      <th className="text-left p-3 font-semibold">Categoría</th>
                      <th className="text-right p-3 font-semibold">Precio</th>
                      <th className="text-center p-3 font-semibold">Stock</th>
                      <th className="text-center p-3 font-semibold">Estado</th>
                      <th className="text-right p-3 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((producto) => (
                      <tr key={producto.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-center">
                          {producto.cat_imagenes_producto?.[0] ? (
                            <img
                              src={producto.cat_imagenes_producto[0].url}
                              alt={producto.nombre}
                              className="w-12 h-12 object-cover rounded cursor-pointer mx-auto"
                              onClick={() => setSelectedImage(producto.cat_imagenes_producto![0].url)}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center mx-auto">
                              <Package size={16} className="text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-mono text-xs">{producto.sku}</td>
                        <td className="p-3">
                          <div className="font-medium">{producto.nombre}</div>
                          {producto.descripcion_corta && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                              {producto.descripcion_corta}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-gray-500">
                          {producto.cat_categorias?.nombre || '-'}
                          {producto.cat_subcategorias?.nombre && (
                            <div className="text-xs text-gray-400">
                              / {producto.cat_subcategorias?.nombre}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {producto.precio_oferta ? (
                            <div>
                              <span className="font-bold text-green-600">
                                {formatCurrency(producto.precio_oferta)}
                              </span>
                              <span className="text-xs text-gray-400 line-through ml-2">
                                {formatCurrency(producto.precio_venta)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold">{formatCurrency(producto.precio_venta)}</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            (producto.inv_stock_producto?.[0]?.cantidad_fisica || 0) > 10
                              ? 'bg-green-100 text-green-800'
                              : (producto.inv_stock_producto?.[0]?.cantidad_fisica || 0) > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {producto.inv_stock_producto?.[0]?.cantidad_fisica || 0} unidades
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            producto.estado === 'activo' ? 'bg-green-100 text-green-800' :
                            producto.estado === 'inactivo' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {producto.estado === 'activo' ? 'Activo' :
                             producto.estado === 'inactivo' ? 'Inactivo' : 'Borrador'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Link to={`/admin/productos/${producto.id}/editar`}>
                              <Button variant="ghost" size="icon" title="Editar">
                                <Edit size={16} />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(producto.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Eliminar"
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

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de imagen sin dependencias externas */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Vista previa de imagen</h2>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
              >
                ✕
              </button>
            </div>
            <img src={selectedImage} alt="Vista previa" className="w-full h-auto rounded" />
          </div>
        </div>
      )}

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
