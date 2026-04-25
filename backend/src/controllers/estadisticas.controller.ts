import { Request, Response, NextFunction } from 'express';
import { estadisticasService } from '../services/estadisticas.service';

export class EstadisticasController {
  async tendenciaVentas(req: Request, res: Response, next: NextFunction) {
    try {
      const meses = req.query.meses ? Number(req.query.meses) : 12;
      const ventas = await estadisticasService.tendenciaVentasMensuales(meses);
      res.json({ success: true, data: ventas });
    } catch (error) {
      next(error);
    }
  }

  async analisisABC(req: Request, res: Response, next: NextFunction) {
    try {
      const productos = await estadisticasService.analisisABC();
      res.json({ success: true, data: productos });
    } catch (error) {
      next(error);
    }
  }

  async analisisRFM(req: Request, res: Response, next: NextFunction) {
    try {
      const clientes = await estadisticasService.analisisRFM();
      res.json({ success: true, data: clientes });
    } catch (error) {
      next(error);
    }
  }
}

export const estadisticasController = new EstadisticasController();