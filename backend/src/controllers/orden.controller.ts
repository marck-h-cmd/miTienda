import { Request, Response, NextFunction } from 'express';
import { ordenService } from '../services/orden.service';
import { sendSuccess, sendPaginated } from '../utils/response';
import { Role } from '../middlewares/rbac.middleware';

export class OrdenController {
  /**
   * GET /api/v1/ordenes?page=1&limit=10
   * Lista las órdenes del usuario autenticado — resuelve el 404.
   */
  async listarOrdenes(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.user!.userId;
      const result = await ordenService.listarOrdenes(usuarioId, req.query, req.user!.roles);
      sendPaginated(res, result.ordenes, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ordenes/opciones-envio
   */
  async obtenerOpcionesEnvio(req: Request, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.user!.userId;
      const opciones = await ordenService.obtenerOpcionesEnvio(usuarioId);
      sendSuccess(res, opciones);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/ordenes/checkout
   */
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
      res.status(201).json({ success: true, data: resultado, message: 'Checkout iniciado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ordenes/:id
   */
  async obtenerOrden(req: Request, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user!.roles.some((role) =>
        [Role.ADMINISTRADOR, Role.GERENTE_VENTAS, Role.GERENTE_INVENTARIO, Role.VENDEDOR].includes(role as Role)
      );
      const orden = await ordenService.obtenerOrden(req.params.id, req.user!.userId, isAdmin);
      sendSuccess(res, orden);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/ordenes/:id
   */
  async actualizarOrden(req: Request, res: Response, next: NextFunction) {
    try {
      const ordenActualizada = await ordenService.actualizarOrden(
        req.params.id,
        req.user!.userId,
        req.user!.roles,
        req.body
      );
      sendSuccess(res, ordenActualizada, 'Orden actualizada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/ordenes/:id/estado
   */
  async actualizarEstado(req: Request, res: Response, next: NextFunction) {
    try {
      const ordenActualizada = await ordenService.actualizarEstado(
        req.params.id,
        req.user!.userId,
        req.user!.roles,
        req.body.estado
      );
      sendSuccess(res, ordenActualizada, 'Estado de orden actualizado');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/ordenes/:id/cancelar
   */
  async cancelarOrden(req: Request, res: Response, next: NextFunction) {
    try {
      const resultado = await ordenService.cancelarOrden(req.params.id, req.user!.userId, req.user!.roles);
      sendSuccess(res, null, resultado.mensaje);
    } catch (error) {
      next(error);
    }
  }
}

export const ordenController = new OrdenController();