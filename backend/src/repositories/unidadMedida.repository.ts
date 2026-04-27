import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class UnidadMedidaRepository {
  async create(data: Prisma.cat_unidades_medidaCreateInput) {
    return prisma.cat_unidades_medida.create({ data });
  }

  async findById(id: string) {
    return prisma.cat_unidades_medida.findUnique({ where: { id } });
  }

  async findAll(options: {
    skip?: number;
    take?: number;
    where?: Prisma.cat_unidades_medidaWhereInput;
    orderBy?: Prisma.cat_unidades_medidaOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 100, where = {}, orderBy = { nombre: 'asc' } } = options;
    return prisma.cat_unidades_medida.findMany({
      skip,
      take,
      where,
      orderBy
    });
  }

  async count(where?: Prisma.cat_unidades_medidaWhereInput) {
    return prisma.cat_unidades_medida.count({ where });
  }

  async update(id: string, data: Prisma.cat_unidades_medidaUpdateInput) {
    return prisma.cat_unidades_medida.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.cat_unidades_medida.update({ 
      where: { id }, 
      data: { activo: false } 
    });
  }

  async hardDelete(id: string) {
    return prisma.cat_unidades_medida.delete({ where: { id } });
  }
}

export const unidadMedidaRepo = new UnidadMedidaRepository();