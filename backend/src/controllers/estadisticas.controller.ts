import { Request, Response, NextFunction } from 'express';
import { estadisticasService } from '../services/estadisticas.service';

export class EstadisticasController {
  async tendenciaVentas(req: Request, res: Response, next: NextFunction) {
    try {
      const meses = req.query.meses ? Number(req.query.meses) : 12;
      const ventas = await estadisticasService.tendenciaVentasMensuales(meses);
      console.log('=== TENDENCIA VENTAS ===');
      console.log('Ventas:', ventas);
      res.json({ success: true, data: ventas });
    } catch (error) {
      console.error('Error en tendenciaVentas:', error);
      next(error);
    }
  }

  async analisisABC(req: Request, res: Response, next: NextFunction) {
    try {
      const productos = await estadisticasService.analisisABC();
      console.log('=== ANALISIS ABC ===');
      console.log('Productos:', productos);
      res.json({ success: true, data: productos });
    } catch (error) {
      console.error('Error en analisisABC:', error);
      next(error);
    }
  }

  async analisisRFM(req: Request, res: Response, next: NextFunction) {
    try {
      const clientes = await estadisticasService.analisisRFM();
      console.log('=== ANALISIS RFM ===');
      console.log('Clientes:', clientes);
      res.json({ success: true, data: clientes });
    } catch (error) {
      console.error('Error en analisisRFM:', error);
      next(error);
    }
  }

  // Endpoint de verificación
  async verificarDatos(req: Request, res: Response, next: NextFunction) {
    try {
      const datos = await estadisticasService.verificarDatos();
      res.json({ success: true, data: datos });
    } catch (error) {
      next(error);
    }
  }
}

export const estadisticasController = new EstadisticasController();