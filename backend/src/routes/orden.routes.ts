import { Router } from 'express';
import { ordenController } from '../controllers/orden.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { checkoutLimiter } from '../middlewares/rateLimiter';
import { validateBody } from '../middlewares/validator';
import { checkoutSchema } from '../schemas/orden.schema';

const router = Router();

/**
 * @swagger
 * /api/v1/ordenes/checkout:
 *   post:
 *     summary: Iniciar checkout y crear preferencia de pago en Mercado Pago
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - direccionEnvioId
 *               - metodoEnvioId
 *             properties:
 *               direccionEnvioId:
 *                 type: string
 *               metodoEnvioId:
 *                 type: string
 *               cuponCodigo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Checkout iniciado, retorna URL de pago de Mercado Pago
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     ordenId:
 *                       type: string
 *                     total:
 *                       type: number
 *                     initPoint:
 *                       type: string
 *                     sandboxInitPoint:
 *                       type: string
 */
router.post(
  '/checkout',
  authenticate,
  checkoutLimiter,
  validateBody(checkoutSchema),
  ordenController.iniciarCheckout
);

router.get('/:id', authenticate, ordenController.obtenerOrden);
router.post('/:id/cancelar', authenticate, ordenController.cancelarOrden);

export default router;