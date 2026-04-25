"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var inventario_controller_1 = require("../controllers/inventario.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var rbac_middleware_1 = require("../middlewares/rbac.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/inventario/stock:
 *   get:
 *     summary: Obtener stock de productos
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stock', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(rbac_middleware_1.Role.ADMINISTRADOR, rbac_middleware_1.Role.GERENTE_INVENTARIO, rbac_middleware_1.Role.VENDEDOR), inventario_controller_1.inventarioController.obtenerStock);
router.get('/stock/bajo', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(rbac_middleware_1.Role.ADMINISTRADOR, rbac_middleware_1.Role.GERENTE_INVENTARIO), inventario_controller_1.inventarioController.productosStockBajo);
router.get('/stock/:productoId', auth_middleware_1.authenticate, inventario_controller_1.inventarioController.obtenerStockPorProducto);
// Movimientos de inventario
router.get('/movimientos/:productoId', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(rbac_middleware_1.Role.ADMINISTRADOR, rbac_middleware_1.Role.GERENTE_INVENTARIO), inventario_controller_1.inventarioController.obtenerMovimientos);
// Ajustes de inventario
router.post('/ajustes', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(rbac_middleware_1.Role.ADMINISTRADOR, rbac_middleware_1.Role.GERENTE_INVENTARIO), inventario_controller_1.inventarioController.ajustarStock);
router.post('/ajustes-inventario', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(rbac_middleware_1.Role.ADMINISTRADOR, rbac_middleware_1.Role.GERENTE_INVENTARIO), inventario_controller_1.inventarioController.crearAjusteInventario);
// Proveedores
router.get('/proveedores', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(rbac_middleware_1.Role.ADMINISTRADOR, rbac_middleware_1.Role.GERENTE_INVENTARIO), inventario_controller_1.inventarioController.listarProveedores);
router.post('/proveedores', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(rbac_middleware_1.Role.ADMINISTRADOR, rbac_middleware_1.Role.GERENTE_INVENTARIO), inventario_controller_1.inventarioController.crearProveedor);
router.put('/proveedores/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(rbac_middleware_1.Role.ADMINISTRADOR, rbac_middleware_1.Role.GERENTE_INVENTARIO), inventario_controller_1.inventarioController.actualizarProveedor);
router.delete('/proveedores/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(rbac_middleware_1.Role.ADMINISTRADOR), inventario_controller_1.inventarioController.eliminarProveedor);
// Órdenes de compra
router.get('/ordenes-compra', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(rbac_middleware_1.Role.ADMINISTRADOR, rbac_middleware_1.Role.GERENTE_INVENTARIO), inventario_controller_1.inventarioController.listarOrdenesCompra);
router.post('/ordenes-compra', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(rbac_middleware_1.Role.ADMINISTRADOR, rbac_middleware_1.Role.GERENTE_INVENTARIO), inventario_controller_1.inventarioController.crearOrdenCompra);
router.post('/ordenes-compra/:id/recibir', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(rbac_middleware_1.Role.ADMINISTRADOR, rbac_middleware_1.Role.GERENTE_INVENTARIO), inventario_controller_1.inventarioController.recibirOrdenCompra);
exports.default = router;
