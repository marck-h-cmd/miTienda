import { useState } from 'react';
import { reporteService } from '@/services/reporte.service';
import {
  FileText, Download, Package, TrendingUp, ShoppingCart,
  Users, Archive, AlertTriangle, RefreshCw, CreditCard, RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReporteConfig {
  title: string;
  desc: string;
  badge: string;
  color: string;
  icon: React.ElementType;
  action: (filtros: Filtros) => Promise<void>;
}

interface Filtros {
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
}

// ─── Report definitions ───────────────────────────────────────────────────────

const REPORTES_OPERACIONALES: ReporteConfig[] = [
  {
    title: 'Órdenes',
    desc: 'Listado completo de órdenes con detalle de cliente e ítems.',
    badge: 'Operacional',
    color: '#1a56db',
    icon: ShoppingCart,
    action: (f) => reporteService.reporteOrdenes(f),
  },
  {
    title: 'Inventario valorizado',
    desc: 'Stock actual con costo, precio de venta y margen calculado.',
    badge: 'Inventario',
    color: '#0d9488',
    icon: Package,
    action: () => reporteService.reporteInventario(),
  },
  {
    title: 'Movimientos',
    desc: 'Entradas, salidas y ajustes de inventario en el período.',
    badge: 'Inventario',
    color: '#7c3aed',
    icon: Archive,
    action: (f) => reporteService.reporteMovimientos(f),
  },
  {
    title: 'Stock bajo',
    desc: 'Productos en o por debajo del nivel mínimo de stock.',
    badge: 'Alerta',
    color: '#dc2626',
    icon: AlertTriangle,
    action: () => reporteService.reporteStockBajo(),
  },
  {
    title: 'Pagos',
    desc: 'Transacciones recibidas, métodos y totales por período.',
    badge: 'Finanzas',
    color: '#059669',
    icon: CreditCard,
    action: (f) => reporteService.reportePagos(f),
  },
  {
    title: 'Devoluciones',
    desc: 'Órdenes devueltas con motivo y monto en el período.',
    badge: 'Operacional',
    color: '#ea580c',
    icon: RotateCcw,
    action: (f) => reporteService.reporteDevoluciones(f),
  },
];

const REPORTES_GESTION: ReporteConfig[] = [
  {
    title: 'Rentabilidad por producto',
    desc: 'Margen bruto, unidades vendidas e ingresos por SKU.',
    badge: 'Gestión',
    color: '#1a56db',
    icon: TrendingUp,
    action: () => reporteService.reporteRentabilidad(),
  },
  {
    title: 'Ventas por categoría',
    desc: 'Comparativa de ingresos y órdenes por categoría de producto.',
    badge: 'Gestión',
    color: '#7c3aed',
    icon: ShoppingCart,
    action: () => reporteService.reporteVentasCategoria(),
  },
  {
    title: 'Análisis de clientes',
    desc: 'Segmentación, LTV y comportamiento de compra.',
    badge: 'Clientes',
    color: '#0d9488',
    icon: Users,
    action: () => reporteService.reporteClientes(),
  },
  {
    title: 'Rotación de inventario',
    desc: 'Índice de rotación, stock actual vs. unidades vendidas.',
    badge: 'Inventario',
    color: '#ea580c',
    icon: RefreshCw,
    action: () => reporteService.reporteRotacion(),
  },
];

// ─── Card component ───────────────────────────────────────────────────────────

function ReporteCard({
  reporte,
  filtros,
}: {
  reporte: ReporteConfig;
  filtros: Filtros;
}) {
  const [loading, setLoading] = useState(false);
  const Icon = reporte.icon;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      await reporte.action(filtros);
    } catch {
      toast.error(`Error al generar "${reporte.title}"`);
    } finally {
      setLoading(false);
    }
  };

  const iconBg   = reporte.color + '18'; // ~10% opacity tint
  const badgeBg  = reporte.color + '14';

  return (
    <div
      onClick={handleDownload}
      style={{ borderTop: `2px solid ${reporte.color}` }}
      className="
        group relative cursor-pointer
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        rounded-xl p-4
        hover:border-gray-300 dark:hover:border-gray-700
        hover:shadow-sm
        active:scale-[0.99]
        transition-all duration-150
      "
    >
      {/* Top row: icon + badge */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}
        >
          <Icon size={15} style={{ color: reporte.color }} strokeWidth={1.8} />
        </div>
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: badgeBg, color: reporte.color }}
        >
          {reporte.badge}
        </span>
      </div>

      {/* Title + description */}
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 leading-snug">
        {reporte.title}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
        {reporte.desc}
      </p>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="
          inline-flex items-center gap-1.5
          text-xs font-medium
          text-gray-500 dark:text-gray-400
          border border-gray-200 dark:border-gray-700
          rounded-md px-2.5 py-1.5
          hover:border-gray-300 dark:hover:border-gray-600
          hover:text-gray-700 dark:hover:text-gray-200
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150
        "
      >
        {loading ? (
          <RefreshCw size={11} className="animate-spin" />
        ) : (
          <Download size={11} />
        )}
        {loading ? 'Generando…' : 'Descargar PDF'}
      </button>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={13} className="text-gray-400" strokeWidth={2} />
      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Reportes() {
  const today = new Date().toISOString().slice(0, 10);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin,    setFechaFin]    = useState(today);

  const filtros: Filtros = {
    fecha_inicio: fechaInicio || undefined,
    fecha_fin:    fechaFin    || undefined,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          <h1 className="text-xl font-medium text-gray-900 dark:text-gray-100">
            Reportes
          </h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 ml-4">
          Descarga reportes en PDF para operaciones y gestión.
        </p>
      </div>

      {/* Date filter bar */}
      <div className="
        flex flex-wrap items-center gap-3 mb-8
        bg-gray-50 dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        rounded-xl px-4 py-3
      ">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mr-1">
          Período
        </span>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="
              text-xs px-3 py-1.5 rounded-lg
              border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800
              text-gray-700 dark:text-gray-300
              focus:outline-none focus:ring-1 focus:ring-blue-500
              font-mono
            "
          />
          <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="
              text-xs px-3 py-1.5 rounded-lg
              border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-800
              text-gray-700 dark:text-gray-300
              focus:outline-none focus:ring-1 focus:ring-blue-500
              font-mono
            "
          />
        </div>

        <button
          onClick={() => { setFechaInicio(''); setFechaFin(today); }}
          className="
            ml-auto text-xs text-gray-400 hover:text-gray-600
            dark:hover:text-gray-300
            border border-gray-200 dark:border-gray-700
            rounded-lg px-3 py-1.5
            hover:border-gray-300 dark:hover:border-gray-600
            transition-colors duration-150
          "
        >
          Limpiar
        </button>
      </div>

      {/* Operacionales */}
      <div className="mb-8">
        <SectionLabel icon={FileText} label="Operacionales" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORTES_OPERACIONALES.map((r) => (
            <ReporteCard key={r.title} reporte={r} filtros={filtros} />
          ))}
        </div>
      </div>

      {/* Gestión */}
      <div>
        <SectionLabel icon={TrendingUp} label="Gestión" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {REPORTES_GESTION.map((r) => (
            <ReporteCard key={r.title} reporte={r} filtros={filtros} />
          ))}
        </div>
      </div>

    </div>
  );
}