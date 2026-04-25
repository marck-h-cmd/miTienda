
import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole, Role } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/kpis', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_VENTAS), dashboardController.obtenerKPIs);
router.get('/ventas-diarias', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_VENTAS), dashboardController.ventasDiarias);
router.get('/ventas-categoria', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_VENTAS), dashboardController.ventasPorCategoria);
router.get('/top-productos', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_VENTAS), dashboardController.topProductos);

export default router;