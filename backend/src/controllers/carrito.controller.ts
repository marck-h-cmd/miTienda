import { Request, Response, NextFunction } from 'express';
import { carritoService } from '../services/carrito.service';

export class CarritoController {
  async obtener(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.user?.userId;
      const sessionId = req.headers['x-session-id'] as string;
      const carrito = await carritoService.obtenerCarrito(usuarioId, sessionId);
      res.json({ success: true, data: carrito });
    } catch (error) {
      next(error);
    }
  }

  async agregar(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.user?.userId;
      const sessionId = req.headers['x-session-id'] as string;
      const { producto_id, cantidad } = req.body;
      const carrito = await carritoService.agregarItem(usuarioId, sessionId, producto_id, cantidad);
      res.status(201).json({ success: true, data: carrito });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { cantidad } = req.body;
      const resultado = await carritoService.actualizarItem(req.params.itemId, cantidad);
      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      await carritoService.eliminarItem(req.params.itemId);
      res.json({ success: true, message: 'Item eliminado' });
    } catch (error) {
      next(error);
    }
  }

  async vaciar(req: Request, res: Response, next: NextFunction) {
    try {
      await carritoService.vaciarCarrito(req.params.carritoId);
      res.json({ success: true, message: 'Carrito vaciado' });
    } catch (error) {
      next(error);
    }
  }
}

export const carritoController = new CarritoController();