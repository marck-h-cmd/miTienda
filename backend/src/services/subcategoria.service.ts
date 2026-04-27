import { subcategoriaRepo } from '../repositories/subcategoria.repository';
import { categoriaRepo } from '../repositories/categoria.repository';
import { AppError, NotFoundError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

export class SubcategoriaService {
  async crearSubcategoria(data: {
    nombre: string;
    categoria_id: string;
  }) {
    // Verificar que la categoría existe
    const categoria = await categoriaRepo.findById(data.categoria_id);
    if (!categoria) {
      throw new NotFoundError('Categoría no encontrada');
    }

    const subcategoria = await subcategoriaRepo.create({
      nombre: data.nombre,
      cat_categorias: { connect: { id: data.categoria_id } },
      
      activo: true
    });

    logger.info(`Subcategoría creada: ${subcategoria.nombre}`);
    return subcategoria;
  }

  async listarSubcategorias(page: number = 1, limit: number = 100, categoriaId?: string) {
    const skip = (page - 1) * limit;
    const where: any = { activo: true };
    if (categoriaId) {
      where.categoria_id = categoriaId;
    }

    const [subcategorias, total] = await Promise.all([
      subcategoriaRepo.findAll({ skip, take: limit, where }),
      subcategoriaRepo.count(where)
    ]);

    return {
      subcategorias,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async obtenerSubcategoria(id: string) {
    const subcategoria = await subcategoriaRepo.findById(id);
    if (!subcategoria) {
      throw new NotFoundError('Subcategoría no encontrada');
    }
    return subcategoria;
  }

  async actualizarSubcategoria(id: string, data: {
    nombre?: string;
    categoria_id?: string;
    activo?: boolean;
  }) {
    await this.obtenerSubcategoria(id);

    if (data.categoria_id) {
      const categoria = await categoriaRepo.findById(data.categoria_id);
      if (!categoria) {
        throw new NotFoundError('Categoría no encontrada');
      }
    }

    const updated = await subcategoriaRepo.update(id, data);
    logger.info(`Subcategoría actualizada: ${updated.nombre}`);
    return updated;
  }

  async eliminarSubcategoria(id: string, permanente: boolean = false) {
    await this.obtenerSubcategoria(id);

    if (permanente) {
      await subcategoriaRepo.hardDelete(id);
      logger.info(`Subcategoría eliminada permanentemente: ${id}`);
    } else {
      await subcategoriaRepo.delete(id);
      logger.info(`Subcategoría desactivada: ${id}`);
    }

    return { message: permanente ? 'Subcategoría eliminada permanentemente' : 'Subcategoría desactivada' };
  }
}

export const subcategoriaService = new SubcategoriaService();
