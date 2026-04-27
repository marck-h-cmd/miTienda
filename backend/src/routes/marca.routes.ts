import { Router } from 'express';
import { marcaController } from '../controllers/marca.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validator';
import { z } from 'zod';

const router = Router();

// Schemas de validación
const createMarcaSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  logo_url: z.string().url().optional(),
});

const updateMarcaSchema = z.object({
  nombre: z.string().min(3).optional(),
  logo_url: z.string().url().optional(),
  activo: z.boolean().optional(),
});

// Rutas públicas
router.get('/', authenticate, marcaController.listarMarcas.bind(marcaController));
router.get('/:id', authenticate, marcaController.obtenerMarca.bind(marcaController));

// Rutas protegidas
router.post(
  '/',
  authenticate,
  validateBody(createMarcaSchema),
  marcaController.crearMarca.bind(marcaController)
);

router.put(
  '/:id',
  authenticate,
  validateBody(updateMarcaSchema),
  marcaController.actualizarMarca.bind(marcaController)
);

router.delete(
  '/:id',
  authenticate,
  marcaController.eliminarMarca.bind(marcaController)
);

export default router;