"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var reporte_controller_1 = require("../controllers/reporte.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var rbac_middleware_1 = require("../middlewares/rbac.middleware");
var router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas de reportes
router.use(auth_middleware_1.authenticate);
router.use((0, rbac_middleware_1.requireRole)(rbac_middleware_1.Role.ADMINISTRADOR, rbac_middleware_1.Role.GERENTE_VENTAS, rbac_middleware_1.Role.GERENTE_INVENTARIO));
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
router.get('/operacionales/ordenes', reporte_controller_1.reporteController.reporteOrdenes);
router.get('/operacionales/inventario', reporte_controller_1.reporteController.reporteInventario);
router.get('/operacionales/movimientos', reporte_controller_1.reporteController.reporteMovimientos);
router.get('/operacionales/stock-bajo', reporte_controller_1.reporteController.reporteStockBajo);
router.get('/operacionales/pagos', reporte_controller_1.reporteController.reportePagos);
router.get('/operacionales/devoluciones', reporte_controller_1.reporteController.reporteDevoluciones);
router.get('/operacionales/factura/:ordenId', reporte_controller_1.reporteController.facturaOrden);
// Reportes de Gestión (PDFKit - streaming)
router.get('/gestion/rentabilidad', reporte_controller_1.reporteController.reporteGestionRentabilidad);
router.get('/gestion/ventas-categoria', reporte_controller_1.reporteController.reporteGestionVentas);
router.get('/gestion/clientes', reporte_controller_1.reporteController.reporteGestionClientes);
router.get('/gestion/rotacion-inventario', reporte_controller_1.reporteController.reporteGestionInventario);
// Reportes de Gestión Avanzados (Puppeteer - buffer)
router.get('/gestion/rentabilidad-html', reporte_controller_1.reporteController.reporteGestionRentabilidadHTML);
router.get('/gestion/ventas-html', reporte_controller_1.reporteController.reporteGestionVentasHTML);
router.get('/gestion/carritos-html', reporte_controller_1.reporteController.reporteGestionCarritosHTML);
exports.default = router;
