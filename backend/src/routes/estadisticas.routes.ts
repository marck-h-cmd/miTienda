import { Router } from 'express';
import { estadisticasController } from '../controllers/estadisticas.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole, Role } from '../middlewares/rbac.middleware';

const router = Router();

// Ruta de verificación (útil para debug)
router.get('/verificar', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_VENTAS), estadisticasController.verificarDatos);

router.get('/tendencia-ventas', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_VENTAS), estadisticasController.tendenciaVentas);
router.get('/analisis-abc', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_VENTAS), estadisticasController.analisisABC);
router.get('/analisis-rfm', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_VENTAS), estadisticasController.analisisRFM);

export default router;