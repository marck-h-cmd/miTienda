import { Request, Response, NextFunction } from 'express';
import { clienteService } from '../services/cliente.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class ClienteController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await clienteService.listar(req.query);
      sendPaginated(res, result.clientes, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async obtener(req: Request, res: Response, next: NextFunction) {
    try {
      const cliente = await clienteService.obtenerPorId(req.params.id);
      sendSuccess(res, cliente);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPerfil(req: Request, res: Response, next: NextFunction) {
    try {
      const cliente = await clienteService.obtenerPorUsuarioId(req.user!.userId);
      sendSuccess(res, cliente);
    } catch (error) {
      next(error);
    }
  }

  async actualizarPerfil(req: Request, res: Response, next: NextFunction) {
    try {
      const cliente = await clienteService.actualizarPerfil(req.user!.userId, req.body);
      sendSuccess(res, cliente, 'Perfil actualizado');
    } catch (error) {
      next(error);
    }
  }

  async obtenerDirecciones(req: Request, res: Response, next: NextFunction) {
    try {
      const direcciones = await clienteService.obtenerDirecciones(req.user!.userId);
      sendSuccess(res, direcciones);
    } catch (error) {
      next(error);
    }
  }

  async crearDireccion(req: Request, res: Response, next: NextFunction) {
    try {
      const direccion = await clienteService.crearDireccion(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: direccion, message: 'Dirección creada' });
    } catch (error) {
      next(error);
    }
  }

  async actualizarDireccion(req: Request, res: Response, next: NextFunction) {
    try {
      const direccion = await clienteService.actualizarDireccion(req.params.direccionId, req.user!.userId, req.body);
      sendSuccess(res, direccion, 'Dirección actualizada');
    } catch (error) {
      next(error);
    }
  }

  async eliminarDireccion(req: Request, res: Response, next: NextFunction) {
    try {
      await clienteService.eliminarDireccion(req.params.direccionId, req.user!.userId);
      sendSuccess(res, null, 'Dirección eliminada');
    } catch (error) {
      next(error);
    }
  }

  async obtenerHistorialCompras(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await clienteService.obtenerHistorialCompras(req.params.id, req.query);
      sendPaginated(res, result.ordenes, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async toggleActivo(req: Request, res: Response, next: NextFunction) {
    try {
      await clienteService.toggleActivo(req.params.id, req.body.activo);
      sendSuccess(res, null, 'Estado del cliente actualizado');
    } catch (error) {
      next(error);
    }
  }

  async obtenerListaDeseos(req: Request, res: Response, next: NextFunction) {
    try {
      const lista = await clienteService.obtenerListaDeseos(req.user!.userId);
      sendSuccess(res, lista);
    } catch (error) {
      next(error);
    }
  }

  async agregarAListaDeseos(req: Request, res: Response, next: NextFunction) {
    try {
      await clienteService.agregarAListaDeseos(req.user!.userId, req.body.producto_id);
      res.status(201).json({ success: true, message: 'Producto agregado a la lista de deseos' });
    } catch (error) {
      next(error);
    }
  }

  async eliminarDeListaDeseos(req: Request, res: Response, next: NextFunction) {
    try {
      await clienteService.eliminarDeListaDeseos(req.user!.userId, req.params.productoId);
      sendSuccess(res, null, 'Producto eliminado de la lista de deseos');
    } catch (error) {
      next(error);
    }
  }
}

export const clienteController = new ClienteController();