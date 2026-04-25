import { z } from 'zod';

export const ajusteStockSchema = z.object({
  producto_id: z.string().uuid('ID de producto inválido'),
  cantidad: z.number().int('La cantidad debe ser un número entero'),
  tipo: z.enum(['positivo', 'negativo'], {
    errorMap: () => ({ message: 'El tipo debe ser positivo o negativo' }),
  }),
  motivo: z.string().min(5, 'El motivo debe tener al menos 5 caracteres'),
});

export const ajusteInventarioSchema = z.object({
  motivo: z.string().min(5, 'El motivo debe tener al menos 5 caracteres'),
  detalles: z.array(
    z.object({
      producto_id: z.string().uuid('ID de producto inválido'),
      cantidad: z.number().int().positive('La cantidad debe ser positiva'),
      tipo: z.enum(['positivo', 'negativo']),
    })
  ).min(1, 'Debe incluir al menos un detalle'),
});

export const crearProveedorSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  ruc: z.string().optional(),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
});

export const actualizarProveedorSchema = crearProveedorSchema.partial();

export const crearOrdenCompraSchema = z.object({
  proveedor_id: z.string().uuid('ID de proveedor inválido'),
  detalles: z.array(
    z.object({
      producto_id: z.string().uuid('ID de producto inválido'),
      cantidad: z.number().int().positive('La cantidad debe ser positiva'),
      precio_unitario: z.number().positive('El precio debe ser positivo'),
    })
  ).min(1, 'Debe incluir al menos un detalle'),
});

export const filtroStockSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  stock_bajo: z.string().optional(),
  producto_id: z.string().optional(),
});

export const filtroMovimientosSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
});

export const filtroProveedoresSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
});

export const filtroOrdenesCompraSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
});