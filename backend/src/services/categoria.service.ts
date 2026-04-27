import { categoriaRepo } from '../repositories/categoria.repository';
import { AppError, NotFoundError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

export class CategoriaService {
  async crearCategoria(data: {
    nombre: string;
    descripcion?: string;
    imagen_url?: string;
  }) {
    const existente = await categoriaRepo.findAll({ where: { nombre: data.nombre } });
    if (existente.length > 0) {
      throw new AppError('Ya existe una categoría con este nombre', 400);
    }

    const categoria = await categoriaRepo.create({
      nombre: data.nombre,
      descripcion: data.descripcion,
      imagen_url: data.imagen_url,
      activo: true
    });

    logger.info(`Categoría creada: ${categoria.nombre}`);
    return categoria;
  }

  async listarCategorias(page: number = 1, limit: number = 100, incluirInactivas: boolean = false) {
    const skip = (page - 1) * limit;
    const where = incluirInactivas ? {} : { activo: true };

    const [categorias, total] = await Promise.all([
      categoriaRepo.findAll({ skip, take: limit, where }),
      categoriaRepo.count(where)
    ]);

    return {
      categorias,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async obtenerCategoria(id: string) {
    const categoria = await categoriaRepo.findById(id);
    if (!categoria) {
      throw new NotFoundError('Categoría no encontrada');
    }
    return categoria;
  }

  async actualizarCategoria(id: string, data: {
    nombre?: string;
    descripcion?: string;
    imagen_url?: string;
    activo?: boolean;
  }) {
    const categoria = await this.obtenerCategoria(id);

    if (data.nombre && data.nombre !== categoria.nombre) {
      const existente = await categoriaRepo.findAll({ where: { nombre: data.nombre } });
      if (existente.length > 0 && existente[0].id !== id) {
        throw new AppError('Ya existe una categoría con este nombre', 400);
      }
    }

    const updated = await categoriaRepo.update(id, data);
    logger.info(`Categoría actualizada: ${updated.nombre}`);
    return updated;
  }

  async eliminarCategoria(id: string, permanente: boolean = false) {
    await this.obtenerCategoria(id);

    if (permanente) {
      await categoriaRepo.hardDelete(id);
      logger.info(`Categoría eliminada permanentemente: ${id}`);
    } else {
      await categoriaRepo.delete(id);
      logger.info(`Categoría desactivada: ${id}`);
    }

    return { message: permanente ? 'Categoría eliminada permanentemente' : 'Categoría desactivada' };
  }
}

export const categoriaService = new CategoriaService();