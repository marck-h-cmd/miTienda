import { z } from 'zod';

export const crearProductoSchema = z.object({
  sku: z.string().min(3),
  nombre: z.string().min(3),
  descripcion_corta: z.string().optional(),
  descripcion_larga: z.string().optional(),
  categoria_id: z.string().uuid(),
  subcategoria_id: z.string().uuid().optional(),
  marca_id: z.string().uuid().optional(),
  unidad_medida_id: z.string().uuid().optional(),
  precio_costo: z.number().positive(),
  precio_venta: z.number().positive(),
  precio_oferta: z.number().positive().optional(),
  peso: z.number().positive().optional(),
  stock_minimo: z.number().int().positive().default(5),
  estado: z.enum(['activo', 'inactivo', 'borrador']).default('activo'),
});

export const actualizarProductoSchema = crearProductoSchema.partial();

export const filtroProductoSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('12'),
  categoria: z.string().optional(),
  marca: z.string().optional(),
  precio_min: z.string().optional(),
  precio_max: z.string().optional(),
  busqueda: z.string().optional(),
  ordenar_por: z.enum(['nombre', 'precio', 'fecha', 'popularidad']).optional(),
});