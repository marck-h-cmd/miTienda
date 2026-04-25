import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validator';
import { registerSchema, loginSchema, refreshTokenSchema } from '../schemas/auth.schema';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Autenticación]
 */
router.post('/register', authLimiter, validateBody(registerSchema), authController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 */
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);

router.post('/refresh-token', validateBody(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authController.logout);

export default router;