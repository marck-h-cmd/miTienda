import { Request, Response, NextFunction } from 'express';
import { inventarioService } from '../services/inventario.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class InventarioController {
  async obtenerStock(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inventarioService.obtenerStock(req.query);
      sendPaginated(res, result.stock, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async obtenerStockPorProducto(req: Request, res: Response, next: NextFunction) {
    try {
      const stock = await inventarioService.obtenerStockPorProducto(req.params.productoId);
      sendSuccess(res, stock);
    } catch (error) {
      next(error);
    }
  }

  async obtenerMovimientos(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inventarioService.obtenerMovimientos(req.params.productoId, req.query);
      sendPaginated(res, result.movimientos, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async ajustarStock(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        usuario_id: req.user!.userId,
      };
      const resultado = await inventarioService.ajustarStock(data);
      sendSuccess(res, resultado, 'Stock ajustado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async crearAjusteInventario(req: Request, res: Response, next: NextFunction) {
    try {
      const ajuste = await inventarioService.crearAjusteInventario({
        ...req.body,
        usuario_id: req.user!.userId,
      });
      res.status(201).json({ success: true, data: ajuste, message: 'Ajuste de inventario creado' });
    } catch (error) {
      next(error);
    }
  }

  async listarProveedores(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inventarioService.listarProveedores(req.query);
      sendPaginated(res, result.proveedores, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async crearProveedor(req: Request, res: Response, next: NextFunction) {
    try {
      const proveedor = await inventarioService.crearProveedor(req.body);
      res.status(201).json({ success: true, data: proveedor, message: 'Proveedor creado' });
    } catch (error) {
      next(error);
    }
  }

  async actualizarProveedor(req: Request, res: Response, next: NextFunction) {
    try {
      const proveedor = await inventarioService.actualizarProveedor(req.params.id, req.body);
      sendSuccess(res, proveedor, 'Proveedor actualizado');
    } catch (error) {
      next(error);
    }
  }

  async eliminarProveedor(req: Request, res: Response, next: NextFunction) {
    try {
      await inventarioService.eliminarProveedor(req.params.id);
      sendSuccess(res, null, 'Proveedor desactivado');
    } catch (error) {
      next(error);
    }
  }

  async crearOrdenCompra(req: Request, res: Response, next: NextFunction) {
    try {
      const orden = await inventarioService.crearOrdenCompra(req.body);
      res.status(201).json({ success: true, data: orden, message: 'Orden de compra creada' });
    } catch (error) {
      next(error);
    }
  }

  async listarOrdenesCompra(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inventarioService.listarOrdenesCompra(req.query);
      sendPaginated(res, result.ordenes, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async recibirOrdenCompra(req: Request, res: Response, next: NextFunction) {
    try {
      const recepcion = await inventarioService.recibirOrdenCompra(req.params.id, req.user!.userId);
      sendSuccess(res, recepcion, 'Recepción registrada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async productosStockBajo(req: Request, res: Response, next: NextFunction) {
    try {
      const productos = await inventarioService.productosStockBajo();
      sendSuccess(res, productos);
    } catch (error) {
      next(error);
    }
  }
}

export const inventarioController = new InventarioController();