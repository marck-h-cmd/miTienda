import { Router } from 'express';
import { categoriaController } from '../controllers/categoria.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validator';
import { z } from 'zod';

const router = Router();

// Schemas de validación
const createCategoriaSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  imagen_url: z.string().url().optional(),
});

const updateCategoriaSchema = z.object({
  nombre: z.string().min(3).optional(),
  descripcion: z.string().optional(),
  imagen_url: z.string().url().optional(),
  activo: z.boolean().optional(),
});

// Rutas públicas (cualquier usuario autenticado puede ver)
router.get('/', authenticate, categoriaController.listarCategorias.bind(categoriaController));
router.get('/:id', authenticate, categoriaController.obtenerCategoria.bind(categoriaController));

// Rutas protegidas (requieren autenticación)
router.post(
  '/',
  authenticate,
  validateBody(createCategoriaSchema),
  categoriaController.crearCategoria.bind(categoriaController)
);

router.put(
  '/:id',
  authenticate,
  validateBody(updateCategoriaSchema),
  categoriaController.actualizarCategoria.bind(categoriaController)
);

router.delete(
  '/:id',
  authenticate,
  categoriaController.eliminarCategoria.bind(categoriaController)
);

export default router;