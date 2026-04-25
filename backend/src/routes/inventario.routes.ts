import { Router } from 'express';
import { inventarioController } from '../controllers/inventario.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole, Role } from '../middlewares/rbac.middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/inventario/stock:
 *   get:
 *     summary: Obtener stock de productos
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stock', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_INVENTARIO, Role.VENDEDOR), inventarioController.obtenerStock);
router.get('/stock/bajo', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_INVENTARIO), inventarioController.productosStockBajo);
router.get('/stock/:productoId', authenticate, inventarioController.obtenerStockPorProducto);

// Movimientos de inventario
router.get('/movimientos/:productoId', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_INVENTARIO), inventarioController.obtenerMovimientos);

// Ajustes de inventario
router.post('/ajustes', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_INVENTARIO), inventarioController.ajustarStock);
router.post('/ajustes-inventario', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_INVENTARIO), inventarioController.crearAjusteInventario);

// Proveedores
router.get('/proveedores', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_INVENTARIO), inventarioController.listarProveedores);
router.post('/proveedores', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_INVENTARIO), inventarioController.crearProveedor);
router.put('/proveedores/:id', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_INVENTARIO), inventarioController.actualizarProveedor);
router.delete('/proveedores/:id', authenticate, requireRole(Role.ADMINISTRADOR), inventarioController.eliminarProveedor);

// Órdenes de compra
router.get('/ordenes-compra', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_INVENTARIO), inventarioController.listarOrdenesCompra);
router.post('/ordenes-compra', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_INVENTARIO), inventarioController.crearOrdenCompra);
router.post('/ordenes-compra/:id/recibir', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_INVENTARIO), inventarioController.recibirOrdenCompra);

export default router;