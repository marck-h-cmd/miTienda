import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { estadisticasService } from '@/services/estadisticas.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';
import { AreaChartComponent } from '@/components/charts/AreaChartComponent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, Package, Users, Award } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * FIX: "2024-01" → new Date("2024-01") es inválido en Safari/Firefox.
 * Añadir "-01" para forzar día 1 y parsear en UTC.
 */
const formatMonthYear = (mes: string): string => {
  const safe = mes.length === 7 ? `${mes}-01` : mes;   // "2024-01" → "2024-01-01"
  const d = new Date(safe + 'T00:00:00Z');
  if (isNaN(d.getTime())) return mes;
  return d.toLocaleDateString('es', { month: 'short', year: 'numeric', timeZone: 'UTC' });
};

/**
 * FIX: ultima_compra puede llegar como null o como string ISO de PostgreSQL.
 * new Date(null) devuelve epoch (1 enero 1970) — evitar eso.
 */
const formatUltimaCompra = (value: string | null): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-PE');
};

// ─── Segmento RFM ─────────────────────────────────────────────────────────────

interface SegmentoInfo { label: string; color: string }

function calcularSegmento(frecuencia: number, valor: number): SegmentoInfo {
  if (frecuencia >= 5 && valor >= 5000) return { label: 'Top',      color: 'bg-purple-100 text-purple-800' };
  if (frecuencia >= 3 && valor >= 1000) return { label: 'Leal',     color: 'bg-green-100 text-green-800'  };
  if (frecuencia === 1)                 return { label: 'Nuevo',    color: 'bg-blue-100 text-blue-800'    };
  if (valor < 500)                      return { label: 'Ocasional',color: 'bg-yellow-100 text-yellow-800'};
  return                                       { label: 'Regular',  color: 'bg-gray-100 text-gray-800'   };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Estadisticas() {
  const [meses, setMeses] = useState('12');

  const { data: ventasRaw = [], isLoading: ventasLoading, error: ventasError } = useQuery({
    queryKey: ['tendencia-ventas', meses],
    queryFn: () => estadisticasService.tendenciaVentas(Number(meses)),
  });

  const { data: abcRaw = [], isLoading: abcLoading, error: abcError } = useQuery({
    queryKey: ['analisis-abc'],
    queryFn: () => estadisticasService.analisisABC(),
  });

  const { data: rfmRaw = [], isLoading: rfmLoading, error: rfmError } = useQuery({
    queryKey: ['analisis-rfm'],
    queryFn: () => estadisticasService.analisisRFM(),
  });

  if (ventasLoading || abcLoading || rfmLoading) return <LoadingSpinner />;

  // ── Procesar ventas ──────────────────────────────────────────────────────
  const ventasChartData = (ventasRaw as any[]).map((item) => ({
    mes: formatMonthYear(item.mes),
    total: Number(item.total) || 0,
    cantidad_ordenes: Number(item.cantidad_ordenes) || 0,
  }));

  const ventasTotales  = ventasChartData.reduce((s, v) => s + v.total, 0);
  const totalOrdenes   = ventasChartData.reduce((s, v) => s + v.cantidad_ordenes, 0);
  const ticketPromedio = totalOrdenes > 0 ? ventasTotales / totalOrdenes : 0;

  // ── Procesar ABC ─────────────────────────────────────────────────────────
  // El servicio ya devuelve categoria calculada con porcentaje acumulado
  const abcChartData = (abcRaw as any[]).map((item) => ({
    nombre: item.nombre,
    ingreso_total: Number(item.ingreso_total) || 0,
    porcentaje: Number(item.porcentaje) || 0,
    porcentaje_acumulado: Number(item.porcentaje_acumulado) || 0,
    categoria: item.categoria as 'A' | 'B' | 'C',
  }));

  const productosA = abcChartData.filter((p) => p.categoria === 'A');
  const productosB = abcChartData.filter((p) => p.categoria === 'B');
  const productosC = abcChartData.filter((p) => p.categoria === 'C');

  // ── Procesar RFM ─────────────────────────────────────────────────────────
  const rfmChartData = (rfmRaw as any[]).map((item) => ({
    cliente: item.cliente,
    frecuencia: Number(item.frecuencia) || 0,
    valor_monetario: Number(item.valor_monetario) || 0,
    // FIX: usar helper seguro, no new Date() directo
    ultima_compra: formatUltimaCompra(item.ultima_compra),
  }));

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Estadísticas</h1>
        <Select value={meses} onValueChange={setMeses}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">Últimos 6 meses</SelectItem>
            <SelectItem value="12">Últimos 12 meses</SelectItem>
            <SelectItem value="24">Últimos 24 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Ventas Totales',   value: formatCurrency(ventasTotales),   icon: TrendingUp, color: 'text-blue-500'   },
          { label: 'Total Órdenes',    value: totalOrdenes,                    icon: Package,    color: 'text-green-500'  },
          { label: 'Ticket Promedio',  value: formatCurrency(ticketPromedio),  icon: Award,      color: 'text-purple-500' },
          { label: 'Clientes Activos', value: rfmChartData.length,             icon: Users,      color: 'text-orange-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
                <Icon className={`h-8 w-8 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tendencia de ventas */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Ventas Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          {ventasError ? (
            <p className="text-sm text-red-500 py-8 text-center">
              Error al cargar datos de ventas.
            </p>
          ) : ventasChartData.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              Sin órdenes en los últimos {meses} meses.
            </p>
          ) : (
            <AreaChartComponent
              data={ventasChartData}
              dataKey="total"
              xKey="mes"
            />
          )}
        </CardContent>
      </Card>

      {/* Contadores ABC */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { letra: 'A', label: 'Productos A (70%)',  desc: 'Alta rentabilidad',  count: productosA.length, color: 'text-blue-600'   },
          { letra: 'B', label: 'Productos B (20%)',  desc: 'Rentabilidad media', count: productosB.length, color: 'text-yellow-600' },
          { letra: 'C', label: 'Productos C (10%)',  desc: 'Baja rentabilidad',  count: productosC.length, color: 'text-gray-600'   },
        ].map(({ label, desc, count, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{label}</CardTitle>
              <p className="text-sm text-gray-500">{desc}</p>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${color}`}>{count}</p>
              <p className="text-sm text-gray-500">productos</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico pie ABC */}
      <Card>
        <CardHeader>
          <CardTitle>Contribución por Producto (Top 10)</CardTitle>
        </CardHeader>
        <CardContent>
          {abcError ? (
            <p className="text-sm text-red-500 py-8 text-center">Error al cargar análisis ABC.</p>
          ) : abcChartData.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Sin datos de productos.</p>
          ) : (
            <PieChartComponent
              data={abcChartData.slice(0, 10)}
              dataKey="ingreso_total"
              nameKey="nombre"
            />
          )}
        </CardContent>
      </Card>

      {/* Tabla ABC */}
      <Card>
        <CardHeader>
          <CardTitle>Clasificación de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Producto</th>
                  <th className="text-right p-3">Ingreso Total</th>
                  <th className="text-right p-3">% Individual</th>
                  <th className="text-right p-3">% Acumulado</th>
                  <th className="text-center p-3">Clase</th>
                </tr>
              </thead>
              <tbody>
                {abcChartData.map((p, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{p.nombre}</td>
                    <td className="p-3 text-right">{formatCurrency(p.ingreso_total)}</td>
                    <td className="p-3 text-right">{p.porcentaje.toFixed(2)}%</td>
                    <td className="p-3 text-right">{p.porcentaje_acumulado.toFixed(2)}%</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        p.categoria === 'A' ? 'bg-blue-100 text-blue-800' :
                        p.categoria === 'B' ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-gray-100 text-gray-800'
                      }`}>
                        {p.categoria}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico Top 10 clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Clientes por Valor Monetario</CardTitle>
        </CardHeader>
        <CardContent>
          {rfmError ? (
            <p className="text-sm text-red-500 py-8 text-center">Error al cargar datos RFM.</p>
          ) : rfmChartData.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Sin clientes con compras registradas.</p>
          ) : (
            <BarChartComponent
              data={rfmChartData.slice(0, 10)}
              dataKey="valor_monetario"
              xKey="cliente"
              horizontal
            />
          )}
        </CardContent>
      </Card>

      {/* Tabla RFM */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis RFM de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {rfmChartData.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Sin datos de clientes.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Cliente</th>
                    <th className="text-left p-3">Última Compra</th>
                    <th className="text-center p-3">Frecuencia</th>
                    <th className="text-right p-3">Valor Monetario</th>
                    <th className="text-center p-3">Segmento</th>
                  </tr>
                </thead>
                <tbody>
                  {rfmChartData.map((c, i) => {
                    const seg = calcularSegmento(c.frecuencia, c.valor_monetario);
                    return (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{c.cliente}</td>
                        {/* FIX: ya viene formateado, no volver a hacer new Date() */}
                        <td className="p-3 text-gray-500">{c.ultima_compra}</td>
                        <td className="p-3 text-center font-semibold">{c.frecuencia}</td>
                        <td className="p-3 text-right font-bold">{formatCurrency(c.valor_monetario)}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${seg.color}`}>
                            {seg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}