import { Router } from 'express';
import { unidadMedidaController } from '../controllers/unidadMedida.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validator';
import { z } from 'zod';

const router = Router();

const createUnidadMedidaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  abreviatura: z.string().min(1, 'La abreviatura es requerida'),
});

const updateUnidadMedidaSchema = z.object({
  nombre: z.string().min(2).optional(),
  abreviatura: z.string().min(1).optional(),
  activo: z.boolean().optional(),
});

router.get('/', authenticate, unidadMedidaController.listarUnidadesMedida.bind(unidadMedidaController));
router.get('/:id', authenticate, unidadMedidaController.obtenerUnidadMedida.bind(unidadMedidaController));
router.post('/', authenticate, validateBody(createUnidadMedidaSchema), unidadMedidaController.crearUnidadMedida.bind(unidadMedidaController));
router.put('/:id', authenticate, validateBody(updateUnidadMedidaSchema), unidadMedidaController.actualizarUnidadMedida.bind(unidadMedidaController));
router.delete('/:id', authenticate, unidadMedidaController.eliminarUnidadMedida.bind(unidadMedidaController));

export default router;