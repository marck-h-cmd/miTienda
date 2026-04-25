import { z } from 'zod';

export const agregarItemSchema = z.object({
  producto_id: z.string().uuid(),
  cantidad: z.number().int().positive(),
});

export const actualizarItemSchema = z.object({
  cantidad: z.number().int().positive(),
});

export const aplicarCuponSchema = z.object({
  codigo: z.string().min(3),
});