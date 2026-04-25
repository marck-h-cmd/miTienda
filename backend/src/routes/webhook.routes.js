"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var webhook_controller_1 = require("../controllers/webhook.controller");
var router = (0, express_1.Router)();
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
router.post('/mercadopago', webhook_controller_1.webhookController.procesarWebhookMP);
exports.default = router;
