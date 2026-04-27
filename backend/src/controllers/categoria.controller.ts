import { Request, Response, NextFunction } from 'express';
import { categoriaService } from '../services/categoria.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class CategoriaController {
  async crearCategoria(req: Request, res: Response, next: NextFunction) {
    try {
      const categoria = await categoriaService.crearCategoria(req.body);
      sendSuccess(res, categoria, 'Categoría creada exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async listarCategorias(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 100, incluirInactivas = false } = req.query;
      const result = await categoriaService.listarCategorias(
        Number(page),
        Number(limit),
        incluirInactivas === 'true'
      );
      sendPaginated(res, result.categorias, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async obtenerCategoria(req: Request, res: Response, next: NextFunction) {
    try {
      const categoria = await categoriaService.obtenerCategoria(req.params.id);
      sendSuccess(res, categoria);
    } catch (error) {
      next(error);
    }
  }

  async actualizarCategoria(req: Request, res: Response, next: NextFunction) {
    try {
      const categoria = await categoriaService.actualizarCategoria(req.params.id, req.body);
      sendSuccess(res, categoria, 'Categoría actualizada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async eliminarCategoria(req: Request, res: Response, next: NextFunction) {
    try {
      const { permanente = false } = req.query;
      const result = await categoriaService.eliminarCategoria(
        req.params.id,
        permanente === 'true'
      );
      sendSuccess(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export const categoriaController = new CategoriaController();