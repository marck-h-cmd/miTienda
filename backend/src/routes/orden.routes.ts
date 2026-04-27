import { Router } from 'express';
import { ordenController } from '../controllers/orden.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkoutLimiter } from '../middlewares/rateLimiter';
import { validateBody } from '../middlewares/validator';
import { checkoutSchema, actualizarEstadoSchema, actualizarOrdenSchema } from '../schemas/orden.schema';

const router = Router();

// ✅ Un solo authenticate para todas las rutas del módulo
router.use(authenticate);

// GET  /api/v1/ordenes
router.get('/', ordenController.listarOrdenes.bind(ordenController));

// ⚠️ Rutas estáticas ANTES de /:id o Express las interpreta como id
// GET  /api/v1/ordenes/opciones-envio
router.get('/opciones-envio', ordenController.obtenerOpcionesEnvio.bind(ordenController));

// POST /api/v1/ordenes/checkout
router.post(
  '/checkout',
  checkoutLimiter,
  validateBody(checkoutSchema),
  ordenController.iniciarCheckout.bind(ordenController)
);

// PATCH /api/v1/ordenes/:id
router.patch(
  '/:id',
  validateBody(actualizarOrdenSchema),
  ordenController.actualizarOrden.bind(ordenController)
);

// PATCH /api/v1/ordenes/:id/estado
router.patch(
  '/:id/estado',
  validateBody(actualizarEstadoSchema),
  ordenController.actualizarEstado.bind(ordenController)
);

// POST /api/v1/ordenes/:id/cancelar
router.post('/:id/cancelar', ordenController.cancelarOrden.bind(ordenController));

// GET  /api/v1/ordenes/:id
router.get('/:id', ordenController.obtenerOrden.bind(ordenController));

export default router;