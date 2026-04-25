import { Router } from 'express';
import { carritoController } from '../controllers/carrito.controller';
import { optionalAuth } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validator';
import { agregarItemSchema, actualizarItemSchema, aplicarCuponSchema } from '../schemas/carrito.schema';

const router = Router();

router.get('/', optionalAuth, carritoController.obtener);
router.post('/items', optionalAuth, validateBody(agregarItemSchema), carritoController.agregar);
router.put('/items/:itemId', optionalAuth, validateBody(actualizarItemSchema), carritoController.actualizar);
router.delete('/items/:itemId', optionalAuth, carritoController.eliminar);
router.delete('/:carritoId', optionalAuth, carritoController.vaciar);

export default router;