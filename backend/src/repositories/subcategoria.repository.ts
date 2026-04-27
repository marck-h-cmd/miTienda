import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class SubcategoriaRepository {
  async create(data: Prisma.cat_subcategoriasCreateInput) {
    return prisma.cat_subcategorias.create({ data });
  }

  async findById(id: string) {
    return prisma.cat_subcategorias.findUnique({ 
      where: { id },
      include: {
        cat_categorias: true,
        cat_productos: { take: 5 }
      }
    });
  }

  async findAll(options: {
    skip?: number;
    take?: number;
    where?: Prisma.cat_subcategoriasWhereInput;
    orderBy?: Prisma.cat_subcategoriasOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 100, where = {}, orderBy = { nombre: 'asc' } } = options;
    return prisma.cat_subcategorias.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        cat_categorias: {
          select: { id: true, nombre: true }
        }
      }
    });
  }

  async count(where?: Prisma.cat_subcategoriasWhereInput) {
    return prisma.cat_subcategorias.count({ where });
  }

  async update(id: string, data: Prisma.cat_subcategoriasUpdateInput) {
    return prisma.cat_subcategorias.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.cat_subcategorias.update({ 
      where: { id }, 
      data: { activo: false } 
    });
  }

  async hardDelete(id: string) {
    return prisma.cat_subcategorias.delete({ where: { id } });
  }
}

export const subcategoriaRepo = new SubcategoriaRepository();