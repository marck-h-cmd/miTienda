import prisma from '../config/database';

export class EstadisticasService {
  async tendenciaVentasMensuales(meses: number = 12) {
    const ventas = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', fecha_pedido) as mes,
        SUM(total) as total,
        COUNT(*) as cantidad_ordenes
      FROM ord_ordenes
      WHERE fecha_pedido >= NOW() - INTERVAL '${meses} months'
        AND estado NOT IN ('cancelada', 'devuelta')
      GROUP BY DATE_TRUNC('month', fecha_pedido)
      ORDER BY mes
    `;
    return ventas;
  }

  async analisisABC() {
    const productos = await prisma.$queryRaw`
      SELECT 
        p.id,
        p.nombre,
        SUM(oi.subtotal) as ingreso_total,
        SUM(oi.subtotal) * 100.0 / SUM(SUM(oi.subtotal)) OVER () as porcentaje
      FROM ord_items_orden oi
      JOIN ord_ordenes o ON oi.orden_id = o.id
      JOIN cat_productos p ON oi.producto_id = p.id
      WHERE o.estado NOT IN ('cancelada', 'devuelta')
      GROUP BY p.id, p.nombre
      ORDER BY ingreso_total DESC
    `;
    return productos;
  }

  async analisisRFM() {
    const clientes = await prisma.$queryRaw`
      SELECT 
        c.id,
        c.nombre || ' ' || c.apellido as cliente,
        MAX(o.fecha_pedido) as ultima_compra,
        COUNT(o.id) as frecuencia,
        SUM(o.total) as valor_monetario
      FROM cli_clientes c
      JOIN ord_ordenes o ON o.cliente_id = c.id
      WHERE o.estado NOT IN ('cancelada', 'devuelta')
      GROUP BY c.id, c.nombre, c.apellido
    `;
    return clientes;
  }
}

export const estadisticasService = new EstadisticasService();