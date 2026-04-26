import { z } from 'zod';

export const checkoutSchema = z.object({
  direccionEnvioId: z.string().min(1, 'Dirección requerida'),
  metodoEnvioId: z.string().min(1, 'Método de envío requerido'),
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