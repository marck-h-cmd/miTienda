import { Router } from 'express';
import { productoController } from '../controllers/producto.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole, Role } from '../middlewares/rbac.middleware';
import { validateBody } from '../middlewares/validator';
import { crearProductoSchema, actualizarProductoSchema } from '../schemas/producto.schema';

const router = Router();

router.get('/', productoController.listar);
router.get('/:id', productoController.obtener);
router.post('/', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_INVENTARIO), validateBody(crearProductoSchema), productoController.crear);
router.put('/:id', authenticate, requireRole(Role.ADMINISTRADOR, Role.GERENTE_INVENTARIO), validateBody(actualizarProductoSchema), productoController.actualizar);
router.delete('/:id', authenticate, requireRole(Role.ADMINISTRADOR), productoController.eliminar);

export default router;