import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChartComponent } from '@/components/charts/AreaChartComponent';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { LineChartComponent } from '@/components/charts/LineChartComponent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Estadisticas() {
  const [dias, setDias] = useState(90);

  const { data: ventasDiarias } = useQuery({
    queryKey: ['est-ventas', dias],
    queryFn: () => dashboardService.ventasDiarias(dias),
  });

  const { data: ventasCategoria } = useQuery({
    queryKey: ['est-categoria', dias],
    queryFn: () => dashboardService.ventasPorCategoria(dias),
  });

  const { data: topProductos } = useQuery({
    queryKey: ['est-top', dias],
    queryFn: () => dashboardService.topProductos(dias),
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Estadísticas</h1>
        <select
          value={dias}
          onChange={(e) => setDias(Number(e.target.value))}
          className="border rounded px-3 py-2"
        >
          <option value={30}>Últimos 30 días</option>
          <option value={90}>Últimos 3 meses</option>
          <option value={180}>Últimos 6 meses</option>
          <option value={365}>Último año</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Tendencia de Ventas</CardTitle></CardHeader>
          <CardContent>
            {ventasDiarias && <AreaChartComponent data={ventasDiarias as any[]} dataKey="total" xKey="fecha" />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Ventas por Categoría</CardTitle></CardHeader>
          <CardContent>
            {ventasCategoria && <PieChartComponent data={ventasCategoria as any[]} dataKey="total" nameKey="categoria" />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Top Productos Más Vendidos</CardTitle></CardHeader>
          <CardContent>
            {topProductos && (
              <BarChartComponent
                data={topProductos as any[]}
                dataKey="cantidad_vendida"
                xKey="nombre"
                horizontal
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}