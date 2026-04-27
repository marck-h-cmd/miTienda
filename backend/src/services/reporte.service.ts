import prisma from '../config/database';
import { config } from '../config';
import { formatearFecha, formatearFechaHora } from '../utils/dateHelpers';
import { NotFoundError } from '../middlewares/errorHandler';
import { generarPDFGestion } from '../utils/pdfGestion';
import {
  crearDocumentoPDF,
  agregarPiePagina,
  agregarSeccion,
  agregarTabla,
  agregarKPIs,
  agregarResumen,
  agregarDivisor,
  type KPICard,
  type TableColumn,
} from '../utils/pdfGenerator';

// ── Interfaces ────────────────────────────────────────────────────────────────

interface UsuarioBasico {
  nombre: string;
  apellido: string;
  email?: string;
}

interface ProductoBasico {
  nombre: string;
  sku: string;
  precio_costo?: any;
  precio_venta?: any;
  stock_minimo?: number;
}

interface ItemOrden {
  id: string;
  orden_id: string;
  producto_id: string;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: any;
  subtotal: any;
  cat_productos: ProductoBasico;
}

interface OrdenConRelaciones {
  id: string;
  total: any;
  subtotal: any;
  descuento: any;
  impuesto: any;
  costo_envio: any;
  moneda: string;
  estado: string;
  fecha_pedido: Date;
  fecha_actualizacion: Date;
  seg_usuarios: UsuarioBasico | null;
  ord_items_orden: ItemOrden[];
  ord_historial_estados?: any[];
  ord_direcciones_envio?: any;
}

interface StockConProducto {
  id: string;
  producto_id: string;
  cantidad_fisica: number;
  cantidad_reservada: number;
  cat_productos: ProductoBasico;
}

interface MovimientoConProducto {
  id: string;
  tipo_movimiento: string;
  cantidad: number;
  motivo: string;
  fecha_movimiento: Date;
  cat_productos: ProductoBasico;
}

interface PagoConOrden {
  id: string;
  estado: string;
  monto: any;
  moneda: string;
  tipo_pago: string;
  fecha_creacion: Date;
  ord_ordenes: { seg_usuarios: UsuarioBasico | null };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const M = config.negocio.monedaDefecto;
const fmt  = (n: any) => `${M} ${Number(n).toFixed(2)}`;
const fmtN = (n: any) => `${M} ${Number(n).toFixed(2)}`;

function estadoBadge(estado: string): string {
  const map: Record<string, string> = {
    pendiente_pago: 'Pendiente pago',
    pagada:         'Pagada',
    procesando:     'Procesando',
    enviada:        'Enviada',
    entregada:      'Entregada',
    cancelada:      'Cancelada',
    devuelta:       'Devuelta',
  };
  return map[estado] ?? estado;
}

// ── Service ───────────────────────────────────────────────────────────────────

export class ReporteService {

  // ── Reporte de Órdenes ──────────────────────────────────────────────────────

  async generarReporteOrdenes(filtros: {
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: string;
  }) {
    const where: any = {};
    if (filtros.fecha_inicio) where.fecha_pedido = { gte: new Date(filtros.fecha_inicio) };
    if (filtros.fecha_fin)    where.fecha_pedido = { ...where.fecha_pedido, lte: new Date(filtros.fecha_fin) };
    if (filtros.estado)       where.estado = filtros.estado;

    const ordenes = await prisma.ord_ordenes.findMany({
      where,
      include: {
        seg_usuarios:       { select: { nombre: true, apellido: true, email: true } },
        ord_items_orden:    { include: { cat_productos: { select: { nombre: true } } } },
        ord_historial_estados: { orderBy: { fecha_cambio: 'desc' }, take: 1 },
      },
      orderBy: { fecha_pedido: 'desc' },
    }) as unknown as OrdenConRelaciones[];

    // KPIs
    const totalGeneral  = ordenes.reduce((s, o) => s + Number(o.total), 0);
    const totalItems    = ordenes.reduce((s, o) => s + o.ord_items_orden.length, 0);
    const ticketPromedio = ordenes.length ? totalGeneral / ordenes.length : 0;

    const subtituloFecha = filtros.fecha_inicio && filtros.fecha_fin
      ? `${formatearFecha(new Date(filtros.fecha_inicio))} — ${formatearFecha(new Date(filtros.fecha_fin))}`
      : `Generado: ${formatearFecha(new Date())}`;

    const doc = crearDocumentoPDF({ titulo: 'Reporte de Órdenes', subtitulo: subtituloFecha });

    agregarKPIs(doc, [
      { label: 'Total órdenes',    value: String(ordenes.length) },
      { label: 'Ingresos totales', value: fmt(totalGeneral),  trend: 'up' },
      { label: 'Ticket promedio',  value: fmt(ticketPromedio) },
      { label: 'Ítems vendidos',   value: String(totalItems) },
    ] as KPICard[]);

    agregarSeccion(doc, 'Detalle de órdenes');

    const columns: TableColumn[] = [
      { header: 'Orden',    width: 0.8, format: (v) => String(v).slice(0, 8).toUpperCase() },
      { header: 'Cliente',  width: 1.6 },
      { header: 'Email',    width: 1.8 },
      { header: 'Estado',   width: 1.0, format: estadoBadge },
      { header: 'Ítems',    width: 0.5, align: 'right' },
      { header: 'Total',    width: 1.0, align: 'right', format: fmtN },
      { header: 'Fecha',    width: 1.0, format: (v) => formatearFecha(new Date(v)) },
    ];

    const rows = ordenes.map((o) => [
      o.id,
      `${o.seg_usuarios?.nombre ?? ''} ${o.seg_usuarios?.apellido ?? ''}`.trim(),
      o.seg_usuarios?.email ?? '—',
      o.estado,
      o.ord_items_orden.length,
      o.total,
      o.fecha_pedido,
    ]);

    agregarTabla(doc, columns, rows, { showTotals: false });

    agregarDivisor(doc);
    agregarResumen(doc, [
      { label: 'Total de órdenes',  value: String(ordenes.length) },
      { label: 'Ingresos totales',  value: fmt(totalGeneral), highlight: true },
      { label: 'Ticket promedio',   value: fmt(ticketPromedio) },
    ]);

    agregarPiePagina(doc);
    return doc;
  }

  // ── Inventario Valorizado ───────────────────────────────────────────────────

  async generarReporteInventarioValorizado() {
    const stock = await prisma.inv_stock_producto.findMany({
      include: {
        cat_productos: {
          select: { nombre: true, sku: true, precio_costo: true, precio_venta: true },
        },
      },
    }) as unknown as StockConProducto[];

    let totalCosto = 0;
    let totalVenta = 0;

    const rows = stock.map((item) => {
      const costoTotal = Number(item.cat_productos.precio_costo) * item.cantidad_fisica;
      const ventaTotal = Number(item.cat_productos.precio_venta) * item.cantidad_fisica;
      const margen     = ventaTotal - costoTotal;
      totalCosto += costoTotal;
      totalVenta += ventaTotal;
      return [
        item.cat_productos.sku,
        item.cat_productos.nombre,
        item.cantidad_fisica,
        item.cantidad_reservada,
        costoTotal,
        ventaTotal,
        margen,
      ];
    });

    const doc = crearDocumentoPDF({
      titulo: 'Inventario Valorizado',
      subtitulo: `Generado: ${formatearFecha(new Date())}`,
    });

    agregarKPIs(doc, [
      { label: 'SKUs en stock',    value: String(stock.length) },
      { label: 'Valor a costo',    value: fmt(totalCosto) },
      { label: 'Valor a venta',    value: fmt(totalVenta), trend: 'up' },
      { label: 'Margen potencial', value: fmt(totalVenta - totalCosto), trend: 'up' },
    ] as KPICard[]);

    agregarSeccion(doc, 'Detalle de stock por producto');

    const columns: TableColumn[] = [
      { header: 'SKU',       width: 0.9 },
      { header: 'Producto',  width: 2.2 },
      { header: 'Stock',     width: 0.6, align: 'right' },
      { header: 'Reservado', width: 0.8, align: 'right' },
      { header: 'Val. Costo',width: 1.0, align: 'right', format: fmtN },
      { header: 'Val. Venta',width: 1.0, align: 'right', format: fmtN },
      { header: 'Margen',    width: 1.0, align: 'right', format: fmtN },
    ];

    agregarTabla(doc, columns, rows, { showTotals: false });

    agregarDivisor(doc);
    agregarResumen(doc, [
      { label: 'Valor total a costo',    value: fmt(totalCosto) },
      { label: 'Valor total a venta',    value: fmt(totalVenta) },
      { label: 'Margen bruto potencial', value: fmt(totalVenta - totalCosto), highlight: true },
    ]);

    agregarPiePagina(doc);
    return doc;
  }

  // ── Movimientos de Inventario ───────────────────────────────────────────────

  async generarReporteMovimientos(filtros: { fecha_inicio?: string; fecha_fin?: string }) {
    const where: any = {};
    if (filtros.fecha_inicio) where.fecha_movimiento = { gte: new Date(filtros.fecha_inicio) };
    if (filtros.fecha_fin)    where.fecha_movimiento = { ...where.fecha_movimiento, lte: new Date(filtros.fecha_fin) };

    const movimientos = await prisma.inv_movimientos_inventario.findMany({
      where,
      include: { cat_productos: { select: { nombre: true, sku: true } } } as any,
      orderBy: { fecha_movimiento: 'desc' },
    }) as unknown as MovimientoConProducto[];

    const entradas = movimientos.filter((m) => m.tipo_movimiento === 'entrada').length;
    const salidas  = movimientos.filter((m) => m.tipo_movimiento === 'salida').length;
    const ajustes  = movimientos.filter((m) => m.tipo_movimiento === 'ajuste').length;

    const subtituloFecha = filtros.fecha_inicio && filtros.fecha_fin
      ? `${formatearFecha(new Date(filtros.fecha_inicio))} — ${formatearFecha(new Date(filtros.fecha_fin))}`
      : `Generado: ${formatearFecha(new Date())}`;

    const doc = crearDocumentoPDF({ titulo: 'Movimientos de Inventario', subtitulo: subtituloFecha });

    agregarKPIs(doc, [
      { label: 'Total movimientos', value: String(movimientos.length) },
      { label: 'Entradas',          value: String(entradas), trend: 'up' },
      { label: 'Salidas',           value: String(salidas),  trend: 'down' },
      { label: 'Ajustes',           value: String(ajustes) },
    ] as KPICard[]);

    agregarSeccion(doc, 'Detalle de movimientos');

    const columns: TableColumn[] = [
      { header: 'SKU',      width: 0.8 },
      { header: 'Producto', width: 2.0 },
      { header: 'Tipo',     width: 0.8 },
      { header: 'Cantidad', width: 0.7, align: 'right' },
      { header: 'Motivo',   width: 2.0 },
      { header: 'Fecha',    width: 1.2, format: (v) => formatearFechaHora(new Date(v)) },
    ];

    const rows = movimientos.map((m) => [
      m.cat_productos.sku,
      m.cat_productos.nombre,
      m.tipo_movimiento.charAt(0).toUpperCase() + m.tipo_movimiento.slice(1),
      m.cantidad,
      m.motivo,
      m.fecha_movimiento,
    ]);

    agregarTabla(doc, columns, rows, { showTotals: false, compact: true });

    agregarPiePagina(doc);
    return doc;
  }

  // ── Stock Bajo ──────────────────────────────────────────────────────────────

  async generarReporteStockBajo() {
    const stock = await prisma.inv_stock_producto.findMany({
      where: {
        cantidad_fisica: { gt: 0 },
        cat_productos:   { estado: 'activo', activo: true },
      },
      include: {
        cat_productos: {
          select: { nombre: true, sku: true, stock_minimo: true, precio_venta: true },
        },
      },
    }) as unknown as StockConProducto[];

    const productos = stock.filter(
      (item) => item.cantidad_fisica <= (item.cat_productos.stock_minimo ?? 0)
    );

    const criticos = productos.filter((p) => p.cantidad_fisica === 0).length;

    const doc = crearDocumentoPDF({
      titulo:    'Productos con Stock Bajo',
      subtitulo: `Generado: ${formatearFecha(new Date())}`,
    });

    agregarKPIs(doc, [
      { label: 'Productos en alerta', value: String(productos.length), trend: 'down' },
      { label: 'Sin stock',           value: String(criticos),          trend: 'down' },
    ] as KPICard[]);

    agregarSeccion(doc, 'Productos por reponer');

    const columns: TableColumn[] = [
      { header: 'SKU',         width: 0.9 },
      { header: 'Producto',    width: 2.5 },
      { header: 'Stock actual',width: 1.0, align: 'right' },
      { header: 'Stock mínimo',width: 1.0, align: 'right' },
      { header: 'Diferencia',  width: 1.0, align: 'right' },
      { header: 'P. Venta',    width: 1.0, align: 'right', format: fmtN },
    ];

    const rows = productos.map((item) => {
      const minimo = item.cat_productos.stock_minimo ?? 0;
      return [
        item.cat_productos.sku,
        item.cat_productos.nombre,
        item.cantidad_fisica,
        minimo,
        minimo - item.cantidad_fisica,
        item.cat_productos.precio_venta,
      ];
    });

    agregarTabla(doc, columns, rows, { showTotals: false });

    agregarPiePagina(doc);
    return doc;
  }

  // ── Pagos ───────────────────────────────────────────────────────────────────

  async generarReportePagos(filtros: { fecha_inicio?: string; fecha_fin?: string }) {
    const where: any = {};
    if (filtros.fecha_inicio) where.fecha_creacion = { gte: new Date(filtros.fecha_inicio) };
    if (filtros.fecha_fin)    where.fecha_creacion = { ...where.fecha_creacion, lte: new Date(filtros.fecha_fin) };

    const pagos = await prisma.ord_transacciones_pago.findMany({
      where,
      include: {
        ord_ordenes: { include: { seg_usuarios: { select: { nombre: true, apellido: true } } } },
      } as any,
      orderBy: { fecha_creacion: 'desc' },
    }) as unknown as PagoConOrden[];

    const totalPagos    = pagos.reduce((s, p) => s + Number(p.monto), 0);
    const completados   = pagos.filter((p) => p.estado === 'completado').length;
    const pendientes    = pagos.filter((p) => p.estado === 'pendiente').length;

    const subtituloFecha = filtros.fecha_inicio && filtros.fecha_fin
      ? `${formatearFecha(new Date(filtros.fecha_inicio))} — ${formatearFecha(new Date(filtros.fecha_fin))}`
      : `Generado: ${formatearFecha(new Date())}`;

    const doc = crearDocumentoPDF({ titulo: 'Reporte de Pagos', subtitulo: subtituloFecha });

    agregarKPIs(doc, [
      { label: 'Total transacciones', value: String(pagos.length) },
      { label: 'Monto total',         value: fmt(totalPagos), trend: 'up' },
      { label: 'Completados',         value: String(completados), trend: 'up' },
      { label: 'Pendientes',          value: String(pendientes),  trend: 'neutral' },
    ] as KPICard[]);

    agregarSeccion(doc, 'Detalle de transacciones');

    const columns: TableColumn[] = [
      { header: 'ID',      width: 0.8, format: (v) => String(v).slice(0, 8).toUpperCase() },
      { header: 'Estado',  width: 0.9 },
      { header: 'Método',  width: 1.0 },
      { header: 'Moneda',  width: 0.6, align: 'center' },
      { header: 'Monto',   width: 1.0, align: 'right', format: fmtN },
      { header: 'Fecha',   width: 1.4, format: (v) => formatearFechaHora(new Date(v)) },
    ];

    const rows = pagos.map((p) => [
      p.id,
      p.estado.charAt(0).toUpperCase() + p.estado.slice(1),
      p.tipo_pago,
      p.moneda,
      p.monto,
      p.fecha_creacion,
    ]);

    agregarTabla(doc, columns, rows, { showTotals: false });

    agregarDivisor(doc);
    agregarResumen(doc, [
      { label: 'Transacciones procesadas', value: String(completados) },
      { label: 'Monto total recaudado',    value: fmt(totalPagos), highlight: true },
    ]);

    agregarPiePagina(doc);
    return doc;
  }

  // ── Devoluciones ────────────────────────────────────────────────────────────

  async generarReporteDevoluciones(filtros: { fecha_inicio?: string; fecha_fin?: string }) {
    const where: any = { estado: 'devuelta' };
    if (filtros.fecha_inicio) where.fecha_pedido = { gte: new Date(filtros.fecha_inicio) };
    if (filtros.fecha_fin)    where.fecha_pedido = { ...where.fecha_pedido, lte: new Date(filtros.fecha_fin) };

    const devoluciones = await prisma.ord_ordenes.findMany({
      where,
      include: {
        seg_usuarios:    { select: { nombre: true, apellido: true } },
        ord_items_orden: true,
      },
      orderBy: { fecha_actualizacion: 'desc' },
    }) as unknown as OrdenConRelaciones[];

    const totalDevuelto = devoluciones.reduce((s, d) => s + Number(d.total), 0);

    const subtituloFecha = filtros.fecha_inicio && filtros.fecha_fin
      ? `${formatearFecha(new Date(filtros.fecha_inicio))} — ${formatearFecha(new Date(filtros.fecha_fin))}`
      : `Generado: ${formatearFecha(new Date())}`;

    const doc = crearDocumentoPDF({ titulo: 'Reporte de Devoluciones', subtitulo: subtituloFecha });

    agregarKPIs(doc, [
      { label: 'Órdenes devueltas', value: String(devoluciones.length), trend: 'down' },
      { label: 'Monto devuelto',    value: fmt(totalDevuelto),           trend: 'down' },
    ] as KPICard[]);

    agregarSeccion(doc, 'Detalle de devoluciones');

    const columns: TableColumn[] = [
      { header: 'Orden',      width: 0.8, format: (v) => String(v).slice(0, 8).toUpperCase() },
      { header: 'Cliente',    width: 1.8 },
      { header: 'Ítems',      width: 0.5, align: 'right' },
      { header: 'Total',      width: 1.0, align: 'right', format: fmtN },
      { header: 'F. Devolución', width: 1.2, format: (v) => formatearFecha(new Date(v)) },
    ];

    const rows = devoluciones.map((d) => [
      d.id,
      `${d.seg_usuarios?.nombre ?? ''} ${d.seg_usuarios?.apellido ?? ''}`.trim(),
      d.ord_items_orden.length,
      d.total,
      d.fecha_actualizacion,
    ]);

    agregarTabla(doc, columns, rows, { showTotals: false });

    agregarDivisor(doc);
    agregarResumen(doc, [
      { label: 'Total órdenes devueltas', value: String(devoluciones.length) },
      { label: 'Monto total devuelto',    value: fmt(totalDevuelto), highlight: true },
    ]);

    agregarPiePagina(doc);
    return doc;
  }

  // ── Factura de Orden ────────────────────────────────────────────────────────

  async generarFacturaOrden(ordenId: string) {
    const orden = await prisma.ord_ordenes.findUnique({
      where: { id: ordenId },
      include: {
        seg_usuarios:    { select: { nombre: true, apellido: true, email: true } },
        ord_items_orden: { include: { cat_productos: { select: { nombre: true, sku: true } } } },
        ord_direcciones_envio: true,
      },
    }) as unknown as OrdenConRelaciones | null;

    if (!orden) throw new NotFoundError('Orden no encontrada');

    const doc = crearDocumentoPDF({
      titulo:    `Factura N° ${orden.id.slice(0, 8).toUpperCase()}`,
      subtitulo: `Fecha: ${formatearFecha(orden.fecha_pedido)}`,
    });

    // Datos del cliente
    agregarSeccion(doc, 'Datos del cliente');
    agregarResumen(doc, [
      { label: 'Nombre',  value: `${orden.seg_usuarios?.nombre ?? ''} ${orden.seg_usuarios?.apellido ?? ''}`.trim() },
      { label: 'Email',   value: orden.seg_usuarios?.email ?? '—' },
      { label: 'Estado',  value: estadoBadge(orden.estado) },
    ]);

    // Ítems
    agregarSeccion(doc, 'Detalle de productos');

    const columns: TableColumn[] = [
      { header: 'SKU',        width: 0.8 },
      { header: 'Producto',   width: 2.8 },
      { header: 'Cant.',      width: 0.5, align: 'right' },
      { header: 'P. Unitario',width: 1.0, align: 'right', format: fmtN },
      { header: 'Subtotal',   width: 1.0, align: 'right', format: fmtN },
    ];

    const rows = orden.ord_items_orden.map((item) => [
      item.cat_productos.sku,
      item.cat_productos.nombre,
      item.cantidad,
      item.precio_unitario,
      item.subtotal,
    ]);

    agregarTabla(doc, columns, rows, { showTotals: false });

    // Totales
    agregarDivisor(doc);
    agregarResumen(doc, [
      { label: 'Subtotal',  value: fmt(orden.subtotal) },
      { label: 'Descuento', value: `- ${fmt(orden.descuento)}` },
      { label: 'IGV (18%)', value: fmt(orden.impuesto) },
      { label: 'Envío',     value: fmt(orden.costo_envio) },
      { label: `TOTAL (${orden.moneda})`, value: fmt(orden.total), highlight: true },
    ]);

    agregarPiePagina(doc);
    return doc;
  }

  // ── Rentabilidad por Producto ───────────────────────────────────────────────

  async generarReporteGestionRentabilidad() {
    const productos = await prisma.$queryRaw<any[]>`
      SELECT
        p.nombre, p.sku,
        p.precio_costo, p.precio_venta,
        COALESCE(SUM(oi.cantidad), 0)  AS unidades_vendidas,
        COALESCE(SUM(oi.subtotal), 0)  AS ingresos,
        (COALESCE(SUM(oi.subtotal), 0) - (p.precio_costo * COALESCE(SUM(oi.cantidad), 0))) AS margen
      FROM cat_productos p
      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id
      LEFT JOIN ord_ordenes o      ON oi.orden_id = o.id
        AND o.estado NOT IN ('cancelada', 'devuelta')
      GROUP BY p.id, p.nombre, p.sku, p.precio_costo, p.precio_venta
      ORDER BY ingresos DESC
    `;

    const totalIngresos = productos.reduce((s, p) => s + Number(p.ingresos), 0);
    const totalMargen   = productos.reduce((s, p) => s + Number(p.margen),   0);

    const doc = crearDocumentoPDF({
      titulo:    'Rentabilidad por Producto',
      subtitulo: `Generado: ${formatearFecha(new Date())}`,
    });

    agregarKPIs(doc, [
      { label: 'Productos analizados', value: String(productos.length) },
      { label: 'Ingresos totales',     value: fmt(totalIngresos), trend: 'up' },
      { label: 'Margen bruto total',   value: fmt(totalMargen),   trend: 'up' },
      {
        label: '% Margen promedio',
        value: totalIngresos > 0
          ? `${((totalMargen / totalIngresos) * 100).toFixed(1)}%`
          : '0%',
        trend: 'neutral',
      },
    ] as KPICard[]);

    agregarSeccion(doc, 'Análisis por producto');

    const columns: TableColumn[] = [
      { header: 'SKU',        width: 0.8 },
      { header: 'Producto',   width: 2.0 },
      { header: 'P. Costo',   width: 0.9, align: 'right', format: fmtN },
      { header: 'P. Venta',   width: 0.9, align: 'right', format: fmtN },
      { header: 'Uds. vend.', width: 0.8, align: 'right' },
      { header: 'Ingresos',   width: 1.0, align: 'right', format: fmtN },
      { header: 'Margen',     width: 1.0, align: 'right', format: fmtN },
    ];

    const rows = productos.map((p: any) => [
      p.sku,
      p.nombre,
      p.precio_costo,
      p.precio_venta,
      Number(p.unidades_vendidas),
      p.ingresos,
      p.margen,
    ]);

    agregarTabla(doc, columns, rows, { showTotals: false, compact: true });

    agregarDivisor(doc);
    agregarResumen(doc, [
      { label: 'Ingresos totales',   value: fmt(totalIngresos) },
      { label: 'Margen bruto total', value: fmt(totalMargen), highlight: true },
    ]);

    agregarPiePagina(doc);
    return doc;
  }

  // ── Ventas por Categoría ────────────────────────────────────────────────────

  async generarReporteGestionVentasCategoria() {
    const ventas = await prisma.$queryRaw<any[]>`
      SELECT
        c.nombre AS categoria,
        COUNT(DISTINCT o.id)           AS total_ordenes,
        COALESCE(SUM(o.total), 0)      AS total_ventas
      FROM cat_categorias c
      JOIN cat_productos p      ON p.categoria_id = c.id
      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id
      LEFT JOIN ord_ordenes o      ON oi.orden_id = o.id
        AND o.estado NOT IN ('cancelada', 'devuelta')
      GROUP BY c.id, c.nombre
      ORDER BY total_ventas DESC
    `;

    const totalVentas = ventas.reduce((s, v) => s + Number(v.total_ventas), 0);

    const doc = crearDocumentoPDF({
      titulo:    'Ventas por Categoría',
      subtitulo: `Generado: ${formatearFecha(new Date())}`,
    });

    agregarKPIs(doc, [
      { label: 'Categorías',      value: String(ventas.length) },
      { label: 'Ventas totales',  value: fmt(totalVentas), trend: 'up' },
    ] as KPICard[]);

    agregarSeccion(doc, 'Comparativa por categoría');

    const columns: TableColumn[] = [
      { header: 'Categoría',       width: 2.5 },
      { header: 'Total órdenes',   width: 1.0, align: 'right' },
      { header: 'Ventas totales',  width: 1.2, align: 'right', format: fmtN },
      { header: '% del total',     width: 1.0, align: 'right',
        format: (v) => totalVentas > 0 ? `${((Number(v) / totalVentas) * 100).toFixed(1)}%` : '0%' },
    ];

    const rows = ventas.map((v: any) => [
      v.categoria,
      Number(v.total_ordenes),
      v.total_ventas,
      v.total_ventas,
    ]);

    agregarTabla(doc, columns, rows, { showTotals: false });

    agregarPiePagina(doc);
    return doc;
  }

  // ── Análisis de Clientes ────────────────────────────────────────────────────

  async generarReporteGestionClientes() {
    const clientes = await prisma.$queryRaw<any[]>`
      SELECT
        c.nombre, c.apellido, c.email,
        COUNT(o.id)                     AS total_compras,
        COALESCE(SUM(o.total), 0)       AS total_gastado,
        MAX(o.fecha_pedido)             AS ultima_compra
      FROM cli_clientes c
      LEFT JOIN ord_ordenes o ON o.cliente_id = c.usuario_id
        AND o.estado NOT IN ('cancelada', 'devuelta')
      GROUP BY c.id, c.nombre, c.apellido, c.email
      ORDER BY total_gastado DESC
    `;

    const totalLTV      = clientes.reduce((s, c) => s + Number(c.total_gastado), 0);
    const conCompras    = clientes.filter((c) => Number(c.total_compras) > 0).length;
    const ticketMedio   = conCompras > 0
      ? clientes.reduce((s, c) => s + (Number(c.total_gastado) / Math.max(Number(c.total_compras), 1)), 0) / conCompras
      : 0;

    const doc = crearDocumentoPDF({
      titulo:    'Análisis de Clientes',
      subtitulo: `Generado: ${formatearFecha(new Date())}`,
    });

    agregarKPIs(doc, [
      { label: 'Total clientes',   value: String(clientes.length) },
      { label: 'Con compras',      value: String(conCompras) },
      { label: 'LTV total',        value: fmt(totalLTV),     trend: 'up' },
      { label: 'Ticket medio',     value: fmt(ticketMedio) },
    ] as KPICard[]);

    agregarSeccion(doc, 'Ranking de clientes por gasto');

    const columns: TableColumn[] = [
      { header: 'Cliente',        width: 1.6 },
      { header: 'Email',          width: 2.0 },
      { header: 'Compras',        width: 0.7, align: 'right' },
      { header: 'Total gastado',  width: 1.1, align: 'right', format: fmtN },
      { header: 'Última compra',  width: 1.2,
        format: (v) => v ? formatearFecha(new Date(v)) : '—' },
    ];

    const rows = clientes.map((c: any) => [
      `${c.nombre} ${c.apellido}`,
      c.email,
      Number(c.total_compras),
      c.total_gastado,
      c.ultima_compra,
    ]);

    agregarTabla(doc, columns, rows, { showTotals: false, compact: true });

    agregarPiePagina(doc);
    return doc;
  }

  // ── Rotación de Inventario ──────────────────────────────────────────────────

  async generarReporteGestionRotacionInventario() {
    const rotacion = await prisma.$queryRaw<any[]>`
      SELECT
        p.nombre, p.sku,
        COALESCE(s.cantidad_fisica, 0)  AS stock_actual,
        COALESCE(SUM(oi.cantidad), 0)   AS total_vendido
      FROM cat_productos p
      LEFT JOIN inv_stock_producto s   ON s.producto_id = p.id
      LEFT JOIN ord_items_orden oi     ON oi.producto_id = p.id
      LEFT JOIN ord_ordenes o          ON oi.orden_id = o.id
        AND o.estado NOT IN ('cancelada', 'devuelta')
      GROUP BY p.id, p.nombre, p.sku, s.cantidad_fisica
      ORDER BY total_vendido DESC
    `;

    const altaRotacion = rotacion.filter((r) => {
      const rot = Number(r.stock_actual) > 0 ? Number(r.total_vendido) / Number(r.stock_actual) : 0;
      return rot >= 2;
    }).length;

    const doc = crearDocumentoPDF({
      titulo:    'Rotación de Inventario',
      subtitulo: `Generado: ${formatearFecha(new Date())}`,
    });

    agregarKPIs(doc, [
      { label: 'Productos analizados', value: String(rotacion.length) },
      { label: 'Alta rotación (≥2x)',  value: String(altaRotacion), trend: 'up' },
    ] as KPICard[]);

    agregarSeccion(doc, 'Índice de rotación por producto');

    const columns: TableColumn[] = [
      { header: 'SKU',          width: 0.8 },
      { header: 'Producto',     width: 2.5 },
      { header: 'Stock actual', width: 1.0, align: 'right' },
      { header: 'Total vendido',width: 1.0, align: 'right' },
      { header: 'Índice rot.',  width: 1.0, align: 'right',
        format: (v) => Number(v).toFixed(2) + 'x' },
    ];

    const rows = rotacion.map((r: any) => {
      const idx = Number(r.stock_actual) > 0
        ? Number(r.total_vendido) / Number(r.stock_actual)
        : 0;
      return [r.sku, r.nombre, Number(r.stock_actual), Number(r.total_vendido), idx];
    });

    agregarTabla(doc, columns, rows, { showTotals: false, compact: true });

    agregarPiePagina(doc);
    return doc;
  }

  // ── HTML/Puppeteer variants (sin cambios) ───────────────────────────────────

  async generarReporteGestionRentabilidadHTML() {
    const productos = await prisma.$queryRaw<any[]>`
      SELECT p.nombre, p.sku, p.precio_costo, p.precio_venta,
        COALESCE(SUM(oi.cantidad), 0) as unidades_vendidas,
        COALESCE(SUM(oi.subtotal), 0) as ingresos
      FROM cat_productos p
      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id
      LEFT JOIN ord_ordenes o ON oi.orden_id = o.id
      GROUP BY p.id
      ORDER BY ingresos DESC
    `;
    return generarPDFGestion(
      'Reporte de Rentabilidad por Producto',
      productos,
      ['Producto', 'Unidades Vendidas', 'Ingresos', 'Costo Unit.', 'Margen'],
      ['nombre', 'unidades_vendidas', 'ingresos', 'precio_costo', 'margen'],
      'ingresos'
    );
  }

  async generarReporteGestionVentasHTML() {
    const ventas = await prisma.$queryRaw<any[]>`
      SELECT c.nombre as categoria, COUNT(DISTINCT o.id) as total_ordenes, SUM(o.total) as total_ventas
      FROM cat_categorias c
      JOIN cat_productos p ON p.categoria_id = c.id
      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id
      LEFT JOIN ord_ordenes o ON oi.orden_id = o.id
      GROUP BY c.id, c.nombre
    `;
    return generarPDFGestion(
      'Reporte de Ventas por Categoría',
      ventas,
      ['Categoría', 'Órdenes', 'Total Ventas'],
      ['categoria', 'total_ordenes', 'total_ventas'],
      'total_ventas'
    );
  }

  async generarReporteGestionCarritosHTML() {
    const carritos = await prisma.$queryRaw<any[]>`
      SELECT
        DATE(c.created_at) as fecha,
        COUNT(*) as carritos_creados,
        COUNT(DISTINCT o.id) as ordenes
      FROM ord_carritos c
      LEFT JOIN ord_ordenes o ON o.cliente_id = c.usuario_id
        AND DATE(o.fecha_pedido) = DATE(c.created_at)
      GROUP BY DATE(c.created_at)
      ORDER BY fecha DESC
      LIMIT 30
    `;
    return generarPDFGestion(
      'Reporte de Comportamiento de Carritos',
      carritos,
      ['Fecha', 'Carritos', 'Órdenes', 'Tasa Conversión'],
      ['fecha', 'carritos_creados', 'ordenes', 'conversion'],
      'carritos_creados'
    );
  }
}

export const reporteService = new ReporteService();