import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChartComponent } from '@/components/charts/AreaChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DollarSign, ShoppingCart, Users, TrendingUp, Package, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { data: kpis, isLoading: loadingKPIs } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => dashboardService.obtenerKPIs(),
  });

  const { data: ventasDiarias, isLoading: loadingVentas } = useQuery({
    queryKey: ['dashboard-ventas-diarias'],
    queryFn: () => dashboardService.ventasDiarias(),
  });

  const { data: ventasCategoria } = useQuery({
    queryKey: ['dashboard-ventas-categoria'],
    queryFn: () => dashboardService.ventasPorCategoria(),
  });

  const { data: topProductos } = useQuery({
    queryKey: ['dashboard-top-productos'],
    queryFn: () => dashboardService.topProductos(),
  });

  if (loadingKPIs) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Ventas Totales"
          value={`S/ ${kpis?.ventas_totales?.toFixed(2) || '0.00'}`}
          icon={<DollarSign className="text-green-500" />}
        />
        <KpiCard
          title="Órdenes"
          value={kpis?.total_ordenes || 0}
          icon={<ShoppingCart className="text-blue-500" />}
        />
        <KpiCard
          title="Ticket Promedio"
          value={`S/ ${kpis?.ticket_promedio?.toFixed(2) || '0.00'}`}
          icon={<TrendingUp className="text-purple-500" />}
        />
        <KpiCard
          title="Clientes Nuevos"
          value={kpis?.clientes_nuevos || 0}
          icon={<Users className="text-orange-500" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title="Tasa Conversión"
          value={`${kpis?.tasa_conversion?.toFixed(1) || 0}%`}
          icon={<TrendingUp className="text-teal-500" />}
        />
        <KpiCard
          title="Tasa Abandono"
          value={`${kpis?.tasa_abandono?.toFixed(1) || 0}%`}
          icon={<AlertTriangle className="text-red-500" />}
        />
        <KpiCard
          title="Productos Agotados"
          value={kpis?.productos_agotados || 0}
          icon={<Package className="text-gray-500" />}
          variant="danger"
        />
        <KpiCard
          title="Órdenes Pendientes"
          value={kpis?.ordenes_pendientes || 0}
          icon={<AlertTriangle className="text-yellow-500" />}
          variant="warning"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Ventas Diarias</CardTitle></CardHeader>
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
          <CardHeader><CardTitle>Top 10 Productos Más Vendidos</CardTitle></CardHeader>
          <CardContent>
            {topProductos && <BarChartComponent data={topProductos as any[]} dataKey="cantidad_vendida" xKey="nombre" />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, variant = 'default' }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'default' | 'warning' | 'danger';
}) {
  const bgColors = {
    default: 'bg-white',
    warning: 'bg-yellow-50',
    danger: 'bg-red-50',
  };

  return (
    <div className={`${bgColors[variant]} rounded-lg p-4 shadow-sm border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
      </div>
    </div>
  );
}