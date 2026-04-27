import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class MarcaRepository {
  async create(data: Prisma.cat_marcasCreateInput) {
    return prisma.cat_marcas.create({ data });
  }

  async findById(id: string) {
    return prisma.cat_marcas.findUnique({ 
      where: { id },
      include: {
        cat_productos: { take: 5 }
      }
    });
  }

  async findAll(options: {
    skip?: number;
    take?: number;
    where?: Prisma.cat_marcasWhereInput;
    orderBy?: Prisma.cat_marcasOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 100, where = {}, orderBy = { nombre: 'asc' } } = options;
    return prisma.cat_marcas.findMany({
      skip,
      take,
      where,
      orderBy
    });
  }

  async count(where?: Prisma.cat_marcasWhereInput) {
    return prisma.cat_marcas.count({ where });
  }

  async update(id: string, data: Prisma.cat_marcasUpdateInput) {
    return prisma.cat_marcas.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.cat_marcas.update({ 
      where: { id }, 
      data: { activo: false } 
    });
  }

  async hardDelete(id: string) {
    return prisma.cat_marcas.delete({ where: { id } });
  }
}

export const marcaRepo = new MarcaRepository();