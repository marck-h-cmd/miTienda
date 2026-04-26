import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal } from 'lucide-react';

interface ProductFiltersProps {
  onFilter: (filters: Record<string, string>) => void;
}

export default function ProductFilters({ onFilter }: ProductFiltersProps) {
  const [busqueda, setBusqueda] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');

  const handleSearch = () => {
    const filters: Record<string, string> = {};
    if (busqueda) filters.busqueda = busqueda;
    if (precioMin) filters.precio_min = precioMin;
    if (precioMax) filters.precio_max = precioMax;
    onFilter(filters);
  };

  const handleClear = () => {
    setBusqueda('');
    setPrecioMin('');
    setPrecioMax('');
    onFilter({});
  };

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal size={18} />
        <h3 className="font-semibold">Filtros</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Buscar</label>
          <div className="relative">
            <Input
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Search size={16} className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Rango de Precio</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSearch} className="flex-1" size="sm">
            Filtrar
          </Button>
          <Button onClick={handleClear} variant="outline" size="sm" className="flex-1">
            Limpiar
          </Button>
        </div>
      </div>
    </div>
  );
}