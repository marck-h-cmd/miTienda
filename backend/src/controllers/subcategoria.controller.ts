import { Request, Response, NextFunction } from 'express';
import { subcategoriaService } from '../services/subcategoria.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class SubcategoriaController {
  async crearSubcategoria(req: Request, res: Response, next: NextFunction) {
    try {
      const subcategoria = await subcategoriaService.crearSubcategoria(req.body);
      sendSuccess(res, subcategoria, 'Subcategoría creada exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async listarSubcategorias(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 100, categoriaId } = req.query;
      const result = await subcategoriaService.listarSubcategorias(
        Number(page),
        Number(limit),
        categoriaId as string
      );
      sendPaginated(res, result.subcategorias, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async obtenerSubcategoria(req: Request, res: Response, next: NextFunction) {
    try {
      const subcategoria = await subcategoriaService.obtenerSubcategoria(req.params.id);
      sendSuccess(res, subcategoria);
    } catch (error) {
      next(error);
    }
  }

  async actualizarSubcategoria(req: Request, res: Response, next: NextFunction) {
    try {
      const subcategoria = await subcategoriaService.actualizarSubcategoria(req.params.id, req.body);
      sendSuccess(res, subcategoria, 'Subcategoría actualizada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async eliminarSubcategoria(req: Request, res: Response, next: NextFunction) {
    try {
      const { permanente = false } = req.query;
      const result = await subcategoriaService.eliminarSubcategoria(
        req.params.id,
        permanente === 'true'
      );
      sendSuccess(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export const subcategoriaController = new SubcategoriaController();