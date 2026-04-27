import { Request, Response, NextFunction } from 'express';
import { favoritosService } from '../services/favoritos.service';

export class FavoritosController {
  async obtener(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.user!.userId;
      const lista = await favoritosService.obtenerFavoritos(usuarioId);
      res.json({ success: true, data: lista });
    } catch (error) {
      next(error);
    }
  }

  async agregar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.user!.userId;
      const { producto_id } = req.body;
      const lista = await favoritosService.agregarProducto(usuarioId, producto_id);
      res.status(201).json({ success: true, data: lista });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.user!.userId;
      await favoritosService.eliminarProducto(usuarioId, req.params.productoId);
      res.json({ success: true, message: 'Producto eliminado de favoritos' });
    } catch (error) {
      next(error);
    }
  }

  async vaciar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.user!.userId;
      await favoritosService.vaciarFavoritos(usuarioId);
      res.json({ success: true, message: 'Favoritos vaciados' });
    } catch (error) {
      next(error);
    }
  }
}

export const favoritosController = new FavoritosController();