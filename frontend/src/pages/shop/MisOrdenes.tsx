import { useQuery } from '@tanstack/react-query';
import { ordenService } from '@/services/orden.service';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { ESTADOS_ORDEN } from '@/types';
import { Package, Eye } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import { useState } from 'react';

export default function MisOrdenes() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['mis-ordenes', page],
    queryFn: () => ordenService.listar({ page: String(page), limit: '10' }),
  });

  if (isLoading) return <LoadingSpinner />;

  if (!data?.data?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="No tienes órdenes"
          description="Realiza tu primera compra en nuestro catálogo"
          actionLabel="Ver Catálogo"
          actionLink="/catalogo"
          icon={<Package size={64} className="text-gray-300" />}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Mis Órdenes</h1>

      <div className="space-y-4">
        {data.data.map((orden) => (
          <div key={orden.id} className="border rounded-lg p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500">Orden #{orden.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-gray-400">{formatDate(orden.fecha_pedido)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orden.estado)}`}>
                {ESTADOS_ORDEN[orden.estado] || orden.estado}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex gap-2 flex-1">
                {orden.ord_items_orden.slice(0, 3).map((item) => (
                  <div key={item.id} className="text-sm text-gray-600">
                    {item.nombre_producto} x{item.cantidad}
                  </div>
                ))}
                {orden.ord_items_orden.length > 3 && (
                  <span className="text-sm text-gray-400">
                    +{orden.ord_items_orden.length - 3} más
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="font-bold text-lg">
                Total: {formatCurrency(Number(orden.total))}
              </p>
              <Link
                to={`/orden/${orden.id}`}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                <Eye size={18} />
                Ver Detalle
              </Link>
            </div>
          </div>
        ))}
      </div>

      {data.total > 10 && (
        <Pagination
          currentPage={data.page}
          totalPages={Math.ceil(data.total / data.limit)}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}