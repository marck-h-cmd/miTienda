import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChartComponent } from '@/components/charts/AreaChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  DollarSign, ShoppingCart, Users, TrendingUp,
  Package, AlertTriangle,
} from 'lucide-react';

// ─── Helper: "2024-01-15" → "15 ene" sin riesgo de fecha inválida ─────────────
const formatFechaDia = (fecha: string): string => {
  const safe = fecha?.slice(0, 10); // tomar solo YYYY-MM-DD
  const d    = new Date(`${safe}T00:00:00Z`);
  if (!safe || isNaN(d.getTime())) return fecha ?? '';
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', timeZone: 'UTC' });
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  title, value, icon, variant = 'default',
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'default' | 'warning' | 'danger';
}) {
  const bg = { default: 'bg-white', warning: 'bg-yellow-50', danger: 'bg-red-50' }[variant];
  return (
    <div className={`${bg} rounded-lg p-4 shadow-sm border`}>
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

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyChart({ message = 'Sin datos para este período' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-48 text-sm text-gray-400">
      {message}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data: kpis, isLoading: loadingKPIs } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn:  () => dashboardService.obtenerKPIs(),
  });

  // FIX: nombres corregidos — ventasDiarias, ventasPorCategoria, topProductos
  const { data: ventasDiariasRaw } = useQuery({
    queryKey: ['dashboard-ventas-diarias'],
    queryFn:  () => dashboardService.ventasDiarias(),
  });

  const { data: ventasCategoriaRaw } = useQuery({
    queryKey: ['dashboard-ventas-categoria'],
    queryFn:  () => dashboardService.ventasPorCategoria(),
  });

  const { data: topProductosRaw } = useQuery({
    queryKey: ['dashboard-top-productos'],
    queryFn:  () => dashboardService.topProductos(),
  });

  if (loadingKPIs) return <LoadingSpinner />;

  // FIX: formatear fecha de forma segura para Recharts
  const ventasDiarias = (ventasDiariasRaw ?? []).map((v: any) => ({
    ...v,
    fecha: formatFechaDia(v.fecha),
    total: Number(v.total) || 0,
  }));

  const ventasCategoria = (ventasCategoriaRaw ?? []).map((v: any) => ({
    ...v,
    total: Number(v.total) || 0,
  }));

  const topProductos = (topProductosRaw ?? []).map((p: any) => ({
    ...p,
    cantidad_vendida: Number(p.cantidad_vendida) || 0,
  }));

  const fmt = (n?: number) => `S/ ${(n ?? 0).toFixed(2)}`;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* KPIs fila 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KpiCard title="Ventas Totales"   value={fmt(kpis?.ventas_totales)}         icon={<DollarSign   className="text-green-500"  />} />
        <KpiCard title="Órdenes"          value={kpis?.total_ordenes ?? 0}           icon={<ShoppingCart className="text-blue-500"   />} />
        <KpiCard title="Ticket Promedio"  value={fmt(kpis?.ticket_promedio)}         icon={<TrendingUp   className="text-purple-500" />} />
        <KpiCard title="Clientes Nuevos"  value={kpis?.clientes_nuevos ?? 0}         icon={<Users        className="text-orange-500" />} />
      </div>

      {/* KPIs fila 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard title="Tasa Conversión"     value={`${(kpis?.tasa_conversion ?? 0).toFixed(1)}%`}  icon={<TrendingUp    className="text-teal-500"   />} />
        <KpiCard title="Tasa Abandono"       value={`${(kpis?.tasa_abandono ?? 0).toFixed(1)}%`}    icon={<AlertTriangle className="text-red-500"    />} />
        <KpiCard title="Productos Agotados"  value={kpis?.productos_agotados ?? 0}                   icon={<Package       className="text-gray-500"   />} variant="danger"  />
        <KpiCard title="Órdenes Pendientes"  value={kpis?.ordenes_pendientes ?? 0}                   icon={<AlertTriangle className="text-yellow-500" />} variant="warning" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card>
          <CardHeader><CardTitle>Ventas Diarias</CardTitle></CardHeader>
          <CardContent>
            {ventasDiarias.length > 0
              ? <AreaChartComponent data={ventasDiarias} dataKey="total" xKey="fecha" />
              : <EmptyChart />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Ventas por Categoría</CardTitle></CardHeader>
          <CardContent>
            {ventasCategoria.length > 0
              ? <PieChartComponent data={ventasCategoria} dataKey="total" nameKey="categoria" />
              : <EmptyChart />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Top 10 Productos Más Vendidos</CardTitle></CardHeader>
          <CardContent>
            {topProductos.length > 0
              ? <BarChartComponent data={topProductos} dataKey="cantidad_vendida" xKey="nombre" />
              : <EmptyChart />}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}