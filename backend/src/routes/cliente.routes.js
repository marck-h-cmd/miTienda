"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cliente_controller_1 = require("../controllers/cliente.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var rbac_middleware_1 = require("../middlewares/rbac.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/clientes:
 *   get:
 *     summary: Listar clientes (Admin)
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(rbac_middleware_1.Role.ADMINISTRADOR, rbac_middleware_1.Role.GERENTE_VENTAS, rbac_middleware_1.Role.VENDEDOR), cliente_controller_1.clienteController.listar);
/**
 * @swagger
 * /api/v1/clientes/perfil:
 *   get:
 *     summary: Obtener perfil del cliente autenticado
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 */
router.get('/perfil', auth_middleware_1.authenticate, cliente_controller_1.clienteController.obtenerPerfil);
router.put('/perfil', auth_middleware_1.authenticate, cliente_controller_1.clienteController.actualizarPerfil);
// Direcciones del cliente
router.get('/direcciones', auth_middleware_1.authenticate, cliente_controller_1.clienteController.obtenerDirecciones);
router.post('/direcciones', auth_middleware_1.authenticate, cliente_controller_1.clienteController.crearDireccion);
router.put('/direcciones/:direccionId', auth_middleware_1.authenticate, cliente_controller_1.clienteController.actualizarDireccion);
router.delete('/direcciones/:direccionId', auth_middleware_1.authenticate, cliente_controller_1.clienteController.eliminarDireccion);
// Lista de deseos
router.get('/lista-deseos', auth_middleware_1.authenticate, cliente_controller_1.clienteController.obtenerListaDeseos);
router.post('/lista-deseos', auth_middleware_1.authenticate, cliente_controller_1.clienteController.agregarAListaDeseos);
router.delete('/lista-deseos/:productoId', auth_middleware_1.authenticate, cliente_controller_1.clienteController.eliminarDeListaDeseos);
// Rutas de admin
router.get('/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(rbac_middleware_1.Role.ADMINISTRADOR, rbac_middleware_1.Role.GERENTE_VENTAS, rbac_middleware_1.Role.VENDEDOR), cliente_controller_1.clienteController.obtener);
router.get('/:id/historial-compras', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(rbac_middleware_1.Role.ADMINISTRADOR, rbac_middleware_1.Role.GERENTE_VENTAS), cliente_controller_1.clienteController.obtenerHistorialCompras);
router.patch('/:id/toggle-activo', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)(rbac_middleware_1.Role.ADMINISTRADOR), cliente_controller_1.clienteController.toggleActivo);
exports.default = router;
