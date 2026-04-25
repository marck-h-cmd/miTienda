import { Router } from 'express';
import { clienteController } from '../controllers/cliente.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole, Role } from '../middlewares/rbac.middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/clientes:
 *   get:
 *     summary: Listar clientes (Admin)
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_VENTAS, Role.VENDEDOR), clienteController.listar);

/**
 * @swagger
 * /api/v1/clientes/perfil:
 *   get:
 *     summary: Obtener perfil del cliente autenticado
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 */
router.get('/perfil', authenticate, clienteController.obtenerPerfil);
router.put('/perfil', authenticate, clienteController.actualizarPerfil);

// Direcciones del cliente
router.get('/direcciones', authenticate, clienteController.obtenerDirecciones);
router.post('/direcciones', authenticate, clienteController.crearDireccion);
router.put('/direcciones/:direccionId', authenticate, clienteController.actualizarDireccion);
router.delete('/direcciones/:direccionId', authenticate, clienteController.eliminarDireccion);

// Lista de deseos
router.get('/lista-deseos', authenticate, clienteController.obtenerListaDeseos);
router.post('/lista-deseos', authenticate, clienteController.agregarAListaDeseos);
router.delete('/lista-deseos/:productoId', authenticate, clienteController.eliminarDeListaDeseos);

// Rutas de admin
router.get('/:id', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_VENTAS, Role.VENDEDOR), clienteController.obtener);
router.get('/:id/historial-compras', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_VENTAS), clienteController.obtenerHistorialCompras);
router.patch('/:id/toggle-activo', authenticate, requireRole(Role.ADMINISTRADOR), clienteController.toggleActivo);

export default router;