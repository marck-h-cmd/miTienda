import prisma from '../config/database';
import { obtenerRangoFechas } from '../utils/dateHelpers';

export class DashboardService {
  async obtenerKPIs(dias: number = 30) {
    const { inicio, fin } = obtenerRangoFechas(dias);

    const [
      ventasPeriodo,
      totalOrdenes,
      carritosCreados,
      productosAgotados,
      productosStockBajo,
      ordenesPendientes,
      clientesNuevos,
    ] = await Promise.all([
      // Ventas totales
      prisma.ord_ordenes.aggregate({
        where: { fecha_pedido: { gte: inicio, lte: fin }, estado: { notIn: ['cancelada', 'devuelta'] } },
        _sum: { total: true },
      }),
      // Total órdenes
      prisma.ord_ordenes.count({
        where: { fecha_pedido: { gte: inicio, lte: fin } },
      }),
      // Carritos creados
      prisma.ord_carritos.count({
        where: { created_at: { gte: inicio, lte: fin } },
      }),
      // Productos agotados
      prisma.inv_stock_producto.count({
        where: { cantidad_fisica: 0 },
      }),
      // Stock bajo
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint as count
        FROM inv_stock_producto s
        JOIN cat_productos p ON p.id = s.producto_id
        WHERE s.cantidad_fisica > 0
          AND s.cantidad_fisica <= p.stock_minimo
          AND p.estado = 'activo'
          AND p.activo = true
      `.then((rows) => Number(rows[0]?.count ?? 0)),
      // Órdenes pendientes
      prisma.ord_ordenes.count({
        where: { estado: 'pendiente_pago' },
      }),
      // Clientes nuevos
      prisma.cli_clientes.count({
        where: { created_at: { gte: inicio, lte: fin } },
      }),
    ]);

    const ventasTotales = ventasPeriodo._sum.total || 0;
    const ticketPromedio = totalOrdenes > 0 ? Number(ventasTotales) / totalOrdenes : 0;
    const tasaConversion = carritosCreados > 0 ? (totalOrdenes / carritosCreados) * 100 : 0;
    const tasaAbandono = carritosCreados > 0 ? ((carritosCreados - totalOrdenes) / carritosCreados) * 100 : 0;

    return {
      ventas_totales: Number(ventasTotales),
      total_ordenes: totalOrdenes,
      ticket_promedio: ticketPromedio,
      tasa_conversion: tasaConversion,
      tasa_abandono: tasaAbandono,
      productos_agotados: productosAgotados,
      productos_stock_bajo: productosStockBajo,
      clientes_nuevos: clientesNuevos,
      ordenes_pendientes: ordenesPendientes,
    };
  }

  async obtenerVentasDiarias(dias: number = 30) {
    const { inicio, fin } = obtenerRangoFechas(dias);

    const ventas = await prisma.$queryRaw`
      SELECT 
        DATE(fecha_pedido) as fecha,
        SUM(total) as total,
        COUNT(*) as cantidad_ordenes
      FROM ord_ordenes
      WHERE fecha_pedido >= ${inicio}
        AND fecha_pedido <= ${fin}
        AND estado NOT IN ('cancelada', 'devuelta')
      GROUP BY DATE(fecha_pedido)
      ORDER BY fecha
    `;

    return ventas;
  }

  async obtenerVentasPorCategoria(dias: number = 30) {
    const { inicio, fin } = obtenerRangoFechas(dias);

    const ventas = await prisma.$queryRaw`
      SELECT 
        c.nombre as categoria,
        SUM(oi.subtotal) as total
      FROM ord_items_orden oi
      JOIN ord_ordenes o ON oi.orden_id = o.id
      JOIN cat_productos p ON oi.producto_id = p.id
      JOIN cat_categorias c ON p.categoria_id = c.id
      WHERE o.fecha_pedido >= ${inicio}
        AND o.fecha_pedido <= ${fin}
        AND o.estado NOT IN ('cancelada', 'devuelta')
      GROUP BY c.nombre
      ORDER BY total DESC
      LIMIT 5
    `;

    return ventas;
  }

  async obtenerTopProductos(dias: number = 30) {
    const { inicio, fin } = obtenerRangoFechas(dias);

    const productos = await prisma.$queryRaw`
      SELECT 
        p.nombre,
        SUM(oi.cantidad) as cantidad_vendida
      FROM ord_items_orden oi
      JOIN ord_ordenes o ON oi.orden_id = o.id
      JOIN cat_productos p ON oi.producto_id = p.id
      WHERE o.fecha_pedido >= ${inicio}
        AND o.fecha_pedido <= ${fin}
        AND o.estado NOT IN ('cancelada', 'devuelta')
      GROUP BY p.id, p.nombre
      ORDER BY cantidad_vendida DESC
      LIMIT 10
    `;

    return productos;
  }
}

export const dashboardService = new DashboardService();
