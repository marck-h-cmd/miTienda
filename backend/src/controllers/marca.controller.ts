import { Request, Response, NextFunction } from 'express';
import { marcaService } from '../services/marca.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class MarcaController {
  async crearMarca(req: Request, res: Response, next: NextFunction) {
    try {
      const marca = await marcaService.crearMarca(req.body);
      sendSuccess(res, marca, 'Marca creada exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async listarMarcas(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 100, incluirInactivas = false } = req.query;
      const result = await marcaService.listarMarcas(
        Number(page),
        Number(limit),
        incluirInactivas === 'true'
      );
      sendPaginated(res, result.marcas, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async obtenerMarca(req: Request, res: Response, next: NextFunction) {
    try {
      const marca = await marcaService.obtenerMarca(req.params.id);
      sendSuccess(res, marca);
    } catch (error) {
      next(error);
    }
  }

  async actualizarMarca(req: Request, res: Response, next: NextFunction) {
    try {
      const marca = await marcaService.actualizarMarca(req.params.id, req.body);
      sendSuccess(res, marca, 'Marca actualizada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async eliminarMarca(req: Request, res: Response, next: NextFunction) {
    try {
      const { permanente = false } = req.query;
      const result = await marcaService.eliminarMarca(
        req.params.id,
        permanente === 'true'
      );
      sendSuccess(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export const marcaController = new MarcaController();