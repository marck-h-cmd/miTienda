import prisma from '../config/database';

export class InventarioRepository {
  async findStockByProducto(productoId: string) {
    return prisma.inv_stock_producto.findUnique({
      where: { producto_id: productoId },
      include: { cat_productos: { select: { nombre: true, sku: true } } },
    });
  }

  async findAllStock(options: { skip?: number; take?: number; where?: any }) {
    return prisma.inv_stock_producto.findMany({
      ...options,
      include: {
        cat_productos: {
          select: { id: true, sku: true, nombre: true, stock_minimo: true, precio_venta: true },
        },
      },
    });
  }

  async countStock(where?: any) {
    return prisma.inv_stock_producto.count({ where });
  }

  async updateStock(productoId: string, data: { cantidad_fisica?: number; cantidad_reservada?: number }) {
    return prisma.inv_stock_producto.update({
      where: { producto_id: productoId },
      data,
    });
  }

  async createMovimiento(data: {
    producto_id: string;
    tipo_movimiento: string;
    cantidad: number;
    motivo: string;
    referencia_id?: string;
  }) {
    return prisma.inv_movimientos_inventario.create({ data });
  }

  async findMovimientos(productoId: string, options: { skip?: number; take?: number }) {
    return prisma.inv_movimientos_inventario.findMany({
      where: { producto_id: productoId },
      skip: options.skip,
      take: options.take,
      orderBy: { fecha_movimiento: 'desc' },
    });
  }

  async countMovimientos(productoId: string) {
    return prisma.inv_movimientos_inventario.count({ where: { producto_id: productoId } });
  }

  async createAjuste(data: any) {
    return prisma.inv_ajustes.create({
      data: {
        motivo: data.motivo,
        usuario_id: data.usuario_id,
        inv_detalle_ajuste: {
          create: data.detalles,
        },
      },
      include: { inv_detalle_ajuste: true },
    });
  }

  async findProveedores(options: { skip?: number; take?: number; where?: any }) {
    return prisma.inv_proveedores.findMany({
      ...options,
      orderBy: { nombre: 'asc' },
    });
  }

  async countProveedores(where?: any) {
    return prisma.inv_proveedores.count({ where });
  }

  async createProveedor(data: any) {
    return prisma.inv_proveedores.create({ data });
  }

  async updateProveedor(id: string, data: any) {
    return prisma.inv_proveedores.update({ where: { id }, data });
  }

  async createOrdenCompra(data: any) {
    return prisma.inv_ordenes_compra.create({
      data: {
        proveedor_id: data.proveedor_id,
        total: data.total,
        inv_detalle_orden_compra: {
          create: data.detalles,
        },
      },
      include: { inv_detalle_orden_compra: true },
    });
  }

  async findOrdenesCompra(options: { skip?: number; take?: number }) {
    return prisma.inv_ordenes_compra.findMany({
      ...options,
      include: {
        inv_proveedores: true,
        inv_detalle_orden_compra: true,
      },
      orderBy: { fecha_orden: 'desc' },
    });
  }

  async countOrdenesCompra() {
    return prisma.inv_ordenes_compra.count();
  }

  async findOrdenCompraById(id: string) {
    return prisma.inv_ordenes_compra.findUnique({
      where: { id },
      include: { inv_detalle_orden_compra: true },
    });
  }

  async createRecepcion(data: any) {
    return prisma.inv_recepciones.create({ data });
  }
}

export const inventarioRepo = new InventarioRepository();