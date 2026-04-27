import { z } from 'zod';

export const agregarFavoritoSchema = z.object({
  producto_id: z.string().uuid('ID de producto inválido'),
});