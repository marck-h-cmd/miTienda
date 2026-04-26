import { IProducto } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  productos: IProducto[];
  viewMode?: 'grid' | 'list';
  isLoading?: boolean;
}

export default function ProductGrid({ productos, viewMode = 'grid', isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'flex flex-col gap-4'
      }>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-48 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No se encontraron productos</p>
        <p className="text-gray-400 text-sm mt-2">Intenta con otros filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid' 
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
      : 'flex flex-col gap-4'
    }>
      {productos.map((producto) => (
        <ProductCard key={producto.id} producto={producto} viewMode={viewMode} />
      ))}
    </div>
  );
}