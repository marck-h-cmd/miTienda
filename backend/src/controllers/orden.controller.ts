import { Request, Response, NextFunction } from 'express';
import { ordenService } from '../services/orden.service';

export class OrdenController {
  async iniciarCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.user!.userId;
      const { direccionEnvioId, metodoEnvioId, cuponCodigo } = req.body;

      const resultado = await ordenService.iniciarCheckout({
        usuarioId,
        direccionEnvioId,
        metodoEnvioId,
        cuponCodigo,
      });

      res.status(201).json({
        success: true,
        data: resultado,
        message: 'Checkout iniciado exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }

  async obtenerOrden(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const usuarioId = req.user!.userId;

      const orden = await ordenService.obtenerOrden(id, usuarioId);

      res.json({
        success: true,
        data: orden,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelarOrden(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const usuarioId = req.user!.userId;

      const resultado = await ordenService.cancelarOrden(id, usuarioId);

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const ordenController = new OrdenController();