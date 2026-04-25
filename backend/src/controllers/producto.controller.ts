import { Request, Response, NextFunction } from 'express';
import { productoService } from '../services/producto.service';

export class ProductoController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productoService.listar(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async obtener(req: Request, res: Response, next: NextFunction) {
    try {
      const producto = await productoService.obtenerPorId(req.params.id);
      res.json({ success: true, data: producto });
    } catch (error) {
      next(error);
    }
  }

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const producto = await productoService.crear(req.body);
      res.status(201).json({ success: true, data: producto });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const producto = await productoService.actualizar(req.params.id, req.body);
      res.json({ success: true, data: producto });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      await productoService.eliminar(req.params.id);
      res.json({ success: true, message: 'Producto desactivado' });
    } catch (error) {
      next(error);
    }
  }
}

export const productoController = new ProductoController();