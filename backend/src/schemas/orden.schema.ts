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

export const actualizarEstadoSchema = z.object({
  estado: z.string().min(1, 'El estado es requerido'),
});

export const actualizarOrdenSchema = z.object({
  estado: z.string().min(1, 'El estado es requerido').optional(),
  metodoEnvioId: z.string().uuid().optional(),
  direccionEnvio: z
    .object({
      nombre: z.string().min(1, 'Nombre requerido'),
      apellido: z.string().min(1, 'Apellido requerido'),
      direccion: z.string().min(1, 'Dirección requerida'),
      ciudad: z.string().min(1, 'Ciudad requerida'),
      departamento: z.string().min(1, 'Departamento requerido'),
      codigo_postal: z.string().optional(),
      telefono: z.string().min(1, 'Teléfono requerido'),
    })
    .optional(),
});