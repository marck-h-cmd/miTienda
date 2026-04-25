import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';

const router = Router();

/**
 * @swagger
 * /api/v1/webhooks/mercadopago:
 *   post:
 *     summary: Webhook para notificaciones de Mercado Pago
 *     tags: [Webhooks]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook procesado
 */
router.post('/mercadopago', webhookController.procesarWebhookMP);

export default router;