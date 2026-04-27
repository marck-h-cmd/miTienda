import { Router } from 'express';
import { favoritosController } from '../controllers/favoritos.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validator';
import { agregarFavoritoSchema } from '../schemas/favoritos.schema';

const router = Router();

// Todos los endpoints de favoritos requieren autenticación
router.use(authenticate);

router.get('/', favoritosController.obtener);
router.post('/items', validateBody(agregarFavoritoSchema), favoritosController.agregar);
router.delete('/items/:productoId', favoritosController.eliminar);
router.delete('/', favoritosController.vaciar);

export default router;