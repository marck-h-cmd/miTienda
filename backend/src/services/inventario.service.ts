import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../middlewares/errorHandler';
import { inventarioRepo } from '../repositories/inventario.repo';

export class InventarioService {
  async obtenerStock(filtros: any) {
    const { page = 1, limit = 20, stock_bajo } = filtros;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    if (stock_bajo === 'true') {
      const [rows, totalRows] = await Promise.all([
        prisma.$queryRaw<any[]>`
          SELECT
            s.id,
            s.producto_id,
            s.cantidad_fisica,
            s.cantidad_reservada,
            s.fecha_reserva,
            s.fecha_expiracion_reserva,
            s.updated_at,
            p.id as cat_id,
            p.sku,
            p.nombre,
            p.stock_minimo,
            p.precio_venta
          FROM inv_stock_producto s
          JOIN cat_productos p ON p.id = s.producto_id
          WHERE s.cantidad_fisica > 0
            AND s.cantidad_fisica <= p.stock_minimo
            AND p.estado = 'activo'
            AND p.activo = true
          ORDER BY p.nombre ASC
          LIMIT ${take} OFFSET ${skip}
        `,
        prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*)::bigint as count
          FROM inv_stock_producto s
          JOIN cat_productos p ON p.id = s.producto_id
          WHERE s.cantidad_fisica > 0
            AND s.cantidad_fisica <= p.stock_minimo
            AND p.estado = 'activo'
            AND p.activo = true
        `,
      ]);

      const stock = rows.map((r) => ({
        id: r.id,
        producto_id: r.producto_id,
        cantidad_fisica: Number(r.cantidad_fisica),
        cantidad_reservada: Number(r.cantidad_reservada),
        fecha_reserva: r.fecha_reserva,
        fecha_expiracion_reserva: r.fecha_expiracion_reserva,
        updated_at: r.updated_at,
        cat_productos: {
          id: r.cat_id,
          sku: r.sku,
          nombre: r.nombre,
          stock_minimo: Number(r.stock_minimo),
          precio_venta: r.precio_venta,
        },
      }));

      return {
        stock,
        total: Number(totalRows[0]?.count ?? 0),
        page: Number(page),
        limit: take,
      };
    }

    const [stock, total] = await Promise.all([
      inventarioRepo.findAllStock({ skip, take }),
      inventarioRepo.countStock(),
    ]);

    return { stock, total, page: Number(page), limit: take };
  }

  async obtenerStockPorProducto(productoId: string) {
    const stock = await inventarioRepo.findStockByProducto(productoId);
    if (!stock) throw new NotFoundError('Stock no encontrado');
    return stock;
  }

  async obtenerMovimientos(productoId: string, filtros: any) {
    const { page = 1, limit = 20 } = filtros;
    const skip = (Number(page) - 1) * Number(limit);

    const [movimientos, total] = await Promise.all([
      inventarioRepo.findMovimientos(productoId, { skip, take: Number(limit) }),
      inventarioRepo.countMovimientos(productoId),
    ]);

    return { movimientos, total, page: Number(page), limit: Number(limit) };
  }

  async ajustarStock(data: {
    producto_id: string;
    cantidad: number;
    tipo: string;
    motivo: string;
    usuario_id: string;
  }) {
    const stock = await inventarioRepo.findStockByProducto(data.producto_id);
    if (!stock) throw new NotFoundError('Stock no encontrado');

    const nuevaCantidad = data.tipo === 'positivo'
      ? stock.cantidad_fisica + data.cantidad
      : stock.cantidad_fisica - data.cantidad;

    if (nuevaCantidad < 0) throw new ConflictError('Stock insuficiente para el ajuste');

    await prisma.$transaction(async (tx) => {
      await tx.inv_stock_producto.update({
        where: { producto_id: data.producto_id },
        data: { cantidad_fisica: nuevaCantidad },
      });
      await tx.inv_movimientos_inventario.create({
        data: {
          producto_id: data.producto_id,
          tipo_movimiento: 'ajuste',
          cantidad: data.cantidad,
          motivo: data.motivo,
        },
      });
    });

    return { mensaje: 'Stock ajustado exitosamente', cantidad_actual: nuevaCantidad };
  }

  async crearAjusteInventario(data: {
    motivo: string;
    usuario_id: string;
    detalles: Array<{
      producto_id: string;
      cantidad: number;
      tipo: string;
    }>;
  }) {
    // Validar stock
    for (const detalle of data.detalles) {
      if (detalle.tipo === 'negativo') {
        const stock = await inventarioRepo.findStockByProducto(detalle.producto_id);
        if (!stock || stock.cantidad_fisica < detalle.cantidad) {
          throw new ConflictError(`Stock insuficiente para el producto ${detalle.producto_id}`);
        }
      }
    }

    const ajuste = await inventarioRepo.createAjuste(data);

    // Actualizar stock
    for (const detalle of data.detalles) {
      const stock = await inventarioRepo.findStockByProducto(detalle.producto_id);
      if (stock) {
        const nuevaCantidad = detalle.tipo === 'positivo'
          ? stock.cantidad_fisica + detalle.cantidad
          : stock.cantidad_fisica - detalle.cantidad;

        await inventarioRepo.updateStock(detalle.producto_id, { cantidad_fisica: nuevaCantidad });

        await inventarioRepo.createMovimiento({
          producto_id: detalle.producto_id,
          tipo_movimiento: 'ajuste',
          cantidad: detalle.cantidad,
          motivo: data.motivo,
          referencia_id: ajuste.id,
        });
      }
    }

    return ajuste;
  }

  async listarProveedores(filtros: any) {
    const { page = 1, limit = 20 } = filtros;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { activo: true };
    const [proveedores, total] = await Promise.all([
      inventarioRepo.findProveedores({ skip, take: Number(limit), where }),
      inventarioRepo.countProveedores(where),
    ]);

    return { proveedores, total, page: Number(page), limit: Number(limit) };
  }

  async crearProveedor(data: any) {
    return inventarioRepo.createProveedor(data);
  }

  async actualizarProveedor(id: string, data: any) {
    return inventarioRepo.updateProveedor(id, data);
  }

  async eliminarProveedor(id: string) {
    return inventarioRepo.updateProveedor(id, { activo: false });
  }

  async crearOrdenCompra(data: {
    proveedor_id: string;
    detalles: Array<{
      producto_id: string;
      cantidad: number;
      precio_unitario: number;
    }>;
  }) {
    const total = data.detalles.reduce((sum, d) => sum + d.cantidad * d.precio_unitario, 0);

    return inventarioRepo.createOrdenCompra({
      proveedor_id: data.proveedor_id,
      total,
      detalles: data.detalles.map((d) => ({ ...d, subtotal: d.cantidad * d.precio_unitario })),
    });
  }

  async listarOrdenesCompra(filtros: any) {
    const { page = 1, limit = 20 } = filtros;
    const skip = (Number(page) - 1) * Number(limit);

    const [ordenes, total] = await Promise.all([
      inventarioRepo.findOrdenesCompra({ skip, take: Number(limit) }),
      inventarioRepo.countOrdenesCompra(),
    ]);

    return { ordenes, total, page: Number(page), limit: Number(limit) };
  }

  async recibirOrdenCompra(ordenCompraId: string, usuarioId: string) {
    const ordenCompra = await inventarioRepo.findOrdenCompraById(ordenCompraId);
    if (!ordenCompra) throw new NotFoundError('Orden de compra no encontrada');
    if (ordenCompra.estado !== 'pendiente') throw new ConflictError('La orden ya fue recibida');

    await prisma.$transaction(async (tx) => {
      // Actualizar stock por cada item
      for (const detalle of ordenCompra.inv_detalle_orden_compra) {
        const stock = await tx.inv_stock_producto.findUnique({
          where: { producto_id: detalle.producto_id },
        });

        if (stock) {
          await tx.inv_stock_producto.update({
            where: { producto_id: detalle.producto_id },
            data: { cantidad_fisica: { increment: detalle.cantidad } },
          });
        } else {
          await tx.inv_stock_producto.create({
            data: {
              producto_id: detalle.producto_id,
              cantidad_fisica: detalle.cantidad,
            },
          });
        }

        await tx.inv_movimientos_inventario.create({
          data: {
            producto_id: detalle.producto_id,
            tipo_movimiento: 'entrada',
            cantidad: detalle.cantidad,
            motivo: `Recepción orden compra #${ordenCompraId}`,
            referencia_id: ordenCompraId,
          },
        });
      }

      // Actualizar estado de la orden
      await tx.inv_ordenes_compra.update({
        where: { id: ordenCompraId },
        data: { estado: 'recibida', updated_at: new Date() },
      });

      // Crear recepción
      await tx.inv_recepciones.create({
        data: { orden_compra_id: ordenCompraId, estado: 'completa' },
      });
    });

    return { mensaje: 'Recepción registrada exitosamente' };
  }

  async productosStockBajo() {
    return inventarioRepo.findAllStock({
      where: {
        cat_productos: { estado: 'activo' },
      },
    });
  }
}

export const inventarioService = new InventarioService();
