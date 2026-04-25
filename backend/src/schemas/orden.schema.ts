import { z } from 'zod';

export const checkoutSchema = z.object({
  direccionEnvioId: z.string().uuid('ID de dirección inválido'),
  metodoEnvioId: z.string().uuid('ID de método de envío inválido'),
  cuponCodigo: z.string().optional(),
});

export const crearOrdenSchema = z.object({
  items: z.array(
    z.object({
      productoId: z.string().uuid(),
      cantidad: z.number().int().positive(),
    })
  ),
  direccionEnvioId: z.string().uuid(),
  metodoPago: z.string(),
});