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

  const { data, isLoading, error } = useQuery({
    queryKey: ['productos', page, limit, filters],
    queryFn: () => productoService.listar({ page: String(page), limit: String(limit), ...filters }),
    retry: 1,
  });


  // Extrae los productos de forma segura
  const productos = Array.isArray(data?.productos) ? data.productos : [];
  const total = typeof data?.total === 'number' ? data.total : 0;
  

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
              {total} productos encontrados
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              Error al cargar productos: {error instanceof Error ? error.message : 'Error desconocido'}
            </div>
          )}

          {isLoading ? (
            <LoadingSpinner />
          ) : productos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay productos disponibles</p>
              {data && <p className="text-gray-400 text-sm mt-2">Debug: {JSON.stringify(data).substring(0, 100)}</p>}
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
              }>
                {productos.map((producto) => (
                  <ProductCard 
                    key={producto.id} 
                    producto={producto} 
                    viewMode={viewMode} 
                  />
                ))}
              </div>

              {total > limit && (
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(total / limit)}
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