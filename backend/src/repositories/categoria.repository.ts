import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class CategoriaRepository {
  async create(data: Prisma.cat_categoriasCreateInput) {
    return prisma.cat_categorias.create({ data });
  }

  async findById(id: string) {
    return prisma.cat_categorias.findUnique({ 
      where: { id },
      include: {
        cat_subcategorias: true,
        cat_productos: { take: 5 }
      }
    });
  }

  async findAll(options: {
    skip?: number;
    take?: number;
    where?: Prisma.cat_categoriasWhereInput;
    orderBy?: Prisma.cat_categoriasOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 100, where = {}, orderBy = { nombre: 'asc' } } = options;
    return prisma.cat_categorias.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        cat_subcategorias: {
          where: { activo: true }
        }
      }
    });
  }

  async count(where?: Prisma.cat_categoriasWhereInput) {
    return prisma.cat_categorias.count({ where });
  }

  async update(id: string, data: Prisma.cat_categoriasUpdateInput) {
    return prisma.cat_categorias.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.cat_categorias.update({ 
      where: { id }, 
      data: { activo: false } 
    });
  }

  async hardDelete(id: string) {
    return prisma.cat_categorias.delete({ where: { id } });
  }
}

export const categoriaRepo = new CategoriaRepository();