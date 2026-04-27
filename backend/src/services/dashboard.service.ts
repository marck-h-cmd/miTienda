import prisma from '../config/database';
import { obtenerRangoFechas } from '../utils/dateHelpers';

export class DashboardService {

  // ── KPIs ───────────────────────────────────────────────────────────────────

  async obtenerKPIs(dias: number = 30) {
    const { inicio, fin } = obtenerRangoFechas(dias);

    const [
      ventasPeriodo,
      totalOrdenes,
      carritosCreados,
      productosAgotados,
      stockBajoRows,
      ordenesPendientes,
      clientesNuevos,
    ] = await Promise.all([
      prisma.ord_ordenes.aggregate({
        where: {
          fecha_pedido: { gte: inicio, lte: fin },
          estado: { notIn: ['cancelada', 'devuelta'] },
        },
        _sum: { total: true },
      }),
      prisma.ord_ordenes.count({
        where: { fecha_pedido: { gte: inicio, lte: fin } },
      }),
      prisma.ord_carritos.count({
        where: { created_at: { gte: inicio, lte: fin } },
      }),
      prisma.inv_stock_producto.count({
        where: { cantidad_fisica: 0 },
      }),
      // FIX: ::text evita BigInt — Number() lo convierte de forma segura
      prisma.$queryRaw<{ count: string }[]>`
        SELECT COUNT(*)::text AS count
        FROM inv_stock_producto s
        JOIN cat_productos p ON p.id = s.producto_id
        WHERE s.cantidad_fisica > 0
          AND s.cantidad_fisica <= p.stock_minimo
          AND p.estado = 'activo'
          AND p.activo = true
      `,
      prisma.ord_ordenes.count({
        where: { estado: 'pendiente_pago' },
      }),
      prisma.cli_clientes.count({
        where: { created_at: { gte: inicio, lte: fin } },
      }),
    ]);

    const productosStockBajo = Number(stockBajoRows[0]?.count ?? 0);
    const ventasTotales      = Number(ventasPeriodo._sum.total ?? 0);
    const ticketPromedio     = totalOrdenes > 0 ? ventasTotales / totalOrdenes : 0;
    const tasaConversion     = carritosCreados > 0 ? (totalOrdenes / carritosCreados) * 100 : 0;
    const tasaAbandono       = carritosCreados > 0
      ? ((carritosCreados - totalOrdenes) / carritosCreados) * 100
      : 0;

    return {
      ventas_totales:       ventasTotales,
      total_ordenes:        totalOrdenes,
      ticket_promedio:      ticketPromedio,
      tasa_conversion:      tasaConversion,
      tasa_abandono:        tasaAbandono,
      productos_agotados:   productosAgotados,
      productos_stock_bajo: productosStockBajo,
      clientes_nuevos:      clientesNuevos,
      ordenes_pendientes:   ordenesPendientes,
    };
  }

  // ── Ventas diarias ─────────────────────────────────────────────────────────
  // FIX: método renombrado a ventasDiarias() para coincidir con el frontend.
  // FIX: ::text en SUM y COUNT para evitar BigInt no serializable en JSON.

  async ventasDiarias(dias: number = 30) {
    const { inicio, fin } = obtenerRangoFechas(dias);

    const rows = await prisma.$queryRaw<
      { fecha: string; total: string; cantidad_ordenes: string }[]
    >`
      SELECT
        DATE(fecha_pedido)::text   AS fecha,
        COALESCE(SUM(total), 0)::text    AS total,
        COUNT(*)::text             AS cantidad_ordenes
      FROM ord_ordenes
      WHERE fecha_pedido >= ${inicio}
        AND fecha_pedido <= ${fin}
        AND estado NOT IN ('cancelada', 'devuelta')
      GROUP BY DATE(fecha_pedido)
      ORDER BY fecha ASC
    `;

    // Normalizar a números para que Recharts los acepte directamente
    return rows.map((r) => ({
      fecha:            r.fecha,
      total:            Number(r.total),
      cantidad_ordenes: Number(r.cantidad_ordenes),
    }));
  }

  // Alias para compatibilidad con código que use el nombre largo
  obtenerVentasDiarias = this.ventasDiarias;

  // ── Ventas por categoría ───────────────────────────────────────────────────
  // FIX: método renombrado a ventasPorCategoria().
  // FIX: ::text en SUM para evitar BigInt.

  async ventasPorCategoria(dias: number = 30) {
    const { inicio, fin } = obtenerRangoFechas(dias);

    const rows = await prisma.$queryRaw<
      { categoria: string; total: string }[]
    >`
      SELECT
        c.nombre                        AS categoria,
        COALESCE(SUM(oi.subtotal), 0)::text   AS total
      FROM ord_items_orden oi
      JOIN ord_ordenes o    ON oi.orden_id    = o.id
      JOIN cat_productos p  ON oi.producto_id = p.id
      JOIN cat_categorias c ON p.categoria_id = c.id
      WHERE o.fecha_pedido >= ${inicio}
        AND o.fecha_pedido <= ${fin}
        AND o.estado NOT IN ('cancelada', 'devuelta')
      GROUP BY c.nombre
      ORDER BY total DESC
      LIMIT 5
    `;

    return rows.map((r) => ({
      categoria: r.categoria,
      total:     Number(r.total),
    }));
  }

  obtenerVentasPorCategoria = this.ventasPorCategoria;

  // ── Top productos ──────────────────────────────────────────────────────────
  // FIX: método renombrado a topProductos().
  // FIX: ::text en SUM para evitar BigInt.

  async topProductos(dias: number = 30) {
    const { inicio, fin } = obtenerRangoFechas(dias);

    const rows = await prisma.$queryRaw<
      { nombre: string; cantidad_vendida: string }[]
    >`
      SELECT
        p.nombre,
        COALESCE(SUM(oi.cantidad), 0)::text AS cantidad_vendida
      FROM ord_items_orden oi
      JOIN ord_ordenes o   ON oi.orden_id    = o.id
      JOIN cat_productos p ON oi.producto_id = p.id
      WHERE o.fecha_pedido >= ${inicio}
        AND o.fecha_pedido <= ${fin}
        AND o.estado NOT IN ('cancelada', 'devuelta')
      GROUP BY p.id, p.nombre
      ORDER BY cantidad_vendida DESC
      LIMIT 10
    `;

    return rows.map((r) => ({
      nombre:           r.nombre,
      cantidad_vendida: Number(r.cantidad_vendida),
    }));
  }

  obtenerTopProductos = this.topProductos;
}

export const dashboardService = new DashboardService();