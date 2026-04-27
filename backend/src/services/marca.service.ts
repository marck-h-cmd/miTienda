import { marcaRepo } from '../repositories/marca.repository';
import { AppError, NotFoundError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

export class MarcaService {
  async crearMarca(data: {
    nombre: string;
    logo_url?: string;
  }) {
    const existente = await marcaRepo.findAll({ where: { nombre: data.nombre } });
    if (existente.length > 0) {
      throw new AppError('Ya existe una marca con este nombre', 400);
    }

    const marca = await marcaRepo.create({
      nombre: data.nombre,
      logo_url: data.logo_url,
      activo: true
    });

    logger.info(`Marca creada: ${marca.nombre}`);
    return marca;
  }

  async listarMarcas(page: number = 1, limit: number = 100, incluirInactivas: boolean = false) {
    const skip = (page - 1) * limit;
    const where = incluirInactivas ? {} : { activo: true };

    const [marcas, total] = await Promise.all([
      marcaRepo.findAll({ skip, take: limit, where }),
      marcaRepo.count(where)
    ]);

    return {
      marcas,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async obtenerMarca(id: string) {
    const marca = await marcaRepo.findById(id);
    if (!marca) {
      throw new NotFoundError('Marca no encontrada');
    }
    return marca;
  }

  async actualizarMarca(id: string, data: {
    nombre?: string;
    logo_url?: string;
    activo?: boolean;
  }) {
    const marca = await this.obtenerMarca(id);

    if (data.nombre && data.nombre !== marca.nombre) {
      const existente = await marcaRepo.findAll({ where: { nombre: data.nombre } });
      if (existente.length > 0 && existente[0].id !== id) {
        throw new AppError('Ya existe una marca con este nombre', 400);
      }
    }

    const updated = await marcaRepo.update(id, data);
    logger.info(`Marca actualizada: ${updated.nombre}`);
    return updated;
  }

  async eliminarMarca(id: string, permanente: boolean = false) {
    await this.obtenerMarca(id);

    if (permanente) {
      await marcaRepo.hardDelete(id);
      logger.info(`Marca eliminada permanentemente: ${id}`);
    } else {
      await marcaRepo.delete(id);
      logger.info(`Marca desactivada: ${id}`);
    }

    return { message: permanente ? 'Marca eliminada permanentemente' : 'Marca desactivada' };
  }
}

export const marcaService = new MarcaService();