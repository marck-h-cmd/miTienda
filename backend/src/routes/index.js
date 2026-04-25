"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var auth_routes_1 = require("./auth.routes");
var producto_routes_1 = require("./producto.routes");
var carrito_routes_1 = require("./carrito.routes");
var orden_routes_1 = require("./orden.routes");
var inventario_routes_1 = require("./inventario.routes");
var cliente_routes_1 = require("./cliente.routes");
var reporte_routes_1 = require("./reporte.routes");
var dashboard_routes_1 = require("./dashboard.routes");
var estadisticas_routes_1 = require("./estadisticas.routes");
var webhook_routes_1 = require("./webhook.routes");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check
 *     tags: [Sistema]
 */
router.get('/health', function (_req, res) {
    res.json({ success: true, message: 'API funcionando' });
});
router.use('/auth', auth_routes_1.default);
router.use('/productos', producto_routes_1.default);
router.use('/carrito', carrito_routes_1.default);
router.use('/ordenes', orden_routes_1.default);
router.use('/inventario', inventario_routes_1.default);
router.use('/clientes', cliente_routes_1.default);
router.use('/reportes', reporte_routes_1.default);
router.use('/dashboard', dashboard_routes_1.default);
router.use('/estadisticas', estadisticas_routes_1.default);
router.use('/webhooks', webhook_routes_1.default);
exports.default = router;
