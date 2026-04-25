import { emailService } from './email.service';
import PDFDocument from 'pdfkit';
import prisma from '../config/database';
import { config } from '../config';
import { formatearFecha, formatearFechaHora } from '../utils/dateHelpers';
import { NotFoundError } from '../middlewares/errorHandler';
import { generarPDFGestion } from '../utils/pdfGestion';

export class ReporteService {
  // ============================================
  // REPORTES OPERACIONALES (PDFKit)
  // ============================================

  private crearDocumentoBase(): PDFKit.PDFDocument {
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      info: {
        Title: 'Reporte',
        Author: config.empresa.nombre,
        Creator: 'Sistema de E-Commerce',
      },
    });

    // Encabezado
    doc.fontSize(10)
       .text(config.empresa.nombre, { align: 'center' })
       .text(`RUC: ${config.empresa.ruc}`, { align: 'center' })
       .text(config.empresa.direccion, { align: 'center' })
       .moveDown();

    return doc;
  }

  private agregarPiePagina(doc: PDFKit.PDFDocument) {
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8)
         .text(
           `Generado: ${formatearFechaHora(new Date())} | Página ${i + 1} de ${totalPages}`,
           50,
           doc.page.height - 50,
           { align: 'center' }
         );
    }
  }

  async generarReporteOrdenes(filtros: { fecha_inicio?: string; fecha_fin?: string; estado?: string }) {
    const where: any = {};
    if (filtros.fecha_inicio) where.fecha_pedido = { gte: new Date(filtros.fecha_inicio) };
    if (filtros.fecha_fin) where.fecha_pedido = { ...where.fecha_pedido, lte: new Date(filtros.fecha_fin) };
    if (filtros.estado) where.estado = filtros.estado;

    const ordenes = await prisma.ord_ordenes.findMany({
      where,
      include: {
        seg_usuarios: { select: { nombre: true, apellido: true, email: true } },
        ord_items_orden: { include: { cat_productos: { select: { nombre: true } } } },
        ord_historial_estados: { orderBy: { fecha_cambio: 'desc' }, take: 1 },
      },
      orderBy: { fecha_pedido: 'desc' },
    });

    const doc = this.crearDocumentoBase();
    
    doc.fontSize(16).text('REPORTE DE ÓRDENES', { align: 'center' }).moveDown();
    doc.fontSize(10).text(`Fecha: ${formatearFecha(new Date())}`).moveDown();

    // Tabla de órdenes
    doc.fontSize(9);
    ordenes.forEach((orden, index) => {
      if (index > 0) doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text(`Orden #${orden.id.slice(0, 8)}`);
      doc.font('Helvetica')
         .text(`Cliente: ${orden.seg_usuarios.nombre} ${orden.seg_usuarios.apellido}`)
         .text(`Email: ${orden.seg_usuarios.email}`)
         .text(`Total: ${config.negocio.monedaDefecto} ${Number(orden.total).toFixed(2)}`)
         .text(`Estado: ${orden.estado}`)
         .text(`Items: ${orden.ord_items_orden.length} | Fecha: ${formatearFecha(orden.fecha_pedido)}`);
      
      doc.moveDown(0.3).text('---', { align: 'center' });
    });

    this.agregarPiePagina(doc);
    return doc;
  }

  async generarReporteInventarioValorizado() {
    const stock = await prisma.inv_stock_producto.findMany({
      include: {
        cat_productos: {
          select: { nombre: true, sku: true, precio_costo: true, precio_venta: true },
        },
      },
    });

    const doc = this.crearDocumentoBase();
    doc.fontSize(16).text('INVENTARIO VALORIZADO', { align: 'center' }).moveDown();

    let totalCosto = 0;
    let totalVenta = 0;

    stock.forEach((item) => {
      const costoTotal = Number(item.cat_productos.precio_costo) * item.cantidad_fisica;
      const ventaTotal = Number(item.cat_productos.precio_venta) * item.cantidad_fisica;
      totalCosto += costoTotal;
      totalVenta += ventaTotal;

      doc.fontSize(9)
         .text(`${item.cat_productos.sku} - ${item.cat_productos.nombre}`)
         .text(`Stock: ${item.cantidad_fisica} | Costo: ${config.negocio.monedaDefecto} ${costoTotal.toFixed(2)} | Venta: ${config.negocio.monedaDefecto} ${ventaTotal.toFixed(2)}`);
      doc.moveDown(0.3);
    });

    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text(`TOTAL COSTO: ${config.negocio.monedaDefecto} ${totalCosto.toFixed(2)}`);
    doc.text(`TOTAL VENTA: ${config.negocio.monedaDefecto} ${totalVenta.toFixed(2)}`);
    doc.text(`MARGEN: ${config.negocio.monedaDefecto} ${(totalVenta - totalCosto).toFixed(2)}`);

    this.agregarPiePagina(doc);
    return doc;
  }

  async generarReporteMovimientos(filtros: { fecha_inicio?: string; fecha_fin?: string }) {
    const where: any = {};
    if (filtros.fecha_inicio) where.fecha_movimiento = { gte: new Date(filtros.fecha_inicio) };
    if (filtros.fecha_fin) where.fecha_movimiento = { ...where.fecha_movimiento, lte: new Date(filtros.fecha_fin) };

    const movimientos = await prisma.inv_movimientos_inventario.findMany({
      where,
      include: {
        cat_productos: { select: { nombre: true, sku: true } },
      },
      orderBy: { fecha_movimiento: 'desc' },
    });

    const doc = this.crearDocumentoBase();
    doc.fontSize(16).text('MOVIMIENTOS DE INVENTARIO', { align: 'center' }).moveDown();

    movimientos.forEach((mov) => {
      doc.fontSize(9)
         .font('Helvetica-Bold').text(`${mov.cat_productos.sku} - ${mov.cat_productos.nombre}`)
         .font('Helvetica')
         .text(`Tipo: ${mov.tipo_movimiento} | Cantidad: ${mov.cantidad} | Motivo: ${mov.motivo}`)
         .text(`Fecha: ${formatearFechaHora(mov.fecha_movimiento)}`);
      doc.moveDown(0.3);
    });

    this.agregarPiePagina(doc);
    return doc;
  }

  async generarReporteStockBajo() {
    const stock = await prisma.inv_stock_producto.findMany({
      where: {
        cantidad_fisica: { gt: 0 },
        cat_productos: { estado: 'activo', activo: true },
      },
      include: {
        cat_productos: {
          select: { nombre: true, sku: true, stock_minimo: true, precio_venta: true },
        },
      },
    });

    const productos = stock.filter((item) => item.cantidad_fisica <= item.cat_productos.stock_minimo);

    const doc = this.crearDocumentoBase();
    doc.fontSize(16).text('PRODUCTOS CON STOCK BAJO', { align: 'center' }).moveDown();

    productos.forEach((item) => {
      doc.fontSize(9)
         .text(`${item.cat_productos.sku} - ${item.cat_productos.nombre}`)
         .text(`Stock Actual: ${item.cantidad_fisica} | Stock Mínimo: ${item.cat_productos.stock_minimo} | Diferencia: ${item.cat_productos.stock_minimo - item.cantidad_fisica}`);
      doc.moveDown(0.3);
    });

    this.agregarPiePagina(doc);
    return doc;
  }

  async generarReportePagos(filtros: { fecha_inicio?: string; fecha_fin?: string }) {
    const where: any = {};
    if (filtros.fecha_inicio) where.fecha_creacion = { gte: new Date(filtros.fecha_inicio) };
    if (filtros.fecha_fin) where.fecha_creacion = { ...where.fecha_creacion, lte: new Date(filtros.fecha_fin) };

    const pagos = await prisma.ord_transacciones_pago.findMany({
      where,
      include: {
        ord_ordenes: {
          include: {
            seg_usuarios: { select: { nombre: true, apellido: true } },
          },
        },
      },
      orderBy: { fecha_creacion: 'desc' },
    });

    const doc = this.crearDocumentoBase();
    doc.fontSize(16).text('REPORTE DE PAGOS', { align: 'center' }).moveDown();

    let totalPagos = 0;

    pagos.forEach((pago) => {
      totalPagos += Number(pago.monto);
      doc.fontSize(9)
         .text(`Pago ID: ${pago.id.slice(0, 8)} | Estado: ${pago.estado}`)
         .text(`Monto: ${pago.moneda} ${Number(pago.monto).toFixed(2)} | Método: ${pago.tipo_pago}`)
         .text(`Fecha: ${formatearFechaHora(pago.fecha_creacion)}`);
      doc.moveDown(0.3);
    });

    doc.moveDown();
    doc.font('Helvetica-Bold').text(`TOTAL: ${config.negocio.monedaDefecto} ${totalPagos.toFixed(2)}`);

    this.agregarPiePagina(doc);
    return doc;
  }

  async generarReporteDevoluciones(filtros: { fecha_inicio?: string; fecha_fin?: string }) {
    const where: any = { estado: 'devuelta' };
    if (filtros.fecha_inicio) where.fecha_pedido = { gte: new Date(filtros.fecha_inicio) };
    if (filtros.fecha_fin) where.fecha_pedido = { ...where.fecha_pedido, lte: new Date(filtros.fecha_fin) };

    const devoluciones = await prisma.ord_ordenes.findMany({
      where,
      include: {
        seg_usuarios: { select: { nombre: true, apellido: true } },
        ord_items_orden: true,
      },
      orderBy: { fecha_actualizacion: 'desc' },
    });

    const doc = this.crearDocumentoBase();
    doc.fontSize(16).text('REPORTE DE DEVOLUCIONES', { align: 'center' }).moveDown();

    devoluciones.forEach((dev) => {
      doc.fontSize(9)
         .text(`Orden: ${dev.id.slice(0, 8)} | Cliente: ${dev.seg_usuarios.nombre}`)
         .text(`Total: ${config.negocio.monedaDefecto} ${Number(dev.total).toFixed(2)}`)
         .text(`Fecha Devolución: ${formatearFecha(dev.fecha_actualizacion)}`);
      doc.moveDown(0.3);
    });

    this.agregarPiePagina(doc);
    return doc;
  }

  async generarFacturaOrden(ordenId: string) {
    const orden = await prisma.ord_ordenes.findUnique({
      where: { id: ordenId },
      include: {
        seg_usuarios: { select: { nombre: true, apellido: true, email: true } },
        ord_items_orden: { include: { cat_productos: { select: { nombre: true, sku: true } } } },
        ord_direcciones_envio: true,
      },
    });

    if (!orden) throw new NotFoundError('Orden no encontrada');

    const doc = this.crearDocumentoBase();
    
    doc.fontSize(18).text('FACTURA', { align: 'center' }).moveDown();
    doc.fontSize(10)
       .text(`Factura N°: ${orden.id.slice(0, 8).toUpperCase()}`)
       .text(`Fecha: ${formatearFecha(orden.fecha_pedido)}`)
       .text(`Cliente: ${orden.seg_usuarios.nombre} ${orden.seg_usuarios.apellido}`)
       .text(`Email: ${orden.seg_usuarios.email}`)
       .moveDown();

    // Items
    doc.font('Helvetica-Bold').text('Producto          Cant.    P.Unit.    Subtotal');
    doc.font('Helvetica');
    
    orden.ord_items_orden.forEach((item) => {
      doc.text(`${item.cat_productos.nombre.substring(0, 20).padEnd(20)} ${String(item.cantidad).padStart(5)} ${Number(item.precio_unitario).toFixed(2).padStart(8)} ${Number(item.subtotal).toFixed(2).padStart(10)}`);
    });

    doc.moveDown();
    doc.font('Helvetica-Bold');
    doc.text(`Subtotal: ${config.negocio.monedaDefecto} ${Number(orden.subtotal).toFixed(2)}`);
    doc.text(`Descuento: ${config.negocio.monedaDefecto} ${Number(orden.descuento).toFixed(2)}`);
    doc.text(`IGV: ${config.negocio.monedaDefecto} ${Number(orden.impuesto).toFixed(2)}`);
    doc.text(`Envío: ${config.negocio.monedaDefecto} ${Number(orden.costo_envio).toFixed(2)}`);
    doc.fontSize(12).text(`TOTAL: ${orden.moneda} ${Number(orden.total).toFixed(2)}`);

    this.agregarPiePagina(doc);
    return doc;
  }

  // ============================================
  // REPORTES DE GESTIÓN (PDFKit básicos)
  // ============================================

  async generarReporteGestionRentabilidad() {
    const productos = await prisma.$queryRaw<any[]>`
      SELECT 
        p.nombre, p.sku,
        p.precio_costo, p.precio_venta,
        COALESCE(SUM(oi.cantidad), 0) as unidades_vendidas,
        COALESCE(SUM(oi.subtotal), 0) as ingresos,
        (COALESCE(SUM(oi.subtotal), 0) - (p.precio_costo * COALESCE(SUM(oi.cantidad), 0))) as margen
      FROM cat_productos p
      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id
      LEFT JOIN ord_ordenes o ON oi.orden_id = o.id AND o.estado NOT IN ('cancelada', 'devuelta')
      GROUP BY p.id, p.nombre, p.sku, p.precio_costo, p.precio_venta
      ORDER BY ingresos DESC
    `;

    const doc = this.crearDocumentoBase();
    doc.fontSize(16).text('RENTABILIDAD POR PRODUCTO', { align: 'center' }).moveDown();

    productos.forEach((p: any) => {
      doc.fontSize(9)
         .text(`${p.sku} - ${p.nombre}`)
         .text(`Vendidos: ${p.unidades_vendidas} | Ingresos: ${config.negocio.monedaDefecto} ${Number(p.ingresos).toFixed(2)}`)
         .text(`Margen: ${config.negocio.monedaDefecto} ${Number(p.margen).toFixed(2)}`);
      doc.moveDown(0.3);
    });

    this.agregarPiePagina(doc);
    return doc;
  }

  async generarReporteGestionVentasCategoria() {
    const ventas = await prisma.$queryRaw<any[]>`
      SELECT 
        c.nombre as categoria,
        COUNT(DISTINCT o.id) as total_ordenes,
        COALESCE(SUM(o.total), 0) as total_ventas
      FROM cat_categorias c
      JOIN cat_productos p ON p.categoria_id = c.id
      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id
      LEFT JOIN ord_ordenes o ON oi.orden_id = o.id AND o.estado NOT IN ('cancelada', 'devuelta')
      GROUP BY c.id, c.nombre
      ORDER BY total_ventas DESC
    `;

    const doc = this.crearDocumentoBase();
    doc.fontSize(16).text('VENTAS POR CATEGORÍA', { align: 'center' }).moveDown();

    ventas.forEach((v: any) => {
      doc.fontSize(10)
         .text(`${v.categoria}: ${config.negocio.monedaDefecto} ${Number(v.total_ventas).toFixed(2)} (${v.total_ordenes} órdenes)`);
    });

    this.agregarPiePagina(doc);
    return doc;
  }

  async generarReporteGestionClientes() {
    const clientes = await prisma.$queryRaw<any[]>`
      SELECT 
        c.nombre, c.apellido, c.email,
        COUNT(o.id) as total_compras,
        COALESCE(SUM(o.total), 0) as total_gastado,
        MAX(o.fecha_pedido) as ultima_compra
      FROM cli_clientes c
      LEFT JOIN ord_ordenes o ON o.cliente_id = c.id AND o.estado NOT IN ('cancelada', 'devuelta')
      GROUP BY c.id, c.nombre, c.apellido, c.email
      ORDER BY total_gastado DESC
    `;

    const doc = this.crearDocumentoBase();
    doc.fontSize(16).text('ANÁLISIS DE CLIENTES', { align: 'center' }).moveDown();

    clientes.forEach((c: any) => {
      doc.fontSize(9)
         .text(`${c.nombre} ${c.apellido} (${c.email})`)
         .text(`Compras: ${c.total_compras} | Total: ${config.negocio.monedaDefecto} ${Number(c.total_gastado).toFixed(2)} | Última: ${c.ultima_compra ? formatearFecha(new Date(c.ultima_compra)) : 'N/A'}`);
      doc.moveDown(0.3);
    });

    this.agregarPiePagina(doc);
    return doc;
  }

  async generarReporteGestionRotacionInventario() {
    const rotacion = await prisma.$queryRaw<any[]>`
      SELECT 
        p.nombre, p.sku,
        COALESCE(s.cantidad_fisica, 0) as stock_actual,
        COALESCE(SUM(oi.cantidad), 0) as total_vendido
      FROM cat_productos p
      LEFT JOIN inv_stock_producto s ON s.producto_id = p.id
      LEFT JOIN ord_items_orden oi ON oi.producto_id = p.id
      LEFT JOIN ord_ordenes o ON oi.orden_id = o.id AND o.estado NOT IN ('cancelada', 'devuelta')
      GROUP BY p.id, p.nombre, p.sku, s.cantidad_fisica
      ORDER BY total_vendido DESC
    `;

    const doc = this.crearDocumentoBase();
    doc.fontSize(16).text('ROTACIÓN DE INVENTARIO', { align: 'center' }).moveDown();

    rotacion.forEach((r: any) => {
      const rot = Number(r.stock_actual) > 0 ? Number(r.total_vendido) / Number(r.stock_actual) : 0;
      doc.fontSize(9)
         .text(`${r.sku} - ${r.nombre}`)
         .text(`Stock: ${r.stock_actual} | Vendido: ${r.total_vendido} | Rotación: ${rot.toFixed(2)}`);
      doc.moveDown(0.3);
    });

    this.agregarPiePagina(doc);
    return doc;
  }

  // ============================================
  // REPORTES DE GESTIÓN AVANZADOS (Puppeteer)
  // ============================================

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
