import { Router } from 'express';
import { reporteController } from '../controllers/reporte.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole, Role } from '../middlewares/rbac.middleware';

const router = Router();

// Middleware de autenticación para todas las rutas de reportes
router.use(authenticate);
router.use(requireRole(Role.ADMINISTRADOR, Role.GERENTE_VENTAS, Role.GERENTE_INVENTARIO));

/**
 * @swagger
 * /api/v1/reportes/operacionales/ordenes:
 *   get:
 *     summary: Reporte de órdenes (PDF)
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 */
// Reportes Operacionales (PDFKit - streaming)
router.get('/operacionales/ordenes', reporteController.reporteOrdenes);
router.get('/operacionales/inventario', reporteController.reporteInventario);
router.get('/operacionales/movimientos', reporteController.reporteMovimientos);
router.get('/operacionales/stock-bajo', reporteController.reporteStockBajo);
router.get('/operacionales/pagos', reporteController.reportePagos);
router.get('/operacionales/devoluciones', reporteController.reporteDevoluciones);
router.get('/operacionales/factura/:ordenId', reporteController.facturaOrden);

// Reportes de Gestión (PDFKit - streaming)
router.get('/gestion/rentabilidad', reporteController.reporteGestionRentabilidad);
router.get('/gestion/ventas-categoria', reporteController.reporteGestionVentas);
router.get('/gestion/clientes', reporteController.reporteGestionClientes);
router.get('/gestion/rotacion-inventario', reporteController.reporteGestionInventario);

// Reportes de Gestión Avanzados (Puppeteer - buffer)
router.get('/gestion/rentabilidad-html', reporteController.reporteGestionRentabilidadHTML);
router.get('/gestion/ventas-html', reporteController.reporteGestionVentasHTML);
router.get('/gestion/carritos-html', reporteController.reporteGestionCarritosHTML);

export default router;