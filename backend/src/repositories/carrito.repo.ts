import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class CarritoRepository {
  async findByUsuario(usuarioId: string) {
    return prisma.ord_carritos.findFirst({
      where: { usuario_id: usuarioId },
      include: this.includeItems(),
    });
  }

  async findBySession(sessionId: string) {
    return prisma.ord_carritos.findFirst({
      where: { session_id: sessionId },
      include: this.includeItems(),
    });
  }

  async create(data: { usuario_id?: string; session_id?: string }) {
    return prisma.ord_carritos.create({
      data,
      include: this.includeItems(),
    });
  }

  async addItem(data: { carrito_id: string; producto_id: string; cantidad: number; precio_unitario: number }) {
    return prisma.ord_items_carrito.create({ data });
  }

  async updateItem(id: string, data: { cantidad: number }) {
    return prisma.ord_items_carrito.update({ where: { id }, data });
  }

  async removeItem(id: string) {
    return prisma.ord_items_carrito.delete({ where: { id } });
  }

  async clearCart(carritoId: string) {
    return prisma.ord_items_carrito.deleteMany({ where: { carrito_id: carritoId } });
  }

  async findByUsuarioAndProducto(carritoId: string, productoId: string) {
    return prisma.ord_items_carrito.findFirst({
      where: { carrito_id: carritoId, producto_id: productoId },
    });
  }

  async deleteCarrito(id: string) {
    await this.clearCart(id);
    return prisma.ord_carritos.delete({ where: { id } });
  }

  private includeItems(): Prisma.ord_carritosInclude {
    return {
      ord_items_carrito: {
        include: {
          cat_productos: {
            include: {
              cat_imagenes_producto: { where: { es_principal: true }, take: 1 },
              inv_stock_producto: { select: { cantidad_fisica: true } },
            },
          },
        },
      },
    };
  }
}

export const carritoRepo = new CarritoRepository();