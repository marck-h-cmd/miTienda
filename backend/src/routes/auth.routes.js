"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var auth_controller_1 = require("../controllers/auth.controller");
var validator_1 = require("../middlewares/validator");
var auth_schema_1 = require("../schemas/auth.schema");
var rateLimiter_1 = require("../middlewares/rateLimiter");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Autenticación]
 */
router.post('/register', rateLimiter_1.authLimiter, (0, validator_1.validateBody)(auth_schema_1.registerSchema), auth_controller_1.authController.register);
/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 */
router.post('/login', rateLimiter_1.authLimiter, (0, validator_1.validateBody)(auth_schema_1.loginSchema), auth_controller_1.authController.login);
router.post('/refresh-token', (0, validator_1.validateBody)(auth_schema_1.refreshTokenSchema), auth_controller_1.authController.refreshToken);
router.post('/logout', auth_controller_1.authController.logout);
exports.default = router;
