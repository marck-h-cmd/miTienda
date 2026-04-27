import { Request, Response, NextFunction } from 'express';
import { unidadMedidaService } from '../services/unidadMedida.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class UnidadMedidaController {
  async crearUnidadMedida(req: Request, res: Response, next: NextFunction) {
    try {
      const unidad = await unidadMedidaService.crearUnidadMedida(req.body);
      sendSuccess(res, unidad, 'Unidad de medida creada exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async listarUnidadesMedida(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 100 } = req.query;
      const result = await unidadMedidaService.listarUnidadesMedida(Number(page), Number(limit));
      sendPaginated(res, result.unidades, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async obtenerUnidadMedida(req: Request, res: Response, next: NextFunction) {
    try {
      const unidad = await unidadMedidaService.obtenerUnidadMedida(req.params.id);
      sendSuccess(res, unidad);
    } catch (error) {
      next(error);
    }
  }

  async actualizarUnidadMedida(req: Request, res: Response, next: NextFunction) {
    try {
      const unidad = await unidadMedidaService.actualizarUnidadMedida(req.params.id, req.body);
      sendSuccess(res, unidad, 'Unidad de medida actualizada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async eliminarUnidadMedida(req: Request, res: Response, next: NextFunction) {
    try {
      const { permanente = false } = req.query;
      const result = await unidadMedidaService.eliminarUnidadMedida(
        req.params.id,
        permanente === 'true'
      );
      sendSuccess(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export const unidadMedidaController = new UnidadMedidaController();