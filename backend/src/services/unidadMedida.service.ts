import { unidadMedidaRepo } from '../repositories/unidadMedida.repository';
import { AppError, NotFoundError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

export class UnidadMedidaService {
  async crearUnidadMedida(data: {
    nombre: string;
    abreviatura: string;
  }) {
    const existente = await unidadMedidaRepo.findAll({ where: { nombre: data.nombre } });
    if (existente.length > 0) {
      throw new AppError('Ya existe una unidad de medida con este nombre', 400);
    }

    const unidad = await unidadMedidaRepo.create({
      nombre: data.nombre,
      abreviatura: data.abreviatura,
      activo: true
    });

    logger.info(`Unidad de medida creada: ${unidad.nombre}`);
    return unidad;
  }

  async listarUnidadesMedida(page: number = 1, limit: number = 100) {
    const skip = (page - 1) * limit;
    const where = { activo: true };

    const [unidades, total] = await Promise.all([
      unidadMedidaRepo.findAll({ skip, take: limit, where }),
      unidadMedidaRepo.count(where)
    ]);

    return {
      unidades,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async obtenerUnidadMedida(id: string) {
    const unidad = await unidadMedidaRepo.findById(id);
    if (!unidad) {
      throw new NotFoundError('Unidad de medida no encontrada');
    }
    return unidad;
  }

  async actualizarUnidadMedida(id: string, data: {
    nombre?: string;
    abreviatura?: string;
    activo?: boolean;
  }) {
    await this.obtenerUnidadMedida(id);
    const updated = await unidadMedidaRepo.update(id, data);
    logger.info(`Unidad de medida actualizada: ${updated.nombre}`);
    return updated;
  }

  async eliminarUnidadMedida(id: string, permanente: boolean = false) {
    await this.obtenerUnidadMedida(id);

    if (permanente) {
      await unidadMedidaRepo.hardDelete(id);
      logger.info(`Unidad de medida eliminada permanentemente: ${id}`);
    } else {
      await unidadMedidaRepo.delete(id);
      logger.info(`Unidad de medida desactivada: ${id}`);
    }

    return { message: permanente ? 'Unidad de medida eliminada permanentemente' : 'Unidad de medida desactivada' };
  }
}

export const unidadMedidaService = new UnidadMedidaService();