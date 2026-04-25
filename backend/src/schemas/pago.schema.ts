import { z } from 'zod';

export const checkoutSchema = z.object({
  direccionEnvioId: z.string().uuid('ID de dirección inválido'),
  metodoEnvioId: z.string().uuid('ID de método de envío inválido'),
  cuponCodigo: z.string().optional(),
});