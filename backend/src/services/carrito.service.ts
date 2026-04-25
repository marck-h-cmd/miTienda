import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../middlewares/errorHandler';

export class CarritoService {
  async obtenerCarrito(usuarioId?: string, sessionId?: string) {
    let carrito;

    if (usuarioId) {
      carrito = await prisma.ord_carritos.findFirst({
        where: { usuario_id: usuarioId },
        include: {
          ord_items_carrito: {
            include: {
              cat_productos: {
                include: {
                  cat_imagenes_producto: { where: { es_principal: true }, take: 1 },
                  inv_stock_producto: true,
                },
              },
            },
          },
        },
      });
    } else if (sessionId) {
      carrito = await prisma.ord_carritos.findFirst({
        where: { session_id: sessionId },
        include: {
          ord_items_carrito: {
            include: {
              cat_productos: {
                include: {
                  cat_imagenes_producto: { where: { es_principal: true }, take: 1 },
                  inv_stock_producto: true,
                },
              },
            },
          },
        },
      });
    }

    // Si no existe, crear uno nuevo
    if (!carrito && (usuarioId || sessionId)) {
      carrito = await prisma.ord_carritos.create({
        data: {
          usuario_id: usuarioId,
          session_id: sessionId,
        },
        include: { ord_items_carrito: true },
      });
    }

    return carrito || { ord_items_carrito: [] };
  }

  async agregarItem(usuarioId: string | undefined, sessionId: string | undefined, producto_id: string, cantidad: number) {
    // Verificar producto y stock
    const producto = await prisma.cat_productos.findUnique({
      where: { id: producto_id },
      include: { inv_stock_producto: true },
    });

    if (!producto || !producto.activo) throw new NotFoundError('Producto no encontrado');
    if (!producto.inv_stock_producto.length || producto.inv_stock_producto[0].cantidad_fisica < cantidad) {
      throw new ConflictError('Stock insuficiente');
    }

    // Obtener o crear carrito
    let carrito = await prisma.ord_carritos.findFirst({
      where: usuarioId ? { usuario_id: usuarioId } : { session_id: sessionId },
    });

    if (!carrito) {
      carrito = await prisma.ord_carritos.create({
        data: { usuario_id: usuarioId, session_id: sessionId },
      });
    }

    // Validar si ya existe el item
    const itemExistente = await prisma.ord_items_carrito.findFirst({
      where: { carrito_id: carrito.id, producto_id },
    });

    if (itemExistente) {
      await prisma.ord_items_carrito.update({
        where: { id: itemExistente.id },
        data: { cantidad: itemExistente.cantidad + cantidad },
      });
    } else {
      await prisma.ord_items_carrito.create({
        data: {
          carrito_id: carrito.id,
          producto_id,
          cantidad,
          precio_unitario: producto.precio_oferta || producto.precio_venta,
        },
      });
    }

    return this.obtenerCarrito(usuarioId, sessionId);
  }

  async actualizarItem(itemId: string, cantidad: number) {
    if (cantidad <= 0) {
      await prisma.ord_items_carrito.delete({ where: { id: itemId } });
      return { mensaje: 'Item eliminado' };
    }

    return prisma.ord_items_carrito.update({
      where: { id: itemId },
      data: { cantidad },
    });
  }

  async eliminarItem(itemId: string) {
    await prisma.ord_items_carrito.delete({ where: { id: itemId } });
  }

  async vaciarCarrito(carritoId: string) {
    await prisma.ord_items_carrito.deleteMany({ where: { carrito_id: carritoId } });
  }

  async mergeCarrito(usuarioId: string, sessionId: string) {
    const carritoSesion = await prisma.ord_carritos.findFirst({
      where: { session_id: sessionId },
      include: { ord_items_carrito: true },
    });

    if (!carritoSesion || carritoSesion.ord_items_carrito.length === 0) return;

    const carritoUsuario = await prisma.ord_carritos.findFirst({
      where: { usuario_id: usuarioId },
    });

    if (!carritoUsuario) {
      await prisma.ord_carritos.update({
        where: { id: carritoSesion.id },
        data: { usuario_id: usuarioId, session_id: null },
      });
      return;
    }

    // Merge items
    for (const item of carritoSesion.ord_items_carrito) {
      const itemExistente = await prisma.ord_items_carrito.findFirst({
        where: { carrito_id: carritoUsuario.id, producto_id: item.producto_id },
      });

      if (itemExistente) {
        await prisma.ord_items_carrito.update({
          where: { id: itemExistente.id },
          data: { cantidad: itemExistente.cantidad + item.cantidad },
        });
      } else {
        await prisma.ord_items_carrito.create({
          data: {
            carrito_id: carritoUsuario.id,
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
          },
        });
      }
    }

    // Eliminar carrito de sesión
    await prisma.ord_carritos.delete({ where: { id: carritoSesion.id } });
  }
}

export const carritoService = new CarritoService();