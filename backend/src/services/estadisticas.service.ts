import prisma from '../config/database';

export class EstadisticasService {

  // ── Tendencia de Ventas Mensuales ──────────────────────────────────────────
  // FIX: usar $queryRawUnsafe con parámetro seguro + devolver mes como string ISO
  async tendenciaVentasMensuales(meses: number = 12) {
    // Validar que meses sea un número entero positivo para evitar inyección
    const mesesSeguro = Math.max(1, Math.min(60, Math.floor(Number(meses) || 12)));

    const ventas = await prisma.$queryRawUnsafe<
      { mes: string; total: string; cantidad_ordenes: string }[]
    >(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', fecha_pedido), 'YYYY-MM') AS mes,
        COALESCE(SUM(total), 0)::text                         AS total,
        COUNT(*)::text                                        AS cantidad_ordenes
      FROM ord_ordenes
      WHERE fecha_pedido >= NOW() - INTERVAL '${mesesSeguro} months'
        AND estado NOT IN ('cancelada', 'devuelta')
      GROUP BY DATE_TRUNC('month', fecha_pedido)
      ORDER BY mes ASC
    `);

    // Normalizar tipos aquí para que el frontend reciba números, no strings de Prisma
    return ventas.map((row) => ({
      mes: row.mes,                          // "2024-01" — seguro para new Date()
      total: Number(row.total),
      cantidad_ordenes: Number(row.cantidad_ordenes),
    }));
  }

  // ── Análisis ABC ───────────────────────────────────────────────────────────
  // FIX: calcular porcentaje ACUMULADO en JS para clasificar A/B/C correctamente
  async analisisABC() {
    const productos = await prisma.$queryRawUnsafe<
      { id: string; nombre: string; ingreso_total: string }[]
    >(`
      SELECT
        p.id,
        p.nombre,
        COALESCE(SUM(oi.subtotal), 0)::text AS ingreso_total
      FROM cat_productos p
      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id
      LEFT JOIN ord_ordenes o      ON oi.orden_id = o.id
        AND o.estado NOT IN ('cancelada', 'devuelta')
      GROUP BY p.id, p.nombre
      HAVING COALESCE(SUM(oi.subtotal), 0) > 0
      ORDER BY ingreso_total DESC
    `);

    const total = productos.reduce((s, p) => s + Number(p.ingreso_total), 0);

    let acumulado = 0;
    return productos.map((p) => {
      const ingreso = Number(p.ingreso_total);
      const porcentajeIndividual = total > 0 ? (ingreso / total) * 100 : 0;
      acumulado += porcentajeIndividual;

      // Clasificación ABC estándar por porcentaje acumulado
      const categoria = acumulado <= 70 ? 'A' : acumulado <= 90 ? 'B' : 'C';

      return {
        id: p.id,
        nombre: p.nombre,
        ingreso_total: ingreso,
        porcentaje: porcentajeIndividual,
        porcentaje_acumulado: acumulado,
        categoria,
      };
    });
  }

  // ── Análisis RFM ───────────────────────────────────────────────────────────
  // FIX: manejar ultima_compra NULL, castear tipos, quitar HAVING que filtra
  async analisisRFM() {
    const clientes = await prisma.$queryRawUnsafe<
      {
        id: string;
        cliente: string;
        ultima_compra: string | null;
        frecuencia: string;
        valor_monetario: string;
      }[]
    >(`
      SELECT
        u.id,
        u.nombre || ' ' || u.apellido                              AS cliente,
        MAX(o.fecha_pedido)::text                                  AS ultima_compra,
        COUNT(o.id)::text                                          AS frecuencia,
        COALESCE(SUM(o.total), 0)::text                            AS valor_monetario
      FROM seg_usuarios u
      INNER JOIN ord_ordenes o ON o.cliente_id = u.id
        AND o.estado NOT IN ('cancelada', 'devuelta')
      GROUP BY u.id, u.nombre, u.apellido
      ORDER BY valor_monetario DESC
    `);

    return clientes.map((c) => ({
      id: c.id,
      cliente: c.cliente,
      // FIX: ultima_compra puede ser null — usar string vacío como fallback
      ultima_compra: c.ultima_compra ?? null,
      frecuencia: Number(c.frecuencia),
      valor_monetario: Number(c.valor_monetario),
    }));
  }

  // ── Verificar Datos ────────────────────────────────────────────────────────
  async verificarDatos() {
    const totalOrdenes    = await prisma.ord_ordenes.count();
    const ordenesPagadas  = await prisma.ord_ordenes.count({ where: { estado: 'pagada' } });
    const ordenesConEstado = await prisma.ord_ordenes.groupBy({
      by: ['estado'],
      _count: true,
    });

    return { totalOrdenes, ordenesPagadas, estados: ordenesConEstado };
  }
}

export const estadisticasService = new EstadisticasService();