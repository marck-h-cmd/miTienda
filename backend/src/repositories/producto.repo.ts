import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class ProductoRepository {
  async findAll(options: {
    skip?: number;
    take?: number;
    where?: Prisma.cat_productosWhereInput;
    orderBy?: Prisma.cat_productosOrderByWithRelationInput;
    include?: Prisma.cat_productosInclude;
  }) {
    return prisma.cat_productos.findMany(options);
  }

  async count(where?: Prisma.cat_productosWhereInput) {
    return prisma.cat_productos.count({ where });
  }

  async findById(id: string, include?: Prisma.cat_productosInclude) {
    return prisma.cat_productos.findUnique({ where: { id }, include });
  }

  async findBySku(sku: string) {
    return prisma.cat_productos.findUnique({ where: { sku } });
  }

  async create(data: Prisma.cat_productosCreateInput) {
    return prisma.cat_productos.create({ data });
  }

  async update(id: string, data: Prisma.cat_productosUpdateInput) {
    return prisma.cat_productos.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.cat_productos.update({
      where: { id },
      data: { activo: false, estado: 'inactivo' },
    });
  }

  async findByIds(ids: string[]) {
    return prisma.cat_productos.findMany({ where: { id: { in: ids } } });
  }
}

export const productoRepo = new ProductoRepository();