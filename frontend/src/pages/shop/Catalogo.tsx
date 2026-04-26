import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productoService } from '@/services/producto.service';
import ProductCard from '@/components/producto/ProductCard';
import ProductFilters from '@/components/producto/ProductFilters';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Grid, List } from 'lucide-react';

export default function Catalogo() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data, isLoading } = useQuery({
    queryKey: ['productos', page, limit, filters],
    queryFn: () => productoService.listar({ page: String(page), limit: String(limit), ...filters }),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Catálogo de Productos</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filtros laterales */}
        <aside className="lg:w-64 flex-shrink-0">
          <ProductFilters onFilter={setFilters} />
        </aside>

        {/* Contenido principal */}
        <main className="flex-1">
          {/* Barra superior */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {data?.total || 0} productos encontrados
            </p>
            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={12}>12 por página</option>
                <option value={24}>24 por página</option>
                <option value={48}>48 por página</option>
              </select>
              <button onClick={() => setViewMode('grid')} className={`p-1 ${viewMode === 'grid' ? 'text-primary-600' : ''}`}>
                <Grid size={20} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1 ${viewMode === 'list' ? 'text-primary-600' : ''}`}>
                <List size={20} />
              </button>
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
              }>
                {data?.data?.map((producto) => (
                  <ProductCard key={producto.id} producto={producto} viewMode={viewMode} />
                ))}
              </div>

              {data && data.total > limit && (
                <Pagination
                  currentPage={data.page}
                  totalPages={Math.ceil(data.total / data.limit)}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}