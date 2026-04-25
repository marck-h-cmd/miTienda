"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var orden_controller_1 = require("../controllers/orden.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var rateLimiter_1 = require("../middlewares/rateLimiter");
var validator_1 = require("../middlewares/validator");
var orden_schema_1 = require("../schemas/orden.schema");
var router = (0, express_1.Router)();
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
router.post('/checkout', auth_middleware_1.authenticate, rateLimiter_1.checkoutLimiter, (0, validator_1.validateBody)(orden_schema_1.checkoutSchema), orden_controller_1.ordenController.iniciarCheckout);
router.get('/:id', auth_middleware_1.authenticate, orden_controller_1.ordenController.obtenerOrden);
router.post('/:id/cancelar', auth_middleware_1.authenticate, orden_controller_1.ordenController.cancelarOrden);
exports.default = router;
