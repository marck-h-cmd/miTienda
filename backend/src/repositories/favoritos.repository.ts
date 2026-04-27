import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class FavoritosRepository {
  async findByUsuario(usuarioId: string) {
    return prisma.cli_lista_deseos.findUnique({
      where: { usuario_id: usuarioId },
      include: this.includeItems(),
    });
  }

  async create(usuarioId: string) {
    return prisma.cli_lista_deseos.create({
      data: { usuario_id: usuarioId },
      include: this.includeItems(),
    });
  }

  async findItem(listaId: string, productoId: string) {
    return prisma.cli_items_lista_deseos.findUnique({
      where: { lista_id_producto_id: { lista_id: listaId, producto_id: productoId } },
    });
  }

  async addItem(listaId: string, productoId: string) {
    return prisma.cli_items_lista_deseos.create({
      data: { lista_id: listaId, producto_id: productoId },
    });
  }

  async removeItem(listaId: string, productoId: string) {
    return prisma.cli_items_lista_deseos.delete({
      where: { lista_id_producto_id: { lista_id: listaId, producto_id: productoId } },
    });
  }

  async clearLista(listaId: string) {
    return prisma.cli_items_lista_deseos.deleteMany({
      where: { lista_id: listaId },
    });
  }

  private includeItems(): Prisma.cli_lista_deseosInclude {
    return {
      cli_items_lista_deseos: {
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

export const favoritosRepo = new FavoritosRepository();