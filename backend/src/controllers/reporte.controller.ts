import { Request, Response, NextFunction } from 'express';
import { reporteService } from '../services/reporte.service';

export class ReporteController {
  async reporteOrdenes(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = {
        fecha_inicio: req.query.fecha_inicio as string,
        fecha_fin: req.query.fecha_fin as string,
        estado: req.query.estado as string,
      };
      const pdf = await reporteService.generarReporteOrdenes(filtros);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-ordenes.pdf');
      pdf.pipe(res);
      pdf.end();
    } catch (error) {
      next(error);
    }
  }

  async reporteInventario(req: Request, res: Response, next: NextFunction) {
    try {
      const pdf = await reporteService.generarReporteInventarioValorizado();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-inventario.pdf');
      pdf.pipe(res);
      pdf.end();
    } catch (error) {
      next(error);
    }
  }

  async reporteMovimientos(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = {
        fecha_inicio: req.query.fecha_inicio as string,
        fecha_fin: req.query.fecha_fin as string,
      };
      const pdf = await reporteService.generarReporteMovimientos(filtros);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-movimientos.pdf');
      pdf.pipe(res);
      pdf.end();
    } catch (error) {
      next(error);
    }
  }

  async reporteStockBajo(req: Request, res: Response, next: NextFunction) {
    try {
      const pdf = await reporteService.generarReporteStockBajo();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-stock-bajo.pdf');
      pdf.pipe(res);
      pdf.end();
    } catch (error) {
      next(error);
    }
  }

  async reportePagos(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = {
        fecha_inicio: req.query.fecha_inicio as string,
        fecha_fin: req.query.fecha_fin as string,
      };
      const pdf = await reporteService.generarReportePagos(filtros);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-pagos.pdf');
      pdf.pipe(res);
      pdf.end();
    } catch (error) {
      next(error);
    }
  }

  async reporteDevoluciones(req: Request, res: Response, next: NextFunction) {
    try {
      const filtros = {
        fecha_inicio: req.query.fecha_inicio as string,
        fecha_fin: req.query.fecha_fin as string,
      };
      const pdf = await reporteService.generarReporteDevoluciones(filtros);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-devoluciones.pdf');
      pdf.pipe(res);
      pdf.end();
    } catch (error) {
      next(error);
    }
  }

  async facturaOrden(req: Request, res: Response, next: NextFunction) {
    try {
      const pdf = await reporteService.generarFacturaOrden(req.params.ordenId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=factura-${req.params.ordenId}.pdf`);
      pdf.pipe(res);
      pdf.end();
    } catch (error) {
      next(error);
    }
  }

  async reporteGestionRentabilidad(req: Request, res: Response, next: NextFunction) {
    try {
      const pdf = await reporteService.generarReporteGestionRentabilidad();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-rentabilidad.pdf');
      pdf.pipe(res);
      pdf.end();
    } catch (error) {
      next(error);
    }
  }

  async reporteGestionVentas(req: Request, res: Response, next: NextFunction) {
    try {
      const pdf = await reporteService.generarReporteGestionVentasCategoria();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-ventas.pdf');
      pdf.pipe(res);
      pdf.end();
    } catch (error) {
      next(error);
    }
  }

  async reporteGestionClientes(req: Request, res: Response, next: NextFunction) {
    try {
      const pdf = await reporteService.generarReporteGestionClientes();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-clientes.pdf');
      pdf.pipe(res);
      pdf.end();
    } catch (error) {
      next(error);
    }
  }

  async reporteGestionInventario(req: Request, res: Response, next: NextFunction) {
    try {
      const pdf = await reporteService.generarReporteGestionRotacionInventario();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-rotacion.pdf');
      pdf.pipe(res);
      pdf.end();
    } catch (error) {
      next(error);
    }
  }

  // Reportes de gestión avanzados (Puppeteer - HTML to PDF)
  async reporteGestionRentabilidadHTML(req: Request, res: Response, next: NextFunction) {
    try {
      const pdf = await reporteService.generarReporteGestionRentabilidadHTML();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-rentabilidad-gestion.pdf');
      res.send(pdf);
    } catch (error) {
      next(error);
    }
  }

  async reporteGestionVentasHTML(req: Request, res: Response, next: NextFunction) {
    try {
      const pdf = await reporteService.generarReporteGestionVentasHTML();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-ventas-gestion.pdf');
      res.send(pdf);
    } catch (error) {
      next(error);
    }
  }

  async reporteGestionCarritosHTML(req: Request, res: Response, next: NextFunction) {
    try {
      const pdf = await reporteService.generarReporteGestionCarritosHTML();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-carritos-gestion.pdf');
      res.send(pdf);
    } catch (error) {
      next(error);
    }
  }
}

export const reporteController = new ReporteController();