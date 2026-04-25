import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  async obtenerKPIs(req: Request, res: Response, next: NextFunction) {
    try {
      const dias = req.query.dias ? Number(req.query.dias) : 30;
      const kpis = await dashboardService.obtenerKPIs(dias);
      res.json({ success: true, data: kpis });
    } catch (error) {
      next(error);
    }
  }

  async ventasDiarias(req: Request, res: Response, next: NextFunction) {
    try {
      const dias = req.query.dias ? Number(req.query.dias) : 30;
      const ventas = await dashboardService.obtenerVentasDiarias(dias);
      res.json({ success: true, data: ventas });
    } catch (error) {
      next(error);
    }
  }

  async ventasPorCategoria(req: Request, res: Response, next: NextFunction) {
    try {
      const dias = req.query.dias ? Number(req.query.dias) : 30;
      const ventas = await dashboardService.obtenerVentasPorCategoria(dias);
      res.json({ success: true, data: ventas });
    } catch (error) {
      next(error);
    }
  }

  async topProductos(req: Request, res: Response, next: NextFunction) {
    try {
      const dias = req.query.dias ? Number(req.query.dias) : 30;
      const productos = await dashboardService.obtenerTopProductos(dias);
      res.json({ success: true, data: productos });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();