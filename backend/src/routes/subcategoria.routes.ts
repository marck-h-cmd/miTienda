import { Router } from 'express';
import { subcategoriaController } from '../controllers/subcategoria.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validator';
import { z } from 'zod';

const router = Router();

const createSubcategoriaSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  categoria_id: z.string().uuid('ID de categoría inválido'),
});

const updateSubcategoriaSchema = z.object({
  nombre: z.string().min(3).optional(),
  categoria_id: z.string().uuid().optional(),
  activo: z.boolean().optional(),
});

router.get('/', authenticate, subcategoriaController.listarSubcategorias.bind(subcategoriaController));
router.get('/:id', authenticate, subcategoriaController.obtenerSubcategoria.bind(subcategoriaController));
router.post('/', authenticate, validateBody(createSubcategoriaSchema), subcategoriaController.crearSubcategoria.bind(subcategoriaController));
router.put('/:id', authenticate, validateBody(updateSubcategoriaSchema), subcategoriaController.actualizarSubcategoria.bind(subcategoriaController));
router.delete('/:id', authenticate, subcategoriaController.eliminarSubcategoria.bind(subcategoriaController));

export default router;