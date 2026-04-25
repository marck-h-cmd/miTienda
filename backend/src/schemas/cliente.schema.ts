import { z } from 'zod';

export const actualizarPerfilSchema = z.object({
  nombre: z.string().min(2).optional(),
  apellido: z.string().min(2).optional(),
  telefono: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  genero: z.enum(['M', 'F', 'Otro']).optional(),
});

export const crearDireccionSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  apellido: z.string().min(2, 'El apellido es requerido'),
  direccion: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  ciudad: z.string().min(2, 'La ciudad es requerida'),
  departamento: z.string().min(2, 'El departamento es requerido'),
  codigo_postal: z.string().optional(),
  telefono: z.string().min(6, 'El teléfono es requerido'),
  es_principal: z.boolean().optional().default(false),
});

export const actualizarDireccionSchema = crearDireccionSchema.partial();

export const toggleActivoSchema = z.object({
  activo: z.boolean(),
});

export const listaDeseosSchema = z.object({
  producto_id: z.string().uuid('ID de producto inválido'),
});

export const filtroClienteSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  busqueda: z.string().optional(),
  segmento: z.enum(['nuevos', 'recurrentes', 'inactivos', 'vip']).optional(),
});